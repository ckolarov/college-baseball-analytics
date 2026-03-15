// Re-export Prisma-generated types for convenience
export type {
  TeamModel as Team,
  PlayerModel as Player,
  SeasonStatsModel as SeasonStats,
  GameModel as Game,
  PitcherMatchupModel as PitcherMatchup,
  ScheduleEntryModel as ScheduleEntry,
  RpiRankingModel as RpiRanking,
  AgentRunModel as AgentRun,
} from "@/generated/prisma/models";

export {
  PlayerType,
  GameStatus,
  AgentStatus,
} from "@/generated/prisma/enums";

// Agent system types
export interface AgentRunResult {
  success: boolean;
  itemsProcessed: number;
  errors: string[];
  metadata?: Record<string, unknown>;
}

// Rating component breakdown
export interface RatingComponent {
  name: string;
  value: number;
  weight: number;
  score: number;
}

export interface RatingBreakdown {
  overall: number;
  components: RatingComponent[];
}

// Player profile (enriched view)
export interface PlayerProfile {
  id: string;
  firstName: string;
  lastName: string;
  teamName: string;
  position: string;
  playerType: string;
  classYear: string | null;
  bats: string | null;
  throws: string | null;
  pitchingPlus: number | null;
  hittingPlus: number | null;
  stuffPlus: number | null;
  locationPlus: number | null;
  seasonStats: SeasonStatsView[];
  careerSplits?: CareerSplits;
}

export interface SeasonStatsView {
  season: number;
  gamesPlayed: number | null;
  // Pitcher
  era: number | null;
  wins: number | null;
  losses: number | null;
  inningsPitched: number | null;
  strikeouts: number | null;
  walks: number | null;
  whip: number | null;
  kPerNine: number | null;
  bbPerNine: number | null;
  kPercent: number | null;
  bbPercent: number | null;
  oppBattingAvg: number | null;
  // Hitter
  battingAvg: number | null;
  obp: number | null;
  slg: number | null;
  ops: number | null;
  homeRuns: number | null;
  rbi: number | null;
  stolenBases: number | null;
  kRateHitting: number | null;
  bbRateHitting: number | null;
}

export interface CareerSplits {
  bySeason: Record<number, SeasonStatsView>;
}

// Matchup projection
export interface MatchupProjection {
  pitcherId: string;
  pitcherName: string;
  pitcherPitchingPlus: number | null;
  hitterId: string;
  hitterName: string;
  hitterHittingPlus: number | null;
  projectedBA: number | null;
  projectedK: number | null;
  projectedBB: number | null;
  projectedHR: number | null;
  advantage: "PITCHER" | "HITTER" | "NEUTRAL" | null;
}

// API response wrappers
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
