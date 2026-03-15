import { D1_AVERAGES, PITCHING_PLUS_WEIGHTS } from "@/models/constants";
import {
  calculateComponentScore,
  calculateWeightedComposite,
} from "./normalization";
import type { RatingBreakdown, RatingComponent } from "@/models/types";

export interface PitcherRatingInput {
  kPercent: number | null;
  bbPercent: number | null;
  strikePercent: number | null;
  oppBattingAvg: number | null;
  whip: number | null;
  kPerNine: number | null;
  bbPerNine: number | null;
}

/**
 * Calculate Pitching+ for a pitcher.
 * 100 = D1 average. Higher is better.
 *
 * Components:
 * - K%: 25% (higher is better)
 * - BB%: 20% (lower is better)
 * - Strike%: 15% (higher is better)
 * - Opp BA: 20% (lower is better)
 * - WHIP: 10% (lower is better)
 * - K/BB ratio: 10% (higher is better)
 */
export function calculatePitchingPlus(
  stats: PitcherRatingInput,
): RatingBreakdown | null {
  const components: RatingComponent[] = [];
  const d1 = D1_AVERAGES.pitching;

  // K% component
  if (stats.kPercent !== null && stats.kPercent > 0) {
    const score = calculateComponentScore(
      stats.kPercent,
      d1.kPercent,
      false, // higher K% is better
    );
    components.push({
      name: "K%",
      value: stats.kPercent,
      weight: PITCHING_PLUS_WEIGHTS.kPercent,
      score,
    });
  }

  // BB% component (lower is better)
  if (stats.bbPercent !== null && stats.bbPercent > 0) {
    const score = calculateComponentScore(
      stats.bbPercent,
      d1.bbPercent,
      true, // lower BB% is better
    );
    components.push({
      name: "BB%",
      value: stats.bbPercent,
      weight: PITCHING_PLUS_WEIGHTS.bbPercent,
      score,
    });
  }

  // Strike% component
  if (stats.strikePercent !== null && stats.strikePercent > 0) {
    const score = calculateComponentScore(
      stats.strikePercent,
      d1.strikePercent,
      false, // higher strike% is better
    );
    components.push({
      name: "Strike%",
      value: stats.strikePercent,
      weight: PITCHING_PLUS_WEIGHTS.strikePercent,
      score,
    });
  }

  // Opp BA component (lower is better)
  if (stats.oppBattingAvg !== null && stats.oppBattingAvg > 0) {
    const score = calculateComponentScore(
      stats.oppBattingAvg,
      d1.oppBattingAvg,
      true,
    );
    components.push({
      name: "Opp BA",
      value: stats.oppBattingAvg,
      weight: PITCHING_PLUS_WEIGHTS.oppBattingAvg,
      score,
    });
  }

  // WHIP component (lower is better)
  if (stats.whip !== null && stats.whip > 0) {
    const score = calculateComponentScore(stats.whip, d1.whip, true);
    components.push({
      name: "WHIP",
      value: stats.whip,
      weight: PITCHING_PLUS_WEIGHTS.whip,
      score,
    });
  }

  // K/BB ratio component (higher is better)
  if (
    stats.kPercent !== null &&
    stats.bbPercent !== null &&
    stats.bbPercent > 0
  ) {
    const kBbRatio = stats.kPercent / stats.bbPercent;
    const score = calculateComponentScore(kBbRatio, d1.kBbRatio, false);
    components.push({
      name: "K/BB",
      value: kBbRatio,
      weight: PITCHING_PLUS_WEIGHTS.kBbRatio,
      score,
    });
  }

  if (components.length === 0) return null;

  const overall = calculateWeightedComposite(components);

  return { overall, components };
}
