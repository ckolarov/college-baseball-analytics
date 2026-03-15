import { prisma } from "@/lib/db";
import { PlayerType } from "@/generated/prisma/enums";

export interface PitcherHitterPair {
  pitcherId: string;
  pitcherName: string;
  pitcherPitchingPlus: number | null;
  pitcherStats: {
    kPercent: number | null;
    bbPercent: number | null;
    oppBattingAvg: number | null;
  };
  hitterId: string;
  hitterName: string;
  hitterHittingPlus: number | null;
  hitterStats: {
    battingAvg: number | null;
    kRate: number | null;
    bbRate: number | null;
    ops: number | null;
  };
}

/**
 * Align starting pitchers against the opposing team's lineup.
 * Returns pitcher-hitter pairs for matchup analysis.
 */
export async function alignPitchersVsHitters(
  pitcherTeamId: string,
  hitterTeamId: string,
  season: number,
): Promise<PitcherHitterPair[]> {
  // Get probable starters (pitchers with the most starts)
  const pitchers = await prisma.player.findMany({
    where: {
      teamId: pitcherTeamId,
      playerType: { in: [PlayerType.PITCHER, PlayerType.TWO_WAY] },
    },
    include: {
      seasonStats: {
        where: { season, gamesStarted: { gt: 0 } },
        orderBy: { gamesStarted: "desc" },
        take: 1,
      },
    },
    orderBy: { pitchingPlus: { sort: "desc", nulls: "last" } },
    take: 3, // Top 3 probable starters
  });

  // Get the opposing lineup (hitters sorted by at-bats for likely starters)
  const hitters = await prisma.player.findMany({
    where: {
      teamId: hitterTeamId,
      playerType: { in: [PlayerType.HITTER, PlayerType.TWO_WAY] },
    },
    include: {
      seasonStats: {
        where: { season, atBats: { gt: 0 } },
        orderBy: { atBats: "desc" },
        take: 1,
      },
    },
    orderBy: { hittingPlus: { sort: "desc", nulls: "last" } },
    take: 9, // Starting 9
  });

  const pairs: PitcherHitterPair[] = [];

  // Create matchup pairs: each pitcher vs each hitter
  for (const pitcher of pitchers) {
    const pStats = pitcher.seasonStats[0];
    if (!pStats) continue;

    for (const hitter of hitters) {
      const hStats = hitter.seasonStats[0];
      if (!hStats) continue;

      pairs.push({
        pitcherId: pitcher.id,
        pitcherName: `${pitcher.firstName} ${pitcher.lastName}`,
        pitcherPitchingPlus: pitcher.pitchingPlus,
        pitcherStats: {
          kPercent: pStats.kPercent,
          bbPercent: pStats.bbPercent,
          oppBattingAvg: pStats.oppBattingAvg,
        },
        hitterId: hitter.id,
        hitterName: `${hitter.firstName} ${hitter.lastName}`,
        hitterHittingPlus: hitter.hittingPlus,
        hitterStats: {
          battingAvg: hStats.battingAvg,
          kRate: hStats.kRateHitting,
          bbRate: hStats.bbRateHitting,
          ops: hStats.ops,
        },
      });
    }
  }

  return pairs;
}
