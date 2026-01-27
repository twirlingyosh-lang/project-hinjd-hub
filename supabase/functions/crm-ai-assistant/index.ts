import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const LOVABLE_API_URL = 'https://api.lovable.dev/v1/chat/completions';

interface AIRequest {
  action: 'classify_message' | 'summarize_notes' | 'suggest_next_steps' | 'generate_email' | 'analyze_sentiment';
  content: string;
  context?: Record<string, unknown>;
}

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CRM-AI] ${step}${detailsStr}`);
};

async function callLovableAI(systemPrompt: string, userPrompt: string): Promise<string> {
  logStep('Calling Lovable AI');
  
  const response = await fetch(LOVABLE_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'openai/gpt-5-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    logStep('AI API Error', { status: response.status, error });
    throw new Error(`AI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

async function classifyMessage(content: string): Promise<{ category: string; confidence: number }> {
  const systemPrompt = `You are a message classifier for a CRM system. Classify messages into one of these categories: sales, support, billing, general. Respond with JSON only: {"category": "category_name", "confidence": 0.0-1.0}`;
  
  const result = await callLovableAI(systemPrompt, content);
  try {
    return JSON.parse(result);
  } catch {
    return { category: 'general', confidence: 0.5 };
  }
}

async function summarizeNotes(content: string): Promise<string> {
  const systemPrompt = `You are a CRM assistant. Summarize the following client notes into a concise 2-3 sentence summary highlighting key points, concerns, and action items.`;
  return await callLovableAI(systemPrompt, content);
}

async function suggestNextSteps(content: string, context?: Record<string, unknown>): Promise<string[]> {
  const systemPrompt = `You are a sales advisor. Based on the deal information provided, suggest 3-5 actionable next steps to move the deal forward. Respond with a JSON array of strings only.`;
  
  const prompt = context 
    ? `Deal: ${content}\nStage: ${context.stage}\nValue: ${context.value}\nClient: ${context.client_name}`
    : content;
  
  const result = await callLovableAI(systemPrompt, prompt);
  try {
    return JSON.parse(result);
  } catch {
    return [result];
  }
}

async function generateEmail(content: string, context?: Record<string, unknown>): Promise<string> {
  const systemPrompt = `You are a professional sales representative. Generate a personalized follow-up email based on the context provided. Keep it professional, concise, and action-oriented. Include a clear call-to-action.`;
  
  const prompt = context
    ? `Client: ${context.client_name}\nDeal: ${context.deal_title}\nStage: ${context.stage}\nNotes: ${content}`
    : content;
  
  return await callLovableAI(systemPrompt, prompt);
}

async function analyzeSentiment(content: string): Promise<{ score: number; label: string }> {
  const systemPrompt = `You are a sentiment analyzer. Analyze the sentiment of the following text and respond with JSON only: {"score": -100 to 100, "label": "positive/neutral/negative"}`;
  
  const result = await callLovableAI(systemPrompt, content);
  try {
    return JSON.parse(result);
  } catch {
    return { score: 0, label: 'neutral' };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep('Function started');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { action, content, context }: AIRequest = await req.json();
    logStep('Processing action', { action });

    let result: unknown;

    switch (action) {
      case 'classify_message':
        result = await classifyMessage(content);
        break;
      case 'summarize_notes':
        result = await summarizeNotes(content);
        break;
      case 'suggest_next_steps':
        result = await suggestNextSteps(content, context);
        break;
      case 'generate_email':
        result = await generateEmail(content, context);
        break;
      case 'analyze_sentiment':
        result = await analyzeSentiment(content);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    logStep('Action completed', { action });

    return new Response(JSON.stringify({ success: true, result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep('ERROR', { message: errorMessage });
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
