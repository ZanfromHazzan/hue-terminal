const express = require('express');
const cors = require('cors');
const path = require('path');
const { TERMINALS, TERMINAL_META, LOCATIONS, generateRange, resolveScope, parseLocalDate } = require('./data');
const { detectAnomalies } = require('./anomaly');
const { generateFleet, generateFleetHistory } = require('./fleet');
const { generateInsight } = require('./insights');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/api/terminals', (_req, res) => {
  res.json({ terminals: TERMINALS, meta: TERMINAL_META });
});

app.get('/api/locations', (_req, res) => {
  res.json({ locations: LOCATIONS });
});

function summarize(latest) {
  if (!latest) return null;
  return {
    date: latest.date,
    attempts: latest.attempts,
    upstream: latest.upstream,
    upstreamRatePct: latest.upstreamRatePct,
    successful: latest.successful,
    successRatePct: latest.successRatePct,
    customerErrors: latest.customerErrors,
    systemErrors: latest.systemErrors,
    localOnly: latest.localOnly,
    failed: latest.customerErrors + latest.systemErrors + latest.localOnly,
  };
}

function loadScopeWindow(req) {
  const days = Math.min(90, Math.max(1, Number(req.query.days) || 14));
  const { label: scope } = resolveScope(req.query.terminal);
  const endDate = req.query.date ? parseLocalDate(req.query.date) : new Date();

  const rows = generateRange(days, scope, endDate);
  const withAnomalies = detectAnomalies(rows);
  const latest = withAnomalies[withAnomalies.length - 1];
  const previous = withAnomalies[withAnomalies.length - 2];

  return { days, scope, endDate, rows: withAnomalies, latest, previous };
}

app.get('/api/transactions', (req, res) => {
  const { days, scope, endDate, rows: withAnomalies, latest, previous } = loadScopeWindow(req);
  const compare = ['week', 'month'].includes(req.query.compare) ? req.query.compare : null;

  let priorRows = null;
  if (compare) {
    const shiftDays = compare === 'week' ? 7 : 30;
    const priorEnd = new Date(endDate);
    priorEnd.setDate(priorEnd.getDate() - shiftDays);
    priorRows = generateRange(days, scope, priorEnd);
  }

  res.json({
    syncedAt: new Date().toISOString(),
    terminal: scope,
    days,
    summary: summarize(latest),
    previousSummary: summarize(previous),
    rows: withAnomalies,
    priorRows,
    anomalyCount: withAnomalies.filter((r) => r.anomaly).length,
  });
});

const insightCache = new Map();
// Matches the scheduled refresh interval below, so a pre-warmed insight stays
// served from cache for the full gap between scheduled regenerations.
const INSIGHT_TTL_MS = 6 * 60 * 60 * 1000;

function insightCacheKey(scope, days, date) {
  return `${scope}:${days || 14}:${date || 'latest'}`;
}

async function refreshInsight({ scope, days, date }) {
  const rows = generateRange(days, scope, date ? parseLocalDate(date) : new Date());
  const withAnomalies = detectAnomalies(rows);
  const latest = withAnomalies[withAnomalies.length - 1];
  const previous = withAnomalies[withAnomalies.length - 2];

  const insight = await generateInsight({
    scope,
    summary: summarize(latest),
    previousSummary: summarize(previous),
    rows: withAnomalies,
  });
  insightCache.set(insightCacheKey(scope, days, date), { expires: Date.now() + INSIGHT_TTL_MS, data: insight });
  return insight;
}

app.get('/api/insights', async (req, res) => {
  const { scope, rows, latest, previous } = loadScopeWindow(req);
  const days = req.query.days || 14;
  const date = req.query.date;
  const cacheKey = insightCacheKey(scope, days, date);
  const force = req.query.force === '1';

  if (!force) {
    const cached = insightCache.get(cacheKey);
    if (cached && cached.expires > Date.now()) {
      return res.json(cached.data);
    }
  }

  try {
    const insight = await generateInsight({
      scope,
      summary: summarize(latest),
      previousSummary: summarize(previous),
      rows,
    });
    insightCache.set(cacheKey, { expires: Date.now() + INSIGHT_TTL_MS, data: insight });
    res.json(insight);
  } catch (err) {
    console.error('Insight generation failed:', err.message);
    res.json({ available: false, reason: 'Insight generation failed' });
  }
});

// Pre-warm the default dashboard view's insight on a schedule, so it's ready in
// cache before anyone opens the page rather than generated live on first load.
const INSIGHT_REFRESH_INTERVAL_MS = 6 * 60 * 60 * 1000;
function scheduleInsightRefresh() {
  const defaults = { scope: 'ALL', days: 14, date: undefined };
  refreshInsight(defaults).catch((err) => console.error('Scheduled insight refresh failed:', err.message));
  setInterval(() => {
    refreshInsight(defaults).catch((err) => console.error('Scheduled insight refresh failed:', err.message));
  }, INSIGHT_REFRESH_INTERVAL_MS);
}
if (process.env.ANTHROPIC_API_KEY) {
  scheduleInsightRefresh();
}

app.get('/api/fleet', (req, res) => {
  const endDate = req.query.date ? parseLocalDate(req.query.date) : new Date();
  const city = LOCATIONS.includes(req.query.city) ? req.query.city : undefined;
  res.json({ syncedAt: new Date().toISOString(), ...generateFleet(endDate, city) });
});

app.get('/api/fleet/history', (req, res) => {
  const days = Math.min(90, Math.max(1, Number(req.query.days) || 14));
  const endDate = req.query.date ? parseLocalDate(req.query.date) : new Date();
  const city = LOCATIONS.includes(req.query.city) ? req.query.city : undefined;
  res.json({ syncedAt: new Date().toISOString(), ...generateFleetHistory(days, endDate, city) });
});

const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));
app.get('/*splat', (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Hue Terminal server running on port ${PORT}`);
});
