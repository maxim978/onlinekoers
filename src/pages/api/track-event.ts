import type { APIRoute } from 'astro';
import { supabaseAdmin } from '@/lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  const headers = { 'Content-Type': 'application/json' };

  let body: { lead_id: string; session_id: string; event_type: string; event_data?: Record<string, unknown> };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers });
  }

  const { lead_id, session_id, event_type, event_data } = body;
  if (!lead_id || !session_id || !event_type) {
    return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400, headers });
  }

  await supabaseAdmin.from('page_events').insert({
    lead_id,
    session_id,
    event_type,
    event_data: event_data ?? {},
  });

  // Update denormalized stats for CTA / contact clicks
  if (event_type === 'cta_click') {
    await supabaseAdmin.rpc('increment_cta_clicks', { p_lead_id: lead_id });
  } else if (event_type === 'contact_click') {
    await supabaseAdmin.rpc('increment_contact_clicks', { p_lead_id: lead_id });
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
};
