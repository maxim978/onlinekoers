import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check .env');
}

// Public client — used in browser & SSR for read operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client — server-side only, bypasses RLS
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey ?? supabaseAnonKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ---- Types ----
export interface LeadService {
  icon: string;
  title: string;
  description: string;
}

export interface Lead {
  id: string;
  slug: string;
  company_name: string;
  category: string | null;
  logo_url: string | null;
  photos: string[];
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  headline: string | null;
  subheadline: string | null;
  description: string | null;
  style_instructions: string | null;
  services: LeadService[];
  contact_email: string | null;
  contact_phone: string | null;
  website_url: string | null;
  address: string | null;
  is_active: boolean;
  created_at: string;
}

export interface LeadStats {
  lead_id: string;
  view_count: number;
  unique_view_count: number;
  cta_click_count: number;
  contact_click_count: number;
  avg_duration_seconds: number;
  last_viewed_at: string | null;
}

export interface LeadWithStats extends Lead {
  lead_stats: LeadStats | null;
}
