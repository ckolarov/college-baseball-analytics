import { BaseAgent } from "../base-agent";
import { prisma } from "@/lib/db";
import { GameStatus } from "@/generated/prisma/enums";
import type { AgentRunResult } from "@/models/types";
import { alignPitchersVsHitters } from "./pitcher-hitter-align";
import { projectMatchupOutcome } from "./outcome-projector";

export class MatchupModelingAgent extends BaseAgent {
  name = "matchup-modeling";
  description =
    "Aligns expected pitcher-hitter matchups and projects individual outcomes";

  async run(
    params?: Record<string, unknown>,
  ): Promise<AgentRunResult> {
    const errors: string[] = [];
    let itemsProcessed = 0;
    const season =
      (params?.season as number) || new Date().getFullYear();

    // Get upcoming/scheduled games
    const games = await prisma.game.findMany({
      where: {
        status: GameStatus.SCHEDULED,
        date: { gte: new Date() },
      },
      include: {
        homeTeam: true,
        awayTeam: true,
      },
      orderBy: { date: "asc" },
      take: 50, // Process next 50 upcoming games
    });

    this.log(`Processing matchups for ${games.length} upcoming games`);

    for (const game of games) {
      try {
        // Get pitcher-hitter pairs for both sides
        // Home pitchers vs away hitters
        const homePitchersVsAway = await alignPitchersVsHitters(
          game.homeTeamId,
          game.awayTeamId,
          season,
        );

        // Away pitchers vs home hitters
        const awayPitchersVsHome = await alignPitchersVsHitters(
          game.awayTeamId,
          game.homeTeamId,
          season,
        );

        const allPairs = [...homePitchersVsAway, ...awayPitchersVsHome];

        // Clear existing matchups for this game
        await prisma.pitcherMatchup.deleteMany({
          where: { gameId: game.id },
        });

        // Project outcomes and store
        for (const pair of allPairs) {
          const outcome = projectMatchupOutcome(pair);

          await prisma.pitcherMatchup.create({
            data: {
              gameId: game.id,
              pitcherId: pair.pitcherId,
              hitterId: pair.hitterId,
              projectedBA: outcome.projectedBA,
              projectedK: outcome.projectedK,
              projectedBB: outcome.projectedBB,
              projectedHR: outcome.projectedHR,
              advantage: outcome.advantage,
            },
          });

          itemsProcessed++;
        }

        this.log(
          `Projected ${allPairs.length} matchups for ${game.homeTeam.name} vs ${game.awayTeam.name}`,
        );
      } catch (error) {
        const msg = `Failed to process matchups for game ${game.id}: ${error instanceof Error ? error.message : error}`;
        this.logError(msg);
        errors.push(msg);
      }
    }

    return {
      success: errors.length === 0,
      itemsProcessed,
      errors,
      metadata: {
        gamesProcessed: games.length,
        matchupsCreated: itemsProcessed,
      },
    };
  }
}
