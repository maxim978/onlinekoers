import type { APIRoute } from 'astro';
import { supabaseAdmin } from '@/lib/supabase';

// Called by sendBeacon on page unload — records final session duration
export const POST: APIRoute = async ({ request }) => {
  let body: { lead_id: string; session_id: string; duration_seconds: number };
  try {
    const text = await request.text();
    body = JSON.parse(text);
  } catch {
    return new Response(null, { status: 204 });
  }

  const { lead_id, session_id, duration_seconds } = body;
  if (!lead_id || !session_id || typeof duration_seconds !== 'number') {
    return new Response(null, { status: 204 });
  }

  const safeSeconds = Math.min(Math.max(Math.round(duration_seconds), 0), 86400);

  await supabaseAdmin
    .from('page_sessions')
    .update({
      ended_at: new Date().toISOString(),
      duration_seconds: safeSeconds,
    })
    .eq('session_id', session_id)
    .eq('lead_id', lead_id);

  // Recompute avg duration for this lead
  await supabaseAdmin.rpc('update_avg_duration', { p_lead_id: lead_id });

  return new Response(null, { status: 204 });
};
