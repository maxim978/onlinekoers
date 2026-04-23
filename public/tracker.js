/**
 * The Previewer — Client-side session tracker
 * Tracks: page view, time on site, scroll depth, CTA/contact clicks
 */
(function () {
  const script = document.currentScript;
  const LEAD_ID = script?.dataset?.leadId;
  const SLUG = script?.dataset?.slug;

  if (!LEAD_ID) return;

  // Generate or retrieve persistent session ID
  const SESSION_KEY = `previewer_sid_${SLUG}`;
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now();
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }

  const startTime = Date.now();

  // --- 1. Register page view ---
  fetch('/api/track-view', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lead_id: LEAD_ID,
      session_id: sessionId,
      referrer: document.referrer || null,
    }),
  }).catch(() => {});

  // --- 2. Track events (clicks) ---
  document.addEventListener('click', function (e) {
    const el = e.target?.closest('[data-event]');
    if (!el) return;

    const eventType = el.dataset.event;
    const eventData = {};

    if (el.dataset.contactType) eventData.contact_type = el.dataset.contactType;
    if (el.href) eventData.href = el.href;

    fetch('/api/track-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lead_id: LEAD_ID,
        session_id: sessionId,
        event_type: eventType,
        event_data: eventData,
      }),
    }).catch(() => {});
  });

  // --- 3. Scroll depth milestones ---
  const scrollMilestones = new Set();
  window.addEventListener('scroll', function () {
    const scrolled = window.scrollY + window.innerHeight;
    const total = document.documentElement.scrollHeight;
    const pct = Math.round((scrolled / total) * 100);

    for (const milestone of [25, 50, 75, 90]) {
      if (pct >= milestone && !scrollMilestones.has(milestone)) {
        scrollMilestones.add(milestone);
        fetch('/api/track-event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lead_id: LEAD_ID,
            session_id: sessionId,
            event_type: `scroll_${milestone}`,
          }),
        }).catch(() => {});
      }
    }
  }, { passive: true });

  // --- 4. Send duration on page exit via beacon ---
  function sendBeacon() {
    const duration = Math.round((Date.now() - startTime) / 1000);
    const payload = JSON.stringify({
      lead_id: LEAD_ID,
      session_id: sessionId,
      duration_seconds: duration,
    });
    navigator.sendBeacon('/api/track-beacon', new Blob([payload], { type: 'application/json' }));
  }

  window.addEventListener('pagehide', sendBeacon);
  window.addEventListener('beforeunload', sendBeacon);
})();
