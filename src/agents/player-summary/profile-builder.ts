import { prisma } from "@/lib/db";
import type { PlayerProfile, SeasonStatsView, CareerSplits } from "@/models/types";

/**
 * Build a complete player profile from database records.
 */
export async function buildPlayerProfile(
  playerId: string,
): Promise<PlayerProfile | null> {
  const player = await prisma.player.findUnique({
    where: { id: playerId },
    include: {
      team: true,
      seasonStats: { orderBy: { season: "desc" } },
    },
  });

  if (!player) return null;

  const seasonStats: SeasonStatsView[] = player.seasonStats.map((s) => ({
    season: s.season,
    gamesPlayed: s.gamesPlayed,
    era: s.era,
    wins: s.wins,
    losses: s.losses,
    inningsPitched: s.inningsPitched,
    strikeouts: s.strikeouts,
    walks: s.walks,
    whip: s.whip,
    kPerNine: s.kPerNine,
    bbPerNine: s.bbPerNine,
    kPercent: s.kPercent,
    bbPercent: s.bbPercent,
    oppBattingAvg: s.oppBattingAvg,
    battingAvg: s.battingAvg,
    obp: s.obp,
    slg: s.slg,
    ops: s.ops,
    homeRuns: s.homeRuns,
    rbi: s.rbi,
    stolenBases: s.stolenBases,
    kRateHitting: s.kRateHitting,
    bbRateHitting: s.bbRateHitting,
  }));

  const careerSplits: CareerSplits = {
    bySeason: Object.fromEntries(
      seasonStats.map((s) => [s.season, s]),
    ),
  };

  return {
    id: player.id,
    firstName: player.firstName,
    lastName: player.lastName,
    teamName: player.team.name,
    position: player.position,
    playerType: player.playerType,
    classYear: player.classYear,
    bats: player.bats,
    throws: player.throws,
    pitchingPlus: player.pitchingPlus,
    hittingPlus: player.hittingPlus,
    stuffPlus: player.stuffPlus,
    locationPlus: player.locationPlus,
    seasonStats,
    careerSplits,
  };
}
