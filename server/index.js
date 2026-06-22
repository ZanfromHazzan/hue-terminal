const express = require('express');
const cors = require('cors');
const path = require('path');
const { TERMINALS, generateRange } = require('./data');
const { detectAnomalies } = require('./anomaly');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/api/terminals', (_req, res) => {
  res.json({ terminals: TERMINALS });
});

app.get('/api/transactions', (req, res) => {
  const days = Math.min(90, Math.max(1, Number(req.query.days) || 14));
  const terminal = TERMINALS.includes(req.query.terminal) ? req.query.terminal : 'ALL';

  const rows = generateRange(days, terminal);
  const withAnomalies = detectAnomalies(rows);

  const latest = withAnomalies[withAnomalies.length - 1];
  const summary = latest
    ? {
        date: latest.date,
        attempts: latest.attempts,
        upstream: latest.upstream,
        upstreamRatePct: latest.upstreamRatePct,
        successful: latest.successful,
        successRatePct: latest.successRatePct,
        customerErrors: latest.customerErrors,
        systemErrors: latest.systemErrors,
        localOnly: latest.localOnly,
      }
    : null;

  res.json({
    syncedAt: new Date().toISOString(),
    terminal,
    days,
    summary,
    rows: withAnomalies,
    anomalyCount: withAnomalies.filter((r) => r.anomaly).length,
  });
});

const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));
app.get('/*splat', (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Hue Terminal server running on port ${PORT}`);
});
