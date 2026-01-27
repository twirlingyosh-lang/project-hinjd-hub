import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type AIAction = 'classify_message' | 'summarize_notes' | 'suggest_next_steps' | 'generate_email' | 'analyze_sentiment';

interface AIContext {
  stage?: string;
  value?: number;
  client_name?: string;
  deal_title?: string;
}

export const useCRMAI = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const callAI = async <T>(action: AIAction, content: string, context?: AIContext): Promise<T | null> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('crm-ai-assistant', {
        body: { action, content, context }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      return data.result as T;
    } catch (error) {
      console.error('AI Error:', error);
      toast({
        title: 'AI Error',
        description: error instanceof Error ? error.message : 'Failed to process AI request',
        variant: 'destructive'
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const classifyMessage = async (content: string) => {
    return callAI<{ category: string; confidence: number }>('classify_message', content);
  };

  const summarizeNotes = async (content: string) => {
    return callAI<string>('summarize_notes', content);
  };

  const suggestNextSteps = async (content: string, context?: AIContext) => {
    return callAI<string[]>('suggest_next_steps', content, context);
  };

  const generateEmail = async (content: string, context?: AIContext) => {
    return callAI<string>('generate_email', content, context);
  };

  const analyzeSentiment = async (content: string) => {
    return callAI<{ score: number; label: string }>('analyze_sentiment', content);
  };

  return {
    loading,
    classifyMessage,
    summarizeNotes,
    suggestNextSteps,
    generateEmail,
    analyzeSentiment
  };
};
