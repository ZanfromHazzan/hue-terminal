const { TERMINAL_META, generateRange, seededRandom, dateKey, hashString } = require('./data');

const STATUS_WEIGHTS = [
  { status: 'online', weight: 0.55 },
  { status: 'syncing', weight: 0.2 },
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

function generateFleet(date) {
  const today = new Date(date);
  today.setHours(0, 0, 0, 0);
  const key = dateKey(today);

  const terminals = TERMINAL_META.map((meta) => {
    const seed = today.getTime() / 86400000 + hashString(meta.id) * 5417;
    const rand = seededRandom(Math.floor(seed));

    const status = pickStatus(rand);
    const buffered =
      status === 'retrying'
        ? 50
        : status === 'offline'
          ? Math.floor(35 + rand() * 15)
          : Math.floor(rand() * 35);

    const lastSyncMinutesAgo =
      status === 'syncing' ? 0 : status === 'retrying' || status === 'offline' ? Math.floor(20 + rand() * 90) : Math.floor(rand() * 14) + 1;

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

  const summary = terminals.reduce(
    (acc, t) => {
      acc.total += 1;
      if (t.status === 'online') acc.online += 1;
      if (t.status === 'syncing') acc.syncing += 1;
      if (t.status === 'retrying' || t.status === 'offline') acc.needsAttention += 1;
      acc.buffered += t.buffered;
      return acc;
    },
    { total: 0, online: 0, syncing: 0, needsAttention: 0, buffered: 0 }
  );

  return { date: key, summary, terminals };
}

module.exports = { generateFleet };
