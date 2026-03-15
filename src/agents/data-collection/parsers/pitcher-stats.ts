import type { RawPlayerStats } from "../scrapers/ncaa-stats";

export interface ParsedPitcherStats {
  firstName: string;
  lastName: string;
  classYear: string;
  gamesPlayed: number | null;
  gamesStarted: number | null;
  wins: number | null;
  losses: number | null;
  era: number | null;
  inningsPitched: number | null;
  strikeouts: number | null;
  walks: number | null;
  hitsAllowed: number | null;
  earnedRuns: number | null;
  // Derived stats
  whip: number | null;
  kPerNine: number | null;
  bbPerNine: number | null;
  kPercent: number | null;
  bbPercent: number | null;
  strikePercent: number | null;
  oppBattingAvg: number | null;
}

export function parsePitcherStats(raw: RawPlayerStats): ParsedPitcherStats {
  const ip = parseFloat(raw.inningsPitched || "") || null;
  const k = parseInt(raw.strikeouts || "") || null;
  const bb = parseInt(raw.walks || "") || null;
  const h = parseInt(raw.hitsAllowed || "") || null;
  const er = parseInt(raw.earnedRuns || "") || null;

  // Convert IP from baseball format (6.1 = 6 1/3 innings)
  const inningsPitched = ip !== null ? convertInningsPitched(ip) : null;

  // Calculate derived stats
  const whip =
    inningsPitched && inningsPitched > 0 && h !== null && bb !== null
      ? (h + bb) / inningsPitched
      : null;

  const kPerNine =
    inningsPitched && inningsPitched > 0 && k !== null
      ? (k / inningsPitched) * 9
      : null;

  const bbPerNine =
    inningsPitched && inningsPitched > 0 && bb !== null
      ? (bb / inningsPitched) * 9
      : null;

  // Estimate batters faced for rate stats
  const bf = estimateBattersFaced(inningsPitched, h, bb, k);
  const kPercent = bf && k !== null ? k / bf : null;
  const bbPercent = bf && bb !== null ? bb / bf : null;

  // Calculate opponent batting avg: H / (BF - BB - HBP)
  // Simplified: H / (BF - BB) since we don't have HBP
  const oppBattingAvg =
    bf && h !== null && bb !== null && bf - bb > 0
      ? h / (bf - bb)
      : null;

  return {
    firstName: raw.firstName,
    lastName: raw.lastName,
    classYear: raw.classYear || "",
    gamesPlayed: parseInt(raw.gamesPlayed || "") || null,
    gamesStarted: parseInt(raw.gamesStarted || "") || null,
    wins: parseInt(raw.wins || "") || null,
    losses: parseInt(raw.losses || "") || null,
    era: parseFloat(raw.era || "") || null,
    inningsPitched,
    strikeouts: k,
    walks: bb,
    hitsAllowed: h,
    earnedRuns: er,
    whip: whip !== null ? Math.round(whip * 1000) / 1000 : null,
    kPerNine: kPerNine !== null ? Math.round(kPerNine * 100) / 100 : null,
    bbPerNine: bbPerNine !== null ? Math.round(bbPerNine * 100) / 100 : null,
    kPercent: kPercent !== null ? Math.round(kPercent * 1000) / 1000 : null,
    bbPercent: bbPercent !== null ? Math.round(bbPercent * 1000) / 1000 : null,
    strikePercent: null, // Requires pitch-level data
    oppBattingAvg:
      oppBattingAvg !== null
        ? Math.round(oppBattingAvg * 1000) / 1000
        : null,
  };
}

/**
 * Convert baseball innings pitched notation.
 * 6.1 = 6 1/3 IP, 6.2 = 6 2/3 IP, 6.0 = 6 IP
 */
function convertInningsPitched(raw: number): number {
  const whole = Math.floor(raw);
  const decimal = Math.round((raw - whole) * 10);
  return whole + decimal / 3;
}

/**
 * Estimate batters faced when not directly available.
 * BF ≈ 3 * IP + H + BB
 */
function estimateBattersFaced(
  ip: number | null,
  h: number | null,
  bb: number | null,
  _k: number | null,
): number | null {
  if (ip === null) return null;
  return Math.round(3 * ip + (h || 0) + (bb || 0));
}
