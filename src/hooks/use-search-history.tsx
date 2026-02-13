
'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSupabaseClient } from '@/supabase/client';
import { useUser } from '@/supabase/provider';

const MAX_HISTORY_LENGTH = 5;

export function useSearchHistory() {
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();
  const supabase = getSupabaseClient();

  // Load search history from Supabase
  useEffect(() => {
    if (!user?.uid) {
      setSearchHistory([]);
      setIsInitialized(true);
      return;
    }

    const loadSearchHistory = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('search_history')
          .select('search_term')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(MAX_HISTORY_LENGTH);

        if (error) throw error;

        const terms: string[] = (data || []).map((item: any) => item.search_term);
        setSearchHistory(terms);
      } catch (error) {
        console.error('Failed to load search history from Supabase:', error);
        setSearchHistory([]);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    loadSearchHistory();
  }, [user?.id, supabase]);

  const addSearchTerm = useCallback(
    async (term: string) => {
      if (!term.trim()) return;
      if (!user?.id) {
        console.error('User not authenticated');
        return;
      }

      try {
        setIsLoading(true);

        // Insert new search term
        const { error } = await supabase
          .from('search_history')
          .insert({
            user_id: user.id,
            search_term: term.trim(),
          });

        if (error) throw error;

        // Update local state
        setSearchHistory((prevHistory) => {
          const newHistory = [
            term.trim(),
            ...prevHistory.filter(
              (t) => t.toLowerCase() !== term.toLowerCase()
            ),
          ];
          return Array.from(new Set(newHistory)).slice(0, MAX_HISTORY_LENGTH);
        });
      } catch (error) {
        console.error('Failed to add search term:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [user?.id, supabase]
  );

  const clearSearchHistory = useCallback(async () => {
    if (!user?.id) {
      console.error('User not authenticated');
      return;
    }

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('search_history')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setSearchHistory([]);
    } catch (error) {
      console.error('Failed to clear search history:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid, supabase]);

  return {
    searchHistory,
    addSearchTerm,
    clearSearchHistory,
    isLoading,
  };
}
