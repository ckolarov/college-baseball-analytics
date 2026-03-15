import { BaseAgent } from "../base-agent";
import { prisma } from "@/lib/db";
import { PlayerType } from "@/generated/prisma/enums";
import type { AgentRunResult } from "@/models/types";
import { calculatePitchingPlus } from "./pitching-plus";
import { calculateHittingPlus } from "./hitting-plus";
import { calculateTeamComposite } from "./team-composite";
import { normalizeToAverage100 } from "./normalization";

export class RatingEngineAgent extends BaseAgent {
  name = "rating-engine";
  description =
    "Calculates and updates all Pitching+, Hitting+, and team composite ratings";

  async run(
    params?: Record<string, unknown>,
  ): Promise<AgentRunResult> {
    const errors: string[] = [];
    let itemsProcessed = 0;
    const season =
      (params?.season as number) || new Date().getFullYear();

    // Step 1: Calculate Pitching+ for all pitchers
    this.log("Calculating Pitching+ ratings...");
    const pitchers = await prisma.player.findMany({
      where: {
        playerType: { in: [PlayerType.PITCHER, PlayerType.TWO_WAY] },
      },
      include: {
        seasonStats: {
          where: { season },
          take: 1,
        },
      },
    });

    const pitchingScores: { id: string; score: number }[] = [];

    for (const pitcher of pitchers) {
      const stats = pitcher.seasonStats[0];
      if (!stats) continue;

      // Skip pitchers with minimal innings
      if (!stats.inningsPitched || stats.inningsPitched < 5) continue;

      try {
        const breakdown = calculatePitchingPlus({
          kPercent: stats.kPercent,
          bbPercent: stats.bbPercent,
          strikePercent: stats.strikePercent,
          oppBattingAvg: stats.oppBattingAvg,
          whip: stats.whip,
          kPerNine: stats.kPerNine,
          bbPerNine: stats.bbPerNine,
        });

        if (breakdown) {
          pitchingScores.push({ id: pitcher.id, score: breakdown.overall });
        }
      } catch (error) {
        errors.push(
          `Pitching+ calc failed for ${pitcher.firstName} ${pitcher.lastName}: ${error instanceof Error ? error.message : error}`,
        );
      }
    }

    // Normalize so average = 100
    if (pitchingScores.length > 0) {
      const normalized = normalizeToAverage100(
        pitchingScores.map((p) => p.score),
      );

      for (let i = 0; i < pitchingScores.length; i++) {
        await prisma.player.update({
          where: { id: pitchingScores[i].id },
          data: { pitchingPlus: normalized[i] },
        });
        itemsProcessed++;
      }

      this.log(`Calculated Pitching+ for ${pitchingScores.length} pitchers`);
    }

    // Step 2: Calculate Hitting+ for all hitters
    this.log("Calculating Hitting+ ratings...");
    const hitters = await prisma.player.findMany({
      where: {
        playerType: { in: [PlayerType.HITTER, PlayerType.TWO_WAY] },
      },
      include: {
        seasonStats: {
          where: { season },
          take: 1,
        },
      },
    });

    const hittingScores: { id: string; score: number }[] = [];

    for (const hitter of hitters) {
      const stats = hitter.seasonStats[0];
      if (!stats) continue;

      // Skip hitters with minimal at-bats
      if (!stats.atBats || stats.atBats < 10) continue;

      try {
        const breakdown = calculateHittingPlus({
          battingAvg: stats.battingAvg,
          obp: stats.obp,
          slg: stats.slg,
          ops: stats.ops,
          kRate: stats.kRateHitting,
          bbRate: stats.bbRateHitting,
          iso: stats.isoSlg,
        });

        if (breakdown) {
          hittingScores.push({ id: hitter.id, score: breakdown.overall });
        }
      } catch (error) {
        errors.push(
          `Hitting+ calc failed for ${hitter.firstName} ${hitter.lastName}: ${error instanceof Error ? error.message : error}`,
        );
      }
    }

    // Normalize so average = 100
    if (hittingScores.length > 0) {
      const normalized = normalizeToAverage100(
        hittingScores.map((h) => h.score),
      );

      for (let i = 0; i < hittingScores.length; i++) {
        await prisma.player.update({
          where: { id: hittingScores[i].id },
          data: { hittingPlus: normalized[i] },
        });
        itemsProcessed++;
      }

      this.log(`Calculated Hitting+ for ${hittingScores.length} hitters`);
    }

    // Step 3: Calculate team composites
    this.log("Calculating team composite ratings...");
    const teams = await prisma.team.findMany();

    for (const team of teams) {
      try {
        const composite = await calculateTeamComposite(team.id, season);
        await prisma.team.update({
          where: { id: team.id },
          data: {
            teamPitchingPlus: composite.teamPitchingPlus,
            teamHittingPlus: composite.teamHittingPlus,
          },
        });
        itemsProcessed++;
      } catch (error) {
        errors.push(
          `Team composite failed for ${team.name}: ${error instanceof Error ? error.message : error}`,
        );
      }
    }

    return {
      success: errors.length === 0,
      itemsProcessed,
      errors,
      metadata: {
        season,
        pitchersRated: pitchingScores.length,
        hittersRated: hittingScores.length,
        teamsRated: teams.length,
      },
    };
  }
}
