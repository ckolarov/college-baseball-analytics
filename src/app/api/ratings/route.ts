import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { PlayerType } from "@/generated/prisma/enums";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get("type") || "pitching"; // "pitching" | "hitting"
  const limit = Math.min(parseInt(searchParams.get("limit") || "25"), 100);
  const season = parseInt(searchParams.get("season") || String(new Date().getFullYear()));

  if (type === "pitching") {
    const leaders = await prisma.player.findMany({
      where: {
        pitchingPlus: { not: null },
        playerType: { in: [PlayerType.PITCHER, PlayerType.TWO_WAY] },
        seasonStats: {
          some: {
            season,
            inningsPitched: { gt: 10 },
          },
        },
      },
      include: {
        team: { select: { id: true, name: true, abbreviation: true } },
        seasonStats: {
          where: { season },
          take: 1,
        },
      },
      orderBy: { pitchingPlus: "desc" },
      take: limit,
    });

    return NextResponse.json({ data: leaders, type: "pitching", season });
  }

  // Hitting leaders
  const leaders = await prisma.player.findMany({
    where: {
      hittingPlus: { not: null },
      playerType: { in: [PlayerType.HITTER, PlayerType.TWO_WAY] },
      seasonStats: {
        some: {
          season,
          atBats: { gt: 25 },
        },
      },
    },
    include: {
      team: { select: { id: true, name: true, abbreviation: true } },
      seasonStats: {
        where: { season },
        take: 1,
      },
    },
    orderBy: { hittingPlus: "desc" },
    take: limit,
  });

  return NextResponse.json({ data: leaders, type: "hitting", season });
}
