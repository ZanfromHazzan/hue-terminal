const TERMINALS = ['ALL', 'TERM-001', 'TERM-002', 'TERM-003', 'TERM-004'];

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function dateKey(d) {
  return d.toISOString().slice(0, 10);
}

// Deterministic mock data generator: same date+terminal always yields the same numbers,
// so filtering/re-fetching is stable instead of jittering on every request.
function generateDay(date, terminal) {
  const seed = date.getTime() / 86400000 + terminal.length * 7919;
  const rand = seededRandom(Math.floor(seed));

  const baseAttempts = 1400 + Math.floor(rand() * 600);
  const isWeekend = [0, 6].includes(date.getDay());
  const attempts = Math.floor(baseAttempts * (isWeekend ? 0.7 : 1));

  const upstreamRate = 0.90 + rand() * 0.07;
  const upstream = Math.floor(attempts * upstreamRate);

  const successRate = 0.78 + rand() * 0.12;
  const successful = Math.floor(upstream * successRate);

  const failed = attempts - successful;
  const customerErrors = Math.floor(failed * (0.45 + rand() * 0.2));
  const localOnly = Math.floor((attempts - upstream) * (0.6 + rand() * 0.3));
  const systemErrors = Math.max(0, failed - customerErrors - localOnly);

  return {
    date: dateKey(date),
    terminal,
    attempts,
    upstream,
    successful,
    customerErrors,
    systemErrors,
    localOnly,
    successRatePct: Number(((successful / attempts) * 100).toFixed(1)),
    upstreamRatePct: Number(((upstream / attempts) * 100).toFixed(1)),
  };
}

function generateRange(days, terminal) {
  const rows = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);

    if (terminal === 'ALL') {
      const dayRows = TERMINALS.filter((t) => t !== 'ALL').map((t) => generateDay(d, t));
      const merged = dayRows.reduce(
        (acc, r) => ({
          date: r.date,
          terminal: 'ALL',
          attempts: acc.attempts + r.attempts,
          upstream: acc.upstream + r.upstream,
          successful: acc.successful + r.successful,
          customerErrors: acc.customerErrors + r.customerErrors,
          systemErrors: acc.systemErrors + r.systemErrors,
          localOnly: acc.localOnly + r.localOnly,
        }),
        { attempts: 0, upstream: 0, successful: 0, customerErrors: 0, systemErrors: 0, localOnly: 0 }
      );
      merged.successRatePct = Number(((merged.successful / merged.attempts) * 100).toFixed(1));
      merged.upstreamRatePct = Number(((merged.upstream / merged.attempts) * 100).toFixed(1));
      rows.push(merged);
    } else {
      rows.push(generateDay(d, terminal));
    }
  }

  return rows;
}

module.exports = { TERMINALS, generateRange };
