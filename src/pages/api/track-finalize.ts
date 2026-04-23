import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  let body: unknown;

  try {
    const text = await request.text();
    body = JSON.parse(text);
  } catch {
    return new Response(null, { status: 400 });
  }

  const { id, duration_seconds, scroll_depth, clicks } = body as {
    id: string;
    duration_seconds: number;
    scroll_depth: number;
    clicks: Record<string, number>;
  };

  if (!id) return new Response(null, { status: 400 });

  await supabase
    .from('analytics')
    .update({
      duration_seconds: Math.max(0, Math.round(duration_seconds)),
      scroll_depth: Math.min(100, Math.max(0, Math.round(scroll_depth))),
      clicks: clicks || {},
    })
    .eq('id', id);

  // sendBeacon expects a 2xx response
  return new Response(null, { status: 204 });
};
