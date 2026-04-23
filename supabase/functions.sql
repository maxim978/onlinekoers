-- ============================================================
-- RPC Helper Functions for The Previewer
-- Run these AFTER schema.sql
-- ============================================================

-- Increment total view count
CREATE OR REPLACE FUNCTION increment_view_count(p_lead_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE lead_stats
  SET
    view_count   = view_count + 1,
    last_viewed_at = NOW(),
    updated_at   = NOW()
  WHERE lead_id = p_lead_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment unique view count
CREATE OR REPLACE FUNCTION increment_unique_views(p_lead_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE lead_stats
  SET
    unique_view_count = unique_view_count + 1,
    updated_at        = NOW()
  WHERE lead_id = p_lead_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment CTA click count
CREATE OR REPLACE FUNCTION increment_cta_clicks(p_lead_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE lead_stats
  SET
    cta_click_count = cta_click_count + 1,
    updated_at      = NOW()
  WHERE lead_id = p_lead_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment contact click count
CREATE OR REPLACE FUNCTION increment_contact_clicks(p_lead_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE lead_stats
  SET
    contact_click_count = contact_click_count + 1,
    updated_at          = NOW()
  WHERE lead_id = p_lead_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recompute average session duration for a lead
CREATE OR REPLACE FUNCTION update_avg_duration(p_lead_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE lead_stats
  SET
    avg_duration_seconds = (
      SELECT COALESCE(AVG(duration_seconds), 0)
      FROM page_sessions
      WHERE lead_id = p_lead_id
        AND duration_seconds IS NOT NULL
    ),
    updated_at = NOW()
  WHERE lead_id = p_lead_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
