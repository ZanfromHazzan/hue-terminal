const express = require('express');
const cors = require('cors');
const path = require('path');
const { TERMINALS, TERMINAL_META, LOCATIONS, generateRange, resolveScope, parseLocalDate } = require('./data');
const { detectAnomalies } = require('./anomaly');
const { generateFleet, generateFleetHistory } = require('./fleet');

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

app.get('/api/transactions', (req, res) => {
  const days = Math.min(90, Math.max(1, Number(req.query.days) || 14));
  const { label: scope } = resolveScope(req.query.terminal);
  const endDate = req.query.date ? parseLocalDate(req.query.date) : new Date();
  const compare = ['week', 'month'].includes(req.query.compare) ? req.query.compare : null;

  const rows = generateRange(days, scope, endDate);
  const withAnomalies = detectAnomalies(rows);

  const latest = withAnomalies[withAnomalies.length - 1];
  const previous = withAnomalies[withAnomalies.length - 2];

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
