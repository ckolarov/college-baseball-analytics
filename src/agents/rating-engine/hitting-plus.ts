import { D1_AVERAGES, HITTING_PLUS_WEIGHTS } from "@/models/constants";
import {
  calculateComponentScore,
  calculateWeightedComposite,
} from "./normalization";
import type { RatingBreakdown, RatingComponent } from "@/models/types";

export interface HitterRatingInput {
  battingAvg: number | null;
  obp: number | null;
  slg: number | null;
  ops: number | null;
  kRate: number | null;
  bbRate: number | null;
  iso: number | null;
}

/**
 * Calculate Hitting+ for a hitter.
 * 100 = D1 average. Higher is better.
 *
 * Components:
 * - BA: 15% (higher is better)
 * - OBP: 20% (higher is better)
 * - SLG: 20% (higher is better)
 * - OPS: 15% (higher is better)
 * - K rate: 10% (lower is better)
 * - BB rate: 10% (higher is better)
 * - ISO: 10% (higher is better)
 */
export function calculateHittingPlus(
  stats: HitterRatingInput,
): RatingBreakdown | null {
  const components: RatingComponent[] = [];
  const d1 = D1_AVERAGES.hitting;

  // BA component
  if (stats.battingAvg !== null && stats.battingAvg > 0) {
    const score = calculateComponentScore(
      stats.battingAvg,
      d1.battingAvg,
      false,
    );
    components.push({
      name: "BA",
      value: stats.battingAvg,
      weight: HITTING_PLUS_WEIGHTS.battingAvg,
      score,
    });
  }

  // OBP component
  if (stats.obp !== null && stats.obp > 0) {
    const score = calculateComponentScore(stats.obp, d1.obp, false);
    components.push({
      name: "OBP",
      value: stats.obp,
      weight: HITTING_PLUS_WEIGHTS.obp,
      score,
    });
  }

  // SLG component
  if (stats.slg !== null && stats.slg > 0) {
    const score = calculateComponentScore(stats.slg, d1.slg, false);
    components.push({
      name: "SLG",
      value: stats.slg,
      weight: HITTING_PLUS_WEIGHTS.slg,
      score,
    });
  }

  // OPS component
  if (stats.ops !== null && stats.ops > 0) {
    const score = calculateComponentScore(stats.ops, d1.ops, false);
    components.push({
      name: "OPS",
      value: stats.ops,
      weight: HITTING_PLUS_WEIGHTS.ops,
      score,
    });
  }

  // K rate component (lower is better for hitters)
  if (stats.kRate !== null && stats.kRate > 0) {
    const score = calculateComponentScore(stats.kRate, d1.kRate, true);
    components.push({
      name: "K%",
      value: stats.kRate,
      weight: HITTING_PLUS_WEIGHTS.kRate,
      score,
    });
  }

  // BB rate component (higher is better)
  if (stats.bbRate !== null && stats.bbRate > 0) {
    const score = calculateComponentScore(stats.bbRate, d1.bbRate, false);
    components.push({
      name: "BB%",
      value: stats.bbRate,
      weight: HITTING_PLUS_WEIGHTS.bbRate,
      score,
    });
  }

  // ISO component (higher is better)
  if (stats.iso !== null && stats.iso > 0) {
    const score = calculateComponentScore(stats.iso, d1.iso, false);
    components.push({
      name: "ISO",
      value: stats.iso,
      weight: HITTING_PLUS_WEIGHTS.iso,
      score,
    });
  }

  if (components.length === 0) return null;

  const overall = calculateWeightedComposite(components);

  return { overall, components };
}
