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

  const team = await prisma.team.findUnique({
    where: { id: teamId },
  });

  if (!team) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }

  // Get all games for this team (home or away)
  const games = await prisma.game.findMany({
    where: {
      OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }],
    },
    include: {
      homeTeam: {
        select: {
          id: true,
          name: true,
          rpiRank: true,
          teamPitchingPlus: true,
          teamHittingPlus: true,
        },
      },
      awayTeam: {
        select: {
          id: true,
          name: true,
          rpiRank: true,
          teamPitchingPlus: true,
          teamHittingPlus: true,
        },
      },
    },
    orderBy: { date: "asc" },
  });

  // Calculate season projection
  let projectedWins = 0;
  let projectedLosses = 0;

  const schedule = games.map((game) => {
    const isHome = game.homeTeamId === teamId;
    const winProb = isHome ? game.homeWinProb : game.awayWinProb;
    const opponent = isHome ? game.awayTeam : game.homeTeam;

    if (winProb !== null) {
      projectedWins += winProb;
      projectedLosses += 1 - winProb;
    }

    return {
      gameId: game.id,
      date: game.date,
      opponent: {
        id: opponent.id,
        name: opponent.name,
        rpiRank: opponent.rpiRank,
        teamPitchingPlus: opponent.teamPitchingPlus,
        teamHittingPlus: opponent.teamHittingPlus,
      },
      isHome,
      status: game.status,
      homeScore: game.homeScore,
      awayScore: game.awayScore,
      winProbability: winProb,
      projectedRuns: isHome ? game.projectedHomeRuns : game.projectedAwayRuns,
      projectedOppRuns: isHome
        ? game.projectedAwayRuns
        : game.projectedHomeRuns,
    };
  });

  return NextResponse.json({
    team: {
      id: team.id,
      name: team.name,
      rpiRank: team.rpiRank,
      teamPitchingPlus: team.teamPitchingPlus,
      teamHittingPlus: team.teamHittingPlus,
    },
    schedule,
    projection: {
      projectedWins: Math.round(projectedWins * 10) / 10,
      projectedLosses: Math.round(projectedLosses * 10) / 10,
      totalGames: games.length,
    },
  });
}
