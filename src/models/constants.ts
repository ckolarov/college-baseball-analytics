// D1 average stats used for normalization (100 = D1 average)
// These values should be updated each season with actual D1 averages

export const D1_AVERAGES = {
  // Pitching averages
  pitching: {
    era: 5.50,
    kPercent: 0.22,       // 22% K rate
    bbPercent: 0.10,      // 10% BB rate
    strikePercent: 0.62,  // 62% strike rate
    oppBattingAvg: 0.270,
    whip: 1.45,
    kPerNine: 8.0,
    bbPerNine: 4.0,
    kBbRatio: 2.0,
  },

  // Hitting averages
  hitting: {
    battingAvg: 0.270,
    obp: 0.350,
    slg: 0.420,
    ops: 0.770,
    kRate: 0.20,          // 20% K rate
    bbRate: 0.10,         // 10% BB rate
    iso: 0.150,           // Isolated power
    babip: 0.330,
  },

  // League-wide averages for matchup modeling
  league: {
    battingAvg: 0.270,
    kRate: 0.20,
    bbRate: 0.10,
    hrRate: 0.025,
  },
} as const;

// Pitching+ component weights (must sum to 1.0)
export const PITCHING_PLUS_WEIGHTS = {
  kPercent: 0.25,
  bbPercent: 0.20,
  strikePercent: 0.15,
  oppBattingAvg: 0.20,
  whip: 0.10,
  kBbRatio: 0.10,
} as const;

// Hitting+ component weights (must sum to 1.0)
export const HITTING_PLUS_WEIGHTS = {
  battingAvg: 0.15,
  obp: 0.20,
  slg: 0.20,
  ops: 0.15,
  kRate: 0.10,
  bbRate: 0.10,
  iso: 0.10,
} as const;

// Rating display thresholds
export const RATING_THRESHOLDS = {
  ELITE: 120,
  ABOVE_AVERAGE: 105,
  AVERAGE_HIGH: 105,
  AVERAGE_LOW: 95,
  BELOW_AVERAGE: 80,
} as const;

// Rating color mapping
export const RATING_COLORS = {
  elite: "#FFD700",      // Gold
  aboveAvg: "#22C55E",   // Green
  average: "#FFFFFF",     // White/neutral
  belowAvg: "#F97316",   // Orange
  poor: "#EF4444",       // Red
} as const;

// Home field advantage adjustment (in rating points)
export const HOME_FIELD_ADVANTAGE = 4;

// Agent configuration defaults
export const AGENT_DEFAULTS = {
  scrapeDelayMs: 2000,
  maxRetries: 3,
  batchSize: 50,
} as const;
