import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ teamId: string }> },
) {
  const { teamId } = await params;

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      players: {
        include: {
          seasonStats: {
            orderBy: { season: "desc" },
            take: 1,
          },
        },
        orderBy: { lastName: "asc" },
      },
      scheduleEntries: {
        orderBy: { date: "asc" },
      },
      homeGames: {
        include: {
          awayTeam: { select: { id: true, name: true } },
        },
        orderBy: { date: "asc" },
      },
      awayGames: {
        include: {
          homeTeam: { select: { id: true, name: true } },
        },
        orderBy: { date: "asc" },
      },
    },
  });

  if (!team) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }

  return NextResponse.json(team);
}
