import type { APIRoute } from 'astro';
import { supabaseAdmin } from '@/lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  const headers = { 'Content-Type': 'application/json' };

  let body: { lead_id: string; session_id: string; referrer?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers });
  }

  const { lead_id, session_id, referrer } = body;
  if (!lead_id || !session_id) {
    return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400, headers });
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;
  const user_agent = request.headers.get('user-agent') ?? null;

  // Check if this session already exists (unique visit detection)
  const { data: existing } = await supabaseAdmin
    .from('page_sessions')
    .select('id, is_unique')
    .eq('session_id', session_id)
    .eq('lead_id', lead_id)
    .maybeSingle();

  const is_unique = !existing;

  if (!existing) {
    await supabaseAdmin.from('page_sessions').insert({
      lead_id,
      session_id,
      ip_address: ip,
      user_agent,
      referrer: referrer ?? null,
      is_unique: true,
    });
  } else {
    // Update last_ping_at to mark activity
    await supabaseAdmin
      .from('page_sessions')
      .update({ last_ping_at: new Date().toISOString() })
      .eq('session_id', session_id)
      .eq('lead_id', lead_id);
  }

  // Update denormalized stats
  if (is_unique) {
    await supabaseAdmin.rpc('increment_unique_views', { p_lead_id: lead_id });
  }
  await supabaseAdmin.rpc('increment_view_count', { p_lead_id: lead_id });

  return new Response(JSON.stringify({ ok: true, is_unique }), { status: 200, headers });
};
