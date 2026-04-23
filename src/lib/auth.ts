import { supabase } from './supabase';
import type { AstroCookies } from 'astro';

export async function requireAdmin(cookies: AstroCookies): Promise<boolean> {
  const accessToken = cookies.get('sb-access-token')?.value;
  if (!accessToken) return false;

  const { data, error } = await supabase.auth.getUser(accessToken);
  return !error && !!data.user;
}
