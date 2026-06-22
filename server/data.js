const TERMINAL_META = [
  { id: 'TRM-LAG-0421', city: 'Lagos', store: 'ShopRite, Lekki' },
  { id: 'TRM-LAG-0388', city: 'Lagos', store: 'Mobil Filling Stn, Ikeja' },
  { id: 'TRM-ABV-0212', city: 'Abuja', store: 'Sahad Stores, Wuse II' },
  { id: 'TRM-PHC-0150', city: 'Port Harcourt', store: 'SPAR, GRA Phase 2' },
  { id: 'TRM-IBA-0067', city: 'Ibadan', store: 'Grand Mall, Ring Road' },
  { id: 'TRM-KAN-0039', city: 'Kano', store: 'Ado Bayero Mall, Nassarawa' },
];

const TERMINALS = ['ALL', ...TERMINAL_META.map((t) => t.id)];
const LOCATIONS = [...new Set(TERMINAL_META.map((t) => t.city))];

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function dateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Parses a 'YYYY-MM-DD' string as local midnight, avoiding the UTC-parse-then-
// convert-to-local rollback that `new Date(str)` causes in negative UTC offsets.
function parseLocalDate(s) {
  const [y, m, day] = s.split('-').map(Number);
  return new Date(y, m - 1, day);
}

function hashString(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) % 1000003;
  }
  return h;
}

// A "scope" is either 'ALL', 'CITY:<name>', or a specific terminal id.
// Resolves to the set of terminal ids it covers plus the label to report back.
function resolveScope(scope) {
  if (scope && scope.startsWith('CITY:')) {
    const city = scope.slice(5);
    const ids = TERMINAL_META.filter((t) => t.city === city).map((t) => t.id);
    if (ids.length > 0) return { ids, label: scope };
  } else if (scope && TERMINAL_META.some((t) => t.id === scope)) {
    return { ids: [scope], label: scope };
  }
  return { ids: TERMINAL_META.map((t) => t.id), label: 'ALL' };
}

// Deterministic mock data generator: same date+terminal always yields the same numbers,
// so filtering/re-fetching is stable instead of jittering on every request.
function generateDay(date, terminal) {
  const seed = date.getTime() / 86400000 + hashString(terminal) * 7919;
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

function generateRange(days, scope, endDate) {
  const { ids, label } = resolveScope(scope);
  const rows = [];
  const today = endDate ? new Date(endDate) : new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);

    if (ids.length === 1) {
      rows.push(generateDay(d, ids[0]));
      continue;
    }

    const dayRows = ids.map((id) => generateDay(d, id));
    const merged = dayRows.reduce(
      (acc, r) => ({
        date: r.date,
        terminal: label,
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
  }

  return rows;
}

module.exports = {
  TERMINALS,
  TERMINAL_META,
  LOCATIONS,
  generateRange,
  resolveScope,
  seededRandom,
  dateKey,
  hashString,
  parseLocalDate,
};
