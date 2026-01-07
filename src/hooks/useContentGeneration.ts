import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type ContentType = 'description' | 'summary' | 'report' | 'custom';

interface GenerateContentOptions {
  prompt: string;
  type?: ContentType;
  context?: string;
  maxTokens?: number;
}

interface UseContentGenerationReturn {
  generateContent: (options: GenerateContentOptions) => Promise<string | null>;
  isGenerating: boolean;
  error: string | null;
}

export const useContentGeneration = (): UseContentGenerationReturn => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateContent = useCallback(async (options: GenerateContentOptions): Promise<string | null> => {
    const { prompt, type = 'custom', context, maxTokens = 1000 } = options;

    if (!prompt.trim()) {
      toast.error('Please provide a prompt');
      return null;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('generate-content', {
        body: { prompt, type, context, maxTokens }
      });

      if (fnError) {
        throw new Error(fnError.message || 'Failed to generate content');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (!data?.content) {
        throw new Error('No content generated');
      }

      return data.content;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate content';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    generateContent,
    isGenerating,
    error
  };
};
