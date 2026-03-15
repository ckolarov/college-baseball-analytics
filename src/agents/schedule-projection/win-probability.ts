import { HOME_FIELD_ADVANTAGE } from "@/models/constants";

export interface WinProbabilityInput {
  teamPitchingPlus: number;
  teamHittingPlus: number;
  oppPitchingPlus: number;
  oppHittingPlus: number;
  rpiDiff: number; // team RPI rating - opponent RPI rating
  isHome: boolean;
}

/**
 * Calculate projected win probability for a game.
 *
 * Model:
 * 1. Calculate team strength differential from Pitching+ and Hitting+
 * 2. Apply home-field advantage adjustment
 * 3. Weight by RPI difference
 * 4. Convert to probability using logistic function
 */
export function calculateWinProbability(
  input: WinProbabilityInput,
): number {
  // Offensive advantage: how our hitting compares to their pitching
  const offensiveEdge = input.teamHittingPlus - input.oppPitchingPlus;

  // Defensive advantage: how our pitching compares to their hitting
  const defensiveEdge = input.teamPitchingPlus - input.oppHittingPlus;

  // Combined strength differential
  let strengthDiff = offensiveEdge + defensiveEdge;

  // Home field advantage
  if (input.isHome) {
    strengthDiff += HOME_FIELD_ADVANTAGE;
  } else {
    strengthDiff -= HOME_FIELD_ADVANTAGE;
  }

  // Weight by RPI difference (scaled down to be a minor factor)
  strengthDiff += input.rpiDiff * 20; // RPI ratings are ~0.4-0.7, diff ~0-0.3

  // Convert to probability using logistic function
  // Scale factor controls how sensitive the probability is to rating differences
  const scaleFactor = 0.04;
  const probability = 1 / (1 + Math.exp(-scaleFactor * strengthDiff));

  // Clamp between 0.05 and 0.95 — no game is truly a sure thing
  return Math.max(0.05, Math.min(0.95, Math.round(probability * 1000) / 1000));
}

/**
 * Estimate projected runs scored based on team ratings.
 * Uses a simple model based on D1 average runs per game (~5.5).
 */
export function projectRunsScored(
  teamHittingPlus: number,
  oppPitchingPlus: number,
): number {
  const d1AvgRunsPerGame = 5.5;
  const hittingFactor = teamHittingPlus / 100;
  const pitchingFactor = 100 / oppPitchingPlus; // Inverse: better pitching = fewer runs

  const projected = d1AvgRunsPerGame * hittingFactor * pitchingFactor;
  return Math.round(projected * 10) / 10;
}
