'use client';

import { useState, useCallback } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';

interface UseMutationOptions {
  table: string;
}

interface InsertOptions<T> {
  data: T;
}

interface UpdateOptions<T> {
  id: string;
  data: Partial<T>;
}

interface DeleteOptions {
  id: string;
}

/**
 * React hook for performing CRUD operations on Supabase.
 */
export function useMutations<T = any>(supabase: SupabaseClient, options: UseMutationOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const insert = useCallback(async (insertOptions: InsertOptions<T>) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: insertError } = await supabase
        .from(options.table)
        .insert(insertOptions.data)
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      setIsLoading(false);
      return { data, error: null };
    } catch (err: any) {
      setError(err);
      setIsLoading(false);
      return { data: null, error: err };
    }
  }, [supabase, options.table]);

  const update = useCallback(async (updateOptions: UpdateOptions<T>) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: updateError } = await supabase
        .from(options.table)
        .update(updateOptions.data)
        .eq('id', updateOptions.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      setIsLoading(false);
      return { data, error: null };
    } catch (err: any) {
      setError(err);
      setIsLoading(false);
      return { data: null, error: err };
    }
  }, [supabase, options.table]);

  const remove = useCallback(async (deleteOptions: DeleteOptions) => {
    setIsLoading(true);
    setError(null);
    try {
      const { error: deleteError } = await supabase
        .from(options.table)
        .delete()
        .eq('id', deleteOptions.id);

      if (deleteError) {
        throw deleteError;
      }

      setIsLoading(false);
      return { error: null };
    } catch (err: any) {
      setError(err);
      setIsLoading(false);
      return { error: err };
    }
  }, [supabase, options.table]);

  return {
    insert,
    update,
    remove,
    isLoading,
    error,
  };
}
