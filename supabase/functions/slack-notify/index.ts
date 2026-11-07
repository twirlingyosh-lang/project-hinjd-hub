import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3';

const schema = z.object({ event_id: z.string().uuid() }).strict();
const channel = 'C0A325097HR';
const response = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
const escape = (text: string) => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return response({ success: false }, 405);
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return response({ success: false }, 400);
    const db = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    // The UUID is an unguessable event capability; clients cannot read or create events.
    // Only stored, trusted trigger-generated messages can be sent. No caller content is used.
    const { data: event, error } = await db.from('slack_notifications').update({ status: 'sending' }).eq('id', parsed.data.event_id).eq('status', 'pending').select('id,message').maybeSingle();
    if (error) throw error;
    if (!event) return response({ success: true });
    const result = await fetch('https://connector-gateway.lovable.dev/slack/api/chat.postMessage', {
      method: 'POST',
      headers: { Authorization: `Bearer ${Deno.env.get('LOVABLE_API_KEY') ?? ''}`, 'X-Connection-Api-Key': Deno.env.get('SLACK_API_KEY') ?? '', 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel, text: escape(event.message), unfurl_links: false, unfurl_media: false, parse: 'none' }),
    });
    const raw = await result.text();
    let body: { ok?: boolean; error?: string } = {};
    try { body = JSON.parse(raw); } catch { /* Preserve upstream failure below. */ }
    if (!result.ok || !body.ok) {
      console.error(`Slack delivery failed [${result.status}]: ${raw}`);
      await db.from('slack_notifications').update({ status: 'failed', error: `${result.status}: ${body.error ?? 'Invalid Slack response'}` }).eq('id', event.id);
      return response({ success: false, status: result.status, error: body.error ?? 'Slack delivery failed' });
    }
    await db.from('slack_notifications').update({ status: 'delivered', delivered_at: new Date().toISOString(), error: null }).eq('id', event.id);
    return response({ success: true });
  } catch (error) {
    console.error('Slack notification failed', error instanceof Error ? error.message : 'Unknown error');
    return response({ success: false });
  }
});