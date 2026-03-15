import { prisma } from "@/lib/db";
import { PlayerType } from "@/generated/prisma/enums";

/**
 * Calculate derived stats for all players and update their records.
 * This fills in any missing derived statistics.
 */
export async function calculateDerivedStats(playerId: string): Promise<void> {
  const stats = await prisma.seasonStats.findMany({
    where: { playerId },
  });

  for (const season of stats) {
    const updates: Record<string, number | null> = {};

    // Calculate OPS if missing
    if (season.ops === null && season.obp !== null && season.slg !== null) {
      updates.ops = season.obp + season.slg;
    }

    // Calculate ISO if missing
    if (
      season.isoSlg === null &&
      season.slg !== null &&
      season.battingAvg !== null
    ) {
      updates.isoSlg = season.slg - season.battingAvg;
    }

    // Calculate WHIP if missing
    if (
      season.whip === null &&
      season.inningsPitched &&
      season.inningsPitched > 0
    ) {
      const h = season.hitsAllowed || 0;
      const bb = season.walks || 0;
      updates.whip =
        Math.round(((h + bb) / season.inningsPitched) * 1000) / 1000;
    }

    // Calculate K/9 if missing
    if (
      season.kPerNine === null &&
      season.inningsPitched &&
      season.inningsPitched > 0 &&
      season.strikeouts !== null
    ) {
      updates.kPerNine =
        Math.round(((season.strikeouts / season.inningsPitched) * 9) * 100) /
        100;
    }

    // Calculate BB/9 if missing
    if (
      season.bbPerNine === null &&
      season.inningsPitched &&
      season.inningsPitched > 0 &&
      season.walks !== null
    ) {
      updates.bbPerNine =
        Math.round(((season.walks / season.inningsPitched) * 9) * 100) / 100;
    }

    // Calculate BABIP if missing
    if (
      season.babip === null &&
      season.hits !== null &&
      season.homeRuns !== null &&
      season.atBats !== null
    ) {
      const k = season.kRateHitting
        ? Math.round(
            season.kRateHitting * (season.atBats + (season.walks || 0)),
          )
        : 0;
      const denom = season.atBats - k - season.homeRuns;
      if (denom > 0) {
        updates.babip =
          Math.round(((season.hits - season.homeRuns) / denom) * 1000) / 1000;
      }
    }

    if (Object.keys(updates).length > 0) {
      await prisma.seasonStats.update({
        where: { id: season.id },
        data: updates,
      });
    }
  }
}

/**
 * Detect and flag potential two-way players.
 */
export async function detectTwoWayPlayers(): Promise<string[]> {
  const twoWayIds: string[] = [];

  // Find players who have both pitching and hitting stats in the same season
  const players = await prisma.player.findMany({
    include: {
      seasonStats: true,
    },
  });

  for (const player of players) {
    for (const stats of player.seasonStats) {
      const hasPitching =
        stats.inningsPitched !== null && stats.inningsPitched > 0;
      const hasHitting = stats.atBats !== null && stats.atBats > 10;

      if (hasPitching && hasHitting) {
        await prisma.player.update({
          where: { id: player.id },
          data: { playerType: PlayerType.TWO_WAY },
        });
        twoWayIds.push(player.id);
        break;
      }
    }
  }

  return twoWayIds;
}
