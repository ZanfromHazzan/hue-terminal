const Anthropic = require('@anthropic-ai/sdk');

let client = null;
function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}

const SYSTEM_PROMPT = `You are a payments operations analyst for OmniPay, a Nigerian payment terminal network.
You're given recent daily transaction stats for a scope (a location, a single terminal, or the whole fleet).
Write a short insight (2-3 sentences, plain English, no markdown) explaining what's notable about the
latest day versus the trend — call out anomalies, error-type shifts, or a genuinely uneventful day plainly
("Nothing unusual today" is a fine answer). Then classify severity.
Respond ONLY with a JSON object: {"severity": "info"|"warning"|"critical", "message": "..."}.
Use "critical" only for flagged anomalies with a clear operational cause worth escalating, "warning" for
a notable but non-anomalous shift, and "info" otherwise.`;

function buildPrompt({ scope, summary, previousSummary, rows }) {
  const anomalies = rows.filter((r) => r.anomaly).map((r) => r.date);
  const recent = rows.slice(-7).map((r) => ({
    date: r.date,
    attempts: r.attempts,
    successRatePct: r.successRatePct,
    customerErrors: r.customerErrors,
    systemErrors: r.systemErrors,
    localOnly: r.localOnly,
    anomaly: r.anomaly,
  }));

  return JSON.stringify({
    scope,
    latestDay: summary,
    previousDay: previousSummary,
    anomalyDatesInWindow: anomalies,
    last7Days: recent,
  });
}

async function generateInsight({ scope, summary, previousSummary, rows }) {
  const anthropic = getClient();
  if (!anthropic) {
    return { available: false, reason: 'ANTHROPIC_API_KEY not configured' };
  }
  if (!summary) {
    return { available: false, reason: 'No data for this scope/day' };
  }

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 300,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: buildPrompt({ scope, summary, previousSummary, rows }) }],
  });

  const text = message.content.find((b) => b.type === 'text')?.text ?? '{}';
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = { severity: 'info', message: text.trim() };
  }

  return { available: true, severity: parsed.severity ?? 'info', message: parsed.message ?? text.trim() };
}

module.exports = { generateInsight };
