import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const teamId = searchParams.get("teamId");

  if (!teamId) {
    return NextResponse.json(
      { error: "teamId query parameter required" },
      { status: 400 },
    );
  }

  const entries = await prisma.scheduleEntry.findMany({
    where: { teamId },
    orderBy: { date: "asc" },
    include: {
      team: { select: { id: true, name: true } },
    },
  });

  // Try to enrich with game projections where available
  const enriched = await Promise.all(
    entries.map(async (entry) => {
      let gameData = null;
      if (entry.gameId) {
        gameData = await prisma.game.findUnique({
          where: { id: entry.gameId },
          select: {
            homeWinProb: true,
            awayWinProb: true,
            projectedHomeRuns: true,
            projectedAwayRuns: true,
            status: true,
            homeScore: true,
            awayScore: true,
          },
        });
      }

      return {
        ...entry,
        projection: gameData,
      };
    }),
  );

  return NextResponse.json({ data: enriched });
}
