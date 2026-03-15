import { BaseAgent } from "../base-agent";
import { prisma } from "@/lib/db";
import type { AgentRunResult } from "@/models/types";
import { GameStatus } from "@/generated/prisma/enums";
import { parseScheduleWithOpponents } from "./schedule-parser";
import {
  calculateWinProbability,
  projectRunsScored,
} from "./win-probability";

export class ScheduleProjectionAgent extends BaseAgent {
  name = "schedule-projection";
  description =
    "Parses schedules, evaluates opponent strength, and projects game outcomes";

  async run(
    params?: Record<string, unknown>,
  ): Promise<AgentRunResult> {
    const errors: string[] = [];
    let itemsProcessed = 0;

    const targetSchool = process.env.TARGET_SCHOOL_NAME;
    if (!targetSchool) {
      return {
        success: false,
        itemsProcessed: 0,
        errors: ["TARGET_SCHOOL_NAME not set"],
      };
    }

    const team = await prisma.team.findFirst({
      where: { name: { contains: targetSchool, mode: "insensitive" } },
    });

    if (!team) {
      return {
        success: false,
        itemsProcessed: 0,
        errors: [`Team "${targetSchool}" not found in database`],
      };
    }

    // Check if team has ratings
    if (!team.teamPitchingPlus || !team.teamHittingPlus) {
      this.log(
        "Warning: Team ratings not yet calculated, projections will be limited",
      );
    }

    // Parse schedule and match opponents
    this.log("Parsing schedule and matching opponents...");
    const games = await parseScheduleWithOpponents(team.id);
    this.log(`Found ${games.length} scheduled games`);

    for (const game of games) {
      try {
        // Skip completed games — only project future/scheduled games
        if (game.result && game.result.match(/^[WL]/)) {
          continue;
        }

        // Get or create Game record
        const existingGame = await findOrCreateGame(
          game,
          team.id,
        );

        // Calculate projections if we have both teams' ratings
        if (game.opponentTeamId) {
          const opponent = await prisma.team.findUnique({
            where: { id: game.opponentTeamId },
          });

          if (
            opponent &&
            team.teamPitchingPlus &&
            team.teamHittingPlus &&
            opponent.teamPitchingPlus &&
            opponent.teamHittingPlus
          ) {
            const rpiDiff = (team.rpiRating || 0.5) - (opponent.rpiRating || 0.5);

            const homeWinProb = calculateWinProbability({
              teamPitchingPlus: team.teamPitchingPlus,
              teamHittingPlus: team.teamHittingPlus,
              oppPitchingPlus: opponent.teamPitchingPlus,
              oppHittingPlus: opponent.teamHittingPlus,
              rpiDiff,
              isHome: game.isHome,
            });

            const projectedHomeRuns = projectRunsScored(
              game.isHome ? team.teamHittingPlus : opponent.teamHittingPlus,
              game.isHome ? opponent.teamPitchingPlus : team.teamPitchingPlus,
            );

            const projectedAwayRuns = projectRunsScored(
              game.isHome ? opponent.teamHittingPlus : team.teamHittingPlus,
              game.isHome ? team.teamPitchingPlus : opponent.teamPitchingPlus,
            );

            await prisma.game.update({
              where: { id: existingGame.id },
              data: {
                homeWinProb: game.isHome ? homeWinProb : 1 - homeWinProb,
                awayWinProb: game.isHome ? 1 - homeWinProb : homeWinProb,
                projectedHomeRuns,
                projectedAwayRuns,
              },
            });
          }
        }

        itemsProcessed++;
      } catch (error) {
        const msg = `Failed to project game vs ${game.opponentName}: ${error instanceof Error ? error.message : error}`;
        this.logError(msg);
        errors.push(msg);
      }
    }

    return {
      success: errors.length === 0,
      itemsProcessed,
      errors,
      metadata: {
        totalGames: games.length,
        gamesProjected: itemsProcessed,
      },
    };
  }
}

async function findOrCreateGame(
  game: {
    teamId: string;
    opponentTeamId: string | null;
    opponentName: string;
    date: Date;
    isHome: boolean;
  },
  teamId: string,
) {
  const homeTeamId = game.isHome ? teamId : game.opponentTeamId;
  const awayTeamId = game.isHome ? game.opponentTeamId : teamId;

  // If we don't have the opponent in our system, create a placeholder team
  let resolvedHomeId = homeTeamId;
  let resolvedAwayId = awayTeamId;

  if (!resolvedHomeId || !resolvedAwayId) {
    const placeholder = await prisma.team.upsert({
      where: { id: `placeholder-${game.opponentName.toLowerCase().replace(/\s+/g, "-")}` },
      create: {
        id: `placeholder-${game.opponentName.toLowerCase().replace(/\s+/g, "-")}`,
        name: game.opponentName,
        division: "D1",
      },
      update: {},
    });

    if (!resolvedHomeId) resolvedHomeId = game.isHome ? teamId : placeholder.id;
    if (!resolvedAwayId) resolvedAwayId = game.isHome ? placeholder.id : teamId;
  }

  // Find existing game or create new one
  const existing = await prisma.game.findFirst({
    where: {
      date: game.date,
      homeTeamId: resolvedHomeId,
      awayTeamId: resolvedAwayId,
    },
  });

  if (existing) return existing;

  return prisma.game.create({
    data: {
      date: game.date,
      homeTeamId: resolvedHomeId!,
      awayTeamId: resolvedAwayId!,
      status: GameStatus.SCHEDULED,
    },
  });
}
