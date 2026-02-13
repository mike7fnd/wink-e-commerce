'use client';

import { useState, useEffect } from 'react';
import { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';

export type WithId<T> = T & { id: string };

export interface UseCollectionResult<T> {
  data: WithId<T>[] | null;
  isLoading: boolean;
  error: Error | null;
}

interface UseCollectionOptions {
  table: string;
  schema?: string;
  filter?: {
    column: string;
    operator: string;
    value: any;
  };
  orderBy?: {
    column: string;
    ascending?: boolean;
  };
}

/**
 * React hook to fetch and subscribe to a Supabase table in real-time.
 */
export function useCollection<T = any>(
  supabase: SupabaseClient,
  options: UseCollectionOptions | null,
  deps: any[] = []
): UseCollectionResult<T> {
  const [data, setData] = useState<WithId<T>[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!supabase || !options) {
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
        let query = supabase.from(options.table).select('*', { count: 'exact' });

        if (options.filter) {
          query = query.filter(options.filter.column, options.filter.operator, options.filter.value);
        }

        if (options.orderBy) {
          query = query.order(options.orderBy.column, { ascending: options.orderBy.ascending ?? true });
        }

        const { data: result, error: queryError } = await query;

        if (queryError) {
          throw queryError;
        }

        if (isMounted) {
          // Add id to each item if not present
          const dataWithId = (result || []).map((item: any) => ({
            ...item,
            id: item.id,
          }));
          setData(dataWithId);
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
        .channel(`${options.table}-changes`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: options.schema || 'public',
            table: options.table,
          },
          (payload) => {
            // Handle different event types
            if (payload.eventType === 'INSERT') {
              setData((prev) => {
                if (!prev) return [{ ...payload.new, id: payload.new.id }] as WithId<T>[];
                return [...prev, { ...payload.new, id: payload.new.id }] as WithId<T>[];
              });
            } else if (payload.eventType === 'UPDATE') {
              setData((prev) => {
                if (!prev) return null;
                return prev.map((item) =>
                  item.id === payload.new.id ? { ...payload.new, id: payload.new.id } as WithId<T> : item
                );
              });
            } else if (payload.eventType === 'DELETE') {
              setData((prev) => {
                if (!prev) return null;
                return prev.filter((item) => item.id !== payload.old.id);
              });
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
