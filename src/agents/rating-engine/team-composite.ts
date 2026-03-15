import { prisma } from "@/lib/db";
import { PlayerType } from "@/generated/prisma/enums";

/**
 * Calculate team-level composite Pitching+ and Hitting+ scores.
 *
 * Team Pitching+ = weighted average of all pitcher Pitching+ scores,
 *   weighted by innings pitched.
 *
 * Team Hitting+ = weighted average of all hitter Hitting+ scores,
 *   weighted by at-bats.
 */
export async function calculateTeamComposite(
  teamId: string,
  season: number,
): Promise<{ teamPitchingPlus: number | null; teamHittingPlus: number | null }> {
  // Get all pitchers with ratings and their IP
  const pitchers = await prisma.player.findMany({
    where: {
      teamId,
      playerType: { in: [PlayerType.PITCHER, PlayerType.TWO_WAY] },
      pitchingPlus: { not: null },
    },
    include: {
      seasonStats: {
        where: { season, inningsPitched: { not: null, gt: 0 } },
        take: 1,
      },
    },
  });

  let teamPitchingPlus: number | null = null;
  if (pitchers.length > 0) {
    let totalWeight = 0;
    let weightedSum = 0;

    for (const pitcher of pitchers) {
      const ip = pitcher.seasonStats[0]?.inningsPitched ?? 0;
      if (ip > 0 && pitcher.pitchingPlus !== null) {
        weightedSum += pitcher.pitchingPlus * ip;
        totalWeight += ip;
      }
    }

    if (totalWeight > 0) {
      teamPitchingPlus = Math.round((weightedSum / totalWeight) * 10) / 10;
    }
  }

  // Get all hitters with ratings and their AB
  const hitters = await prisma.player.findMany({
    where: {
      teamId,
      playerType: { in: [PlayerType.HITTER, PlayerType.TWO_WAY] },
      hittingPlus: { not: null },
    },
    include: {
      seasonStats: {
        where: { season, atBats: { not: null, gt: 0 } },
        take: 1,
      },
    },
  });

  let teamHittingPlus: number | null = null;
  if (hitters.length > 0) {
    let totalWeight = 0;
    let weightedSum = 0;

    for (const hitter of hitters) {
      const ab = hitter.seasonStats[0]?.atBats ?? 0;
      if (ab > 0 && hitter.hittingPlus !== null) {
        weightedSum += hitter.hittingPlus * ab;
        totalWeight += ab;
      }
    }

    if (totalWeight > 0) {
      teamHittingPlus = Math.round((weightedSum / totalWeight) * 10) / 10;
    }
  }

  return { teamPitchingPlus, teamHittingPlus };
}
