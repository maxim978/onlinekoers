-- ============================================================
-- The Previewer — Database Schema
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- LEADS
-- ============================================================
CREATE TABLE leads (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  slug            TEXT        UNIQUE NOT NULL,          -- URL-safe identifier, e.g. "van-der-berg-hoveniers"
  company_name    TEXT        NOT NULL,
  category        TEXT,                                 -- "Hoveniers" | "Keukens" | "Aannemer" | etc.

  -- Branding
  logo_url        TEXT,
  photos          TEXT[]      DEFAULT '{}',             -- Array of image URLs
  primary_color   TEXT        DEFAULT '#1a1a1a',
  secondary_color TEXT        DEFAULT '#ffffff',
  accent_color    TEXT        DEFAULT '#d4a853',

  -- Content
  headline        TEXT,
  subheadline     TEXT,
  description     TEXT,

  -- Style engine
  style_instructions TEXT,                             -- "minimalistisch" | "industrieel" | "warm/luxe" | free text

  -- Contact
  contact_email   TEXT,
  contact_phone   TEXT,
  website_url     TEXT,
  address         TEXT,

  -- Meta
  is_active       BOOLEAN     DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TRACKING: SESSIONS
-- ============================================================
CREATE TABLE page_sessions (
  id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id          UUID        NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  session_id       TEXT        NOT NULL,               -- Random ID generated in browser
  ip_address       TEXT,
  user_agent       TEXT,
  referrer         TEXT,
  is_unique        BOOLEAN     DEFAULT true,            -- First visit from this session_id
  started_at       TIMESTAMPTZ DEFAULT NOW(),
  last_ping_at     TIMESTAMPTZ DEFAULT NOW(),
  ended_at         TIMESTAMPTZ,
  duration_seconds INTEGER
);

CREATE INDEX idx_sessions_lead_id ON page_sessions(lead_id);
CREATE INDEX idx_sessions_session_id ON page_sessions(session_id);

-- ============================================================
-- TRACKING: EVENTS (clicks, scroll milestones)
-- ============================================================
CREATE TABLE page_events (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id      UUID        NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  session_id   TEXT        NOT NULL,
  event_type   TEXT        NOT NULL,                   -- "cta_click" | "contact_click" | "scroll_50" | "scroll_90"
  event_data   JSONB       DEFAULT '{}',               -- Flexible metadata
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_lead_id ON page_events(lead_id);

-- ============================================================
-- LEAD STATS (denormalized for fast dashboard queries)
-- ============================================================
CREATE TABLE lead_stats (
  lead_id              UUID    PRIMARY KEY REFERENCES leads(id) ON DELETE CASCADE,
  view_count           INTEGER DEFAULT 0,
  unique_view_count    INTEGER DEFAULT 0,
  cta_click_count      INTEGER DEFAULT 0,
  contact_click_count  INTEGER DEFAULT 0,
  avg_duration_seconds NUMERIC(10,2) DEFAULT 0,
  last_viewed_at       TIMESTAMPTZ,
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ADMIN USERS (Supabase Auth handles passwords; this is profile data)
-- ============================================================
CREATE TABLE admin_users (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-create lead_stats row when a lead is inserted
CREATE OR REPLACE FUNCTION create_lead_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO lead_stats(lead_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_create_lead_stats
  AFTER INSERT ON leads
  FOR EACH ROW EXECUTE FUNCTION create_lead_stats();

-- Auto-update leads.updated_at
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE leads          ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_sessions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_events    ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_stats     ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users    ENABLE ROW LEVEL SECURITY;

-- Public: read active leads by slug (for preview pages)
CREATE POLICY "Public read active leads"
  ON leads FOR SELECT
  USING (is_active = true);

-- Public: insert sessions & events (tracking — no auth required)
CREATE POLICY "Public insert sessions"
  ON page_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public update own session"
  ON page_sessions FOR UPDATE
  USING (true);

CREATE POLICY "Public insert events"
  ON page_events FOR INSERT
  WITH CHECK (true);

-- Public: read lead_stats (for preview page own stats badge if needed)
CREATE POLICY "Public read lead_stats"
  ON lead_stats FOR SELECT
  USING (true);

-- Admin: full access via service_role (bypasses RLS by default)
-- For authenticated admin users:
CREATE POLICY "Admins full access leads"
  ON leads FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins full access sessions"
  ON page_sessions FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins full access events"
  ON page_events FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins full access lead_stats"
  ON lead_stats FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins manage admin_users"
  ON admin_users FOR ALL
  USING (auth.role() = 'authenticated');

-- ============================================================
-- SEED: Example lead
-- ============================================================
INSERT INTO leads (
  slug, company_name, category,
  logo_url, photos,
  primary_color, secondary_color, accent_color,
  headline, subheadline, description,
  style_instructions,
  contact_email, contact_phone
) VALUES (
  'van-der-berg-hoveniers',
  'Van der Berg Hoveniers',
  'Hoveniers',
  null,
  ARRAY[
    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200',
    'https://images.unsplash.com/photo-1585320806297-9794b3e4aaae?w=800'
  ],
  '#2d5016',
  '#f5f0e8',
  '#8fbc3d',
  'Uw tuin, onze passie.',
  'Al 25 jaar creëren wij groene droomtuinen in de regio Utrecht.',
  'Van der Berg Hoveniers staat voor vakmanschap, duurzaamheid en persoonlijk contact. Wij ontwerpen en onderhouden tuinen die écht bij u passen.',
  'warm/luxe',
  'info@vanderberghoveniers.nl',
  '030-123 4567'
);
