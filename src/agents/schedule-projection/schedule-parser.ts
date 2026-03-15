import { prisma } from "@/lib/db";

export interface ParsedScheduleGame {
  teamId: string;
  opponentTeamId: string | null;
  opponentName: string;
  date: Date;
  isHome: boolean;
  result: string | null;
}

/**
 * Parse schedule entries and attempt to match opponents to internal team records.
 */
export async function parseScheduleWithOpponents(
  teamId: string,
): Promise<ParsedScheduleGame[]> {
  const entries = await prisma.scheduleEntry.findMany({
    where: { teamId },
    orderBy: { date: "asc" },
  });

  const games: ParsedScheduleGame[] = [];

  for (const entry of entries) {
    // Try to match opponent name to a team in our database
    const opponentTeam = await prisma.team.findFirst({
      where: {
        OR: [
          { name: { contains: entry.opponentName, mode: "insensitive" } },
          {
            abbreviation: {
              equals: entry.opponentName,
              mode: "insensitive",
            },
          },
        ],
      },
    });

    games.push({
      teamId: entry.teamId,
      opponentTeamId: opponentTeam?.id ?? null,
      opponentName: entry.opponentName,
      date: entry.date,
      isHome: entry.isHome,
      result: entry.result,
    });
  }

  return games;
}
