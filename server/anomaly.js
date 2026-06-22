// Flags a day as anomalous when its success rate falls more than `stdDevThreshold`
// standard deviations below the trailing mean of the other days in the window.
function detectAnomalies(rows, stdDevThreshold = 1.75) {
  if (rows.length < 3) return rows.map((r) => ({ ...r, anomaly: false }));

  const rates = rows.map((r) => r.successRatePct);
  const mean = rates.reduce((a, b) => a + b, 0) / rates.length;
  const variance = rates.reduce((a, b) => a + (b - mean) ** 2, 0) / rates.length;
  const stdDev = Math.sqrt(variance);

  return rows.map((r) => {
    const dropsBelow = mean - r.successRatePct > stdDevThreshold * stdDev && stdDev > 0.01;
    const systemSpike = r.systemErrors > 0 && r.systemErrors / r.attempts > 0.08;
    return { ...r, anomaly: dropsBelow || systemSpike, anomalyMean: Number(mean.toFixed(1)) };
  });
}

module.exports = { detectAnomalies };
