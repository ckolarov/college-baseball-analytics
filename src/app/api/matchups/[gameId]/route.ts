import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ gameId: string }> },
) {
  const { gameId } = await params;

  const game = await prisma.game.findUnique({
    where: { id: gameId },
    include: {
      homeTeam: true,
      awayTeam: true,
      matchups: {
        include: {
          pitcher: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              pitchingPlus: true,
              position: true,
              teamId: true,
            },
          },
          hitter: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              hittingPlus: true,
              position: true,
              teamId: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!game) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }

  return NextResponse.json(game);
}
