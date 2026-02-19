import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Snippet {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  code: string;
  language: string;
  tags: string[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export const useSnippets = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: snippets = [], isLoading } = useQuery({
    queryKey: ['snippets', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('code_snippets' as any)
        .select('*')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as Snippet[];
    },
    enabled: !!user,
  });

  const createSnippet = useMutation({
    mutationFn: async (snippet: Omit<Snippet, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('code_snippets' as any)
        .insert({ ...snippet, user_id: user!.id } as any)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as Snippet;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['snippets'] });
      toast.success('Snippet saved!');
    },
    onError: () => toast.error('Failed to save snippet'),
  });

  const updateSnippet = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Snippet> & { id: string }) => {
      const { data, error } = await supabase
        .from('code_snippets' as any)
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as Snippet;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['snippets'] });
      toast.success('Snippet updated!');
    },
    onError: () => toast.error('Failed to update snippet'),
  });

  const deleteSnippet = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('code_snippets' as any)
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['snippets'] });
      toast.success('Snippet deleted');
    },
    onError: () => toast.error('Failed to delete snippet'),
  });

  return { snippets, isLoading, createSnippet, updateSnippet, deleteSnippet };
};
