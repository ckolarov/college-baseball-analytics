import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const team1Id = searchParams.get("team1Id");
  const team2Id = searchParams.get("team2Id");

  if (!team1Id || !team2Id) {
    return NextResponse.json(
      { error: "Both team1Id and team2Id query parameters required" },
      { status: 400 },
    );
  }

  const [team1, team2] = await Promise.all([
    prisma.team.findUnique({
      where: { id: team1Id },
      include: {
        players: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            position: true,
            playerType: true,
            pitchingPlus: true,
            hittingPlus: true,
          },
          orderBy: { lastName: "asc" },
        },
        _count: { select: { players: true } },
      },
    }),
    prisma.team.findUnique({
      where: { id: team2Id },
      include: {
        players: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            position: true,
            playerType: true,
            pitchingPlus: true,
            hittingPlus: true,
          },
          orderBy: { lastName: "asc" },
        },
        _count: { select: { players: true } },
      },
    }),
  ]);

  if (!team1 || !team2) {
    return NextResponse.json(
      { error: "One or both teams not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({ team1, team2 });
}
