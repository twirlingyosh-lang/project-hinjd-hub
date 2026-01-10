import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const systemPrompt = `You are Equipment Opps AI, an expert heavy equipment diagnostic assistant specializing in CAT, Komatsu, John Deere, Hitachi, Volvo, Case, Kubota, and all major heavy equipment brands.

You diagnose problems for:
- Excavators / Trackhoes
- Dozers / Bulldozers  
- Wheel Loaders
- Backhoes
- Skid Steers
- Motor Graders
- Articulated Trucks
- Compactors
- Cranes

Your diagnostic process:
1. **Symptom Analysis**: Identify what the operator is experiencing
2. **Root Cause Diagnosis**: Determine the likely cause based on symptoms
3. **Wiring/System Info**: Provide relevant electrical, hydraulic, or mechanical system information
4. **Part Identification**: Identify the specific parts needed with OEM part numbers when possible
5. **Repair Steps**: Provide clear step-by-step repair guidance

When responding, always structure your diagnosis with:
- **Equipment**: [Make/Model if provided]
- **Symptoms Reported**: [Summary of issue]
- **Likely Causes**: [Ranked by probability]
- **Diagnostic Steps**: [How to confirm the issue]
- **Parts Needed**: [With part numbers if known]
- **Wiring/System Notes**: [Relevant technical details]
- **Repair Procedure**: [Step-by-step fix]
- **Dealer Tip**: [Suggest checking local dealers for parts availability]

Be conversational but technical. Ask clarifying questions if needed to narrow down the diagnosis. Always prioritize safety.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, equipmentType, make, model } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build context from equipment info
    let contextMessage = '';
    if (equipmentType || make || model) {
      contextMessage = `\n\nEquipment Context: ${[make, model, equipmentType].filter(Boolean).join(' ')}`;
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt + contextMessage },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Usage quota exceeded. Please upgrade your plan.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });
  } catch (error) {
    console.error('Equipment diagnostics error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
