import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { lead_id, user_agent } = body as Record<string, string>;

  if (!lead_id) {
    return new Response(JSON.stringify({ error: 'lead_id required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { data, error } = await supabase
    .from('analytics')
    .insert({
      lead_id,
      user_agent: user_agent || null,
      duration_seconds: 0,
      scroll_depth: 0,
      clicks: {},
    })
    .select('id')
    .single();

  if (error || !data) {
    return new Response(JSON.stringify({ error: 'Failed to create session' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ id: data.id }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
