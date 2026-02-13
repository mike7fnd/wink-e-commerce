'use client';

import { useState, useEffect } from 'react';
import { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';

export type WithId<T> = T & { id: string };

export interface UseDocResult<T> {
  data: WithId<T> | null;
  isLoading: boolean;
  error: Error | null;
}

interface UseDocOptions {
  table: string;
  id: string;
  schema?: string;
}

/**
 * React hook to fetch and subscribe to a single Supabase document in real-time.
 */
export function useDoc<T = any>(
  supabase: SupabaseClient,
  options: UseDocOptions | null,
  deps: any[] = []
): UseDocResult<T> {
  const [data, setData] = useState<WithId<T> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!supabase || !options || !options.id) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    let isMounted = true;
    let channel: RealtimeChannel | null = null;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data: result, error: queryError } = await supabase
          .from(options.table)
          .select('*')
          .eq('id', options.id)
          .single();

        if (queryError) {
          throw queryError;
        }

        if (isMounted && result) {
          setData({ ...result, id: result.id } as WithId<T>);
        } else if (isMounted) {
          setData(null);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // Set up realtime subscription
    const setupRealtime = () => {
      channel = supabase
        .channel(`${options.table}-${options.id}-changes`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: options.schema || 'public',
            table: options.table,
            filter: `id=eq.${options.id}`,
          },
          (payload) => {
            if (payload.eventType === 'UPDATE') {
              setData({ ...payload.new, id: payload.new.id } as WithId<T>);
            } else if (payload.eventType === 'DELETE') {
              setData(null);
            }
          }
        )
        .subscribe();
    };

    fetchData();
    setupRealtime();

    return () => {
      isMounted = false;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [supabase, options, ...deps]);

  return { data, isLoading, error };
}
