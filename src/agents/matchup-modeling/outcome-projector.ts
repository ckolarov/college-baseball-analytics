import { D1_AVERAGES } from "@/models/constants";
import type { PitcherHitterPair } from "./pitcher-hitter-align";

export interface MatchupOutcome {
  projectedBA: number;
  projectedK: number;
  projectedBB: number;
  projectedHR: number;
  advantage: "PITCHER" | "HITTER" | "NEUTRAL";
}

/**
 * Project the outcome of a pitcher-hitter matchup.
 *
 * Formula (v1):
 * projected_BA = league_avg_BA * (hitter_BA / league_avg_BA) * (pitcher_opp_BA / league_avg_BA)
 * projected_K  = league_avg_K * (pitcher_K% / league_avg_K) * (hitter_K_rate / league_avg_K)
 *
 * Apply regression toward the mean and matchup quality adjustments.
 */
export function projectMatchupOutcome(
  pair: PitcherHitterPair,
): MatchupOutcome {
  const league = D1_AVERAGES.league;

  // Project BA using odds-ratio method
  const hitterBA = pair.hitterStats.battingAvg ?? league.battingAvg;
  const pitcherOppBA = pair.pitcherStats.oppBattingAvg ?? league.battingAvg;

  const projectedBA = projectOddsRatio(
    hitterBA,
    pitcherOppBA,
    league.battingAvg,
  );

  // Project K rate
  const hitterKRate = pair.hitterStats.kRate ?? league.kRate;
  const pitcherKRate = pair.pitcherStats.kPercent ?? league.kRate;

  const projectedK = projectOddsRatio(
    hitterKRate,
    pitcherKRate,
    league.kRate,
  );

  // Project BB rate
  const hitterBBRate = pair.hitterStats.bbRate ?? league.bbRate;
  const pitcherBBRate = pair.pitcherStats.bbPercent ?? league.bbRate;

  const projectedBB = projectOddsRatio(
    hitterBBRate,
    pitcherBBRate,
    league.bbRate,
  );

  // Project HR rate (simplified — based on power vs. overall pitching quality)
  const pitcherDominance = (pair.pitcherPitchingPlus ?? 100) / 100;
  const projectedHR = league.hrRate / pitcherDominance;

  // Determine advantage
  const pitchingPlus = pair.pitcherPitchingPlus ?? 100;
  const hittingPlus = pair.hitterHittingPlus ?? 100;
  const diff = pitchingPlus - hittingPlus;

  let advantage: "PITCHER" | "HITTER" | "NEUTRAL";
  if (diff > 10) {
    advantage = "PITCHER";
  } else if (diff < -10) {
    advantage = "HITTER";
  } else {
    advantage = "NEUTRAL";
  }

  return {
    projectedBA: clamp(round3(projectedBA), 0.05, 0.5),
    projectedK: clamp(round3(projectedK), 0.02, 0.6),
    projectedBB: clamp(round3(projectedBB), 0.01, 0.3),
    projectedHR: clamp(round3(projectedHR), 0.005, 0.1),
    advantage,
  };
}

/**
 * Odds-ratio method for projecting matchup stats.
 * This is the standard sabermetric approach for combining batter and pitcher rates.
 *
 * projected = (batter_rate * pitcher_rate) / league_rate
 * Then regress toward the mean based on sample size.
 */
function projectOddsRatio(
  batterRate: number,
  pitcherRate: number,
  leagueRate: number,
): number {
  if (leagueRate === 0) return leagueRate;

  // Odds-ratio combination
  const raw = (batterRate * pitcherRate) / leagueRate;

  // Regress toward league average (30% regression for college sample sizes)
  const regressionFactor = 0.7;
  return raw * regressionFactor + leagueRate * (1 - regressionFactor);
}

function round3(val: number): number {
  return Math.round(val * 1000) / 1000;
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}
