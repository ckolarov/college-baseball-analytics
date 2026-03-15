/**
 * Normalize a set of scores so that the average equals exactly 100.
 * This ensures Pitching+ and Hitting+ are properly centered on 100 = D1 average.
 */
export function normalizeToAverage100(scores: number[]): number[] {
  if (scores.length === 0) return [];

  const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
  if (avg === 0) return scores.map(() => 100);

  const scaleFactor = 100 / avg;
  return scores.map((s) => Math.round(s * scaleFactor * 10) / 10);
}

/**
 * Calculate a single component score relative to D1 average.
 *
 * For "higher is better" stats (K%, BA, etc.):
 *   score = 100 * (player_value / d1_avg)
 *
 * For "lower is better" stats (BB%, ERA, WHIP, etc.):
 *   score = 100 * (d1_avg / player_value)
 */
export function calculateComponentScore(
  playerValue: number,
  d1Average: number,
  lowerIsBetter: boolean,
): number {
  if (playerValue === 0 || d1Average === 0) return 100;

  if (lowerIsBetter) {
    return Math.round((100 * d1Average / playerValue) * 10) / 10;
  }
  return Math.round((100 * playerValue / d1Average) * 10) / 10;
}

/**
 * Calculate a weighted composite score from individual components.
 */
export function calculateWeightedComposite(
  components: { score: number; weight: number }[],
): number {
  const totalWeight = components.reduce((sum, c) => sum + c.weight, 0);
  if (totalWeight === 0) return 100;

  const weightedSum = components.reduce(
    (sum, c) => sum + c.score * c.weight,
    0,
  );

  return Math.round((weightedSum / totalWeight) * 10) / 10;
}
