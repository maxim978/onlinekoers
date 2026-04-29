import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey ?? supabaseAnonKey,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export type Lead = {
  id: string;
  company_name: string;
  slug: string;
  industry: string | null;
  primary_color: string;
  secondary_color: string;
  logo_url: string | null;
  images: string[];
  style_instructions: string | null;
  status: 'Concept' | 'Live' | 'Bekeken';
  created_at: string;
  updated_at: string;
};

export type Analytics = {
  id: string;
  lead_id: string;
  timestamp: string;
  duration_seconds: number;
  scroll_depth: number;
  clicks: Record<string, number>;
  user_agent: string | null;
};

export type LeadWithAnalytics = Lead & {
  total_views: number;
  avg_duration: number;
};
