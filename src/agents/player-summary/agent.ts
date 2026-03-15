import { BaseAgent } from "../base-agent";
import { prisma } from "@/lib/db";
import type { AgentRunResult } from "@/models/types";
import { calculateDerivedStats, detectTwoWayPlayers } from "./dashboard-generator";

export class PlayerSummaryAgent extends BaseAgent {
  name = "player-summary";
  description =
    "Cleans, normalizes, and organizes raw data into structured player profiles";

  async run(): Promise<AgentRunResult> {
    const errors: string[] = [];
    let itemsProcessed = 0;

    // Step 1: Calculate derived stats for all players
    this.log("Calculating derived statistics for all players...");
    const players = await prisma.player.findMany({
      select: { id: true },
    });

    for (const player of players) {
      try {
        await calculateDerivedStats(player.id);
        itemsProcessed++;
      } catch (error) {
        const msg = `Failed to calculate derived stats for player ${player.id}: ${error instanceof Error ? error.message : error}`;
        this.logError(msg);
        errors.push(msg);
      }
    }

    this.log(`Processed derived stats for ${itemsProcessed} players`);

    // Step 2: Detect two-way players
    this.log("Detecting two-way players...");
    try {
      const twoWayIds = await detectTwoWayPlayers();
      this.log(`Found ${twoWayIds.length} two-way players`);
    } catch (error) {
      const msg = `Failed to detect two-way players: ${error instanceof Error ? error.message : error}`;
      this.logError(msg);
      errors.push(msg);
    }

    // Step 3: Flag data quality issues
    this.log("Checking data quality...");
    const qualityIssues = await checkDataQuality();
    if (qualityIssues.length > 0) {
      this.log(`Found ${qualityIssues.length} data quality issues`);
      errors.push(...qualityIssues.map((q) => `Data quality: ${q}`));
    }

    return {
      success: errors.filter((e) => !e.startsWith("Data quality:")).length === 0,
      itemsProcessed,
      errors,
      metadata: {
        totalPlayers: players.length,
        qualityIssues: qualityIssues.length,
      },
    };
  }
}

async function checkDataQuality(): Promise<string[]> {
  const issues: string[] = [];

  // Check for players with no stats
  const playersWithoutStats = await prisma.player.count({
    where: { seasonStats: { none: {} } },
  });
  if (playersWithoutStats > 0) {
    issues.push(`${playersWithoutStats} players have no season stats`);
  }

  // Check for outlier ERA values
  const outlierEra = await prisma.seasonStats.count({
    where: {
      era: { not: null, gt: 50 },
      inningsPitched: { gt: 5 },
    },
  });
  if (outlierEra > 0) {
    issues.push(`${outlierEra} pitchers have ERA > 50 (possible data error)`);
  }

  // Check for batting averages > 1.0
  const outlierBa = await prisma.seasonStats.count({
    where: {
      battingAvg: { not: null, gt: 1 },
      atBats: { gt: 10 },
    },
  });
  if (outlierBa > 0) {
    issues.push(
      `${outlierBa} hitters have BA > 1.000 (possible data error)`,
    );
  }

  return issues;
}
