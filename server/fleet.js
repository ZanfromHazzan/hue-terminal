const { TERMINAL_META, generateRange, seededRandom, dateKey, hashString } = require('./data');

const STATUS_WEIGHTS = [
  { status: 'online', weight: 0.75 },
  { status: 'retrying', weight: 0.2 },
  { status: 'offline', weight: 0.05 },
];

function pickStatus(rand) {
  const roll = rand();
  let cumulative = 0;
  for (const { status, weight } of STATUS_WEIGHTS) {
    cumulative += weight;
    if (roll <= cumulative) return status;
  }
  return 'online';
}

function terminalsForCity(city) {
  return city ? TERMINAL_META.filter((t) => t.city === city) : TERMINAL_META;
}

function generateFleet(date, city) {
  const today = new Date(date);
  today.setHours(0, 0, 0, 0);
  const key = dateKey(today);

  const terminals = terminalsForCity(city).map((meta) => {
    const seed = today.getTime() / 86400000 + hashString(meta.id) * 5417;
    const rand = seededRandom(Math.floor(seed));

    const status = pickStatus(rand);
    const lastSyncMinutesAgo =
      status === 'retrying' || status === 'offline' ? Math.floor(20 + rand() * 90) : Math.floor(rand() * 14) + 1;

    // Buffered records grow with how long the terminal has gone without a successful
    // sync — roughly one 15-minute flush window's worth of records per missed interval.
    const missedIntervals = Math.max(0, Math.floor(lastSyncMinutesAgo / 15));
    const buffered =
      status === 'retrying' || status === 'offline'
        ? missedIntervals * Math.floor(8 + rand() * 12)
        : Math.floor(rand() * 10);

    const [dayStats] = generateRange(1, meta.id, today);
    const avgTicketNaira = 3500 + rand() * 8000;
    const valueNairaToday = Math.round(dayStats.successful * avgTicketNaira);

    return {
      id: meta.id,
      city: meta.city,
      store: meta.store,
      status,
      buffered,
      lastSyncMinutesAgo,
      attempts: dayStats.attempts,
      upstreamRatePct: dayStats.upstreamRatePct,
      valueNairaToday,
    };
  });

  const summary = summarize(terminals);
  return { date: key, summary, terminals };
}

function summarize(terminals) {
  return terminals.reduce(
    (acc, t) => {
      acc.total += 1;
      if (t.status === 'online') acc.online += 1;
      if (t.status === 'retrying' || t.status === 'offline') acc.needsAttention += 1;
      acc.buffered += t.buffered;
      return acc;
    },
    { total: 0, online: 0, needsAttention: 0, buffered: 0 }
  );
}

// Daily fleet summaries across a window, plus the average count of online
// terminals per day — used for the fleet history metric.
function generateFleetHistory(days, endDate, city) {
  const today = endDate ? new Date(endDate) : new Date();
  today.setHours(0, 0, 0, 0);

  const days_ = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const { date, summary } = generateFleet(d, city);
    days_.push({ date, active: summary.online, total: summary.total, summary });
  }

  const avgActive = days_.reduce((sum, d) => sum + d.active, 0) / days_.length;
  const avgTotal = days_.reduce((sum, d) => sum + d.total, 0) / days_.length;

  return {
    days: days_,
    avgActive: Number(avgActive.toFixed(1)),
    avgTotal: Number(avgTotal.toFixed(1)),
  };
}

module.exports = { generateFleet, generateFleetHistory };
