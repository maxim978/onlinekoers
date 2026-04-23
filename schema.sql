-- ============================================================
-- OnlineKoers – Supabase SQL Schema
-- Voer dit uit in je Supabase SQL Editor
-- ============================================================

-- ── Leads tabel ─────────────────────────────────────────────
CREATE TABLE leads (
  id               UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name     VARCHAR(255) NOT NULL,
  slug             VARCHAR(255) UNIQUE NOT NULL,
  industry         VARCHAR(100),
  primary_color    VARCHAR(7)   DEFAULT '#f97316',
  secondary_color  VARCHAR(7)   DEFAULT '#0f172a',
  logo_url         TEXT,
  images           JSONB        DEFAULT '[]'::jsonb,
  style_instructions TEXT,
  status           VARCHAR(50)  DEFAULT 'Concept'
                   CHECK (status IN ('Concept', 'Live', 'Bekeken')),
  created_at       TIMESTAMPTZ  DEFAULT NOW(),
  updated_at       TIMESTAMPTZ  DEFAULT NOW()
);

-- ── Analytics tabel ─────────────────────────────────────────
CREATE TABLE analytics (
  id               UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id          UUID         REFERENCES leads(id) ON DELETE CASCADE,
  timestamp        TIMESTAMPTZ  DEFAULT NOW(),
  duration_seconds INTEGER      DEFAULT 0,
  scroll_depth     INTEGER      DEFAULT 0,   -- percentage 0-100
  clicks           JSONB        DEFAULT '{}'::jsonb,
  user_agent       TEXT
);

-- ── Indexes ──────────────────────────────────────────────────
CREATE INDEX idx_leads_slug       ON leads(slug);
CREATE INDEX idx_leads_status     ON leads(status);
CREATE INDEX idx_leads_industry   ON leads(industry);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX idx_analytics_lead   ON analytics(lead_id);
CREATE INDEX idx_analytics_time   ON analytics(timestamp DESC);

-- ── Auto-update updated_at ───────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Row Level Security ───────────────────────────────────────
ALTER TABLE leads     ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Iedereen mag Live/Bekeken leads lezen (voor de preview pagina's)
CREATE POLICY "public_read_live_leads" ON leads
  FOR SELECT
  USING (status IN ('Live', 'Bekeken'));

-- Ingelogde gebruikers (admin) mogen alles
CREATE POLICY "admin_full_access_leads" ON leads
  FOR ALL
  USING (auth.role() = 'authenticated');

-- Iedereen mag analytics schrijven (tracking vanuit browser)
CREATE POLICY "public_insert_analytics" ON analytics
  FOR INSERT
  WITH CHECK (true);

-- Iedereen mag analytics bijwerken (finalize tracking)
CREATE POLICY "public_update_analytics" ON analytics
  FOR UPDATE
  USING (true);

-- Alleen admin mag analytics lezen
CREATE POLICY "admin_read_analytics" ON analytics
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- ── Voorbeelddata ────────────────────────────────────────────
INSERT INTO leads (company_name, slug, industry, primary_color, secondary_color, status, style_instructions) VALUES
  (
    'Bouwbedrijf De Vries',
    'bouwbedrijf-de-vries',
    'bouw',
    '#f97316',
    '#0f172a',
    'Live',
    'Stoer en betrouwbaar. Focus op vakmanschap en meer dan 30 jaar ervaring.'
  ),
  (
    'Interieur Plus',
    'interieur-plus',
    'interieur',
    '#3b82f6',
    '#1e293b',
    'Concept',
    'Modern en strak. Luxe uitstraling voor een premiumklant.'
  ),
  (
    'TechBouw Solutions',
    'techbouw-solutions',
    'techniek',
    '#10b981',
    '#0f172a',
    'Bekeken',
    'Technisch en innovatief. Combinatie van bouw en slimme technologie.'
  );
