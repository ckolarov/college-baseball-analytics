import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { PlayerType } from "@/generated/prisma/enums";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const teamId = searchParams.get("teamId");
  const playerType = searchParams.get("playerType") as PlayerType | null;
  const search = searchParams.get("search");
  const sortBy = searchParams.get("sortBy") || "lastName";
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);
  const offset = parseInt(searchParams.get("offset") || "0");

  const where: Record<string, unknown> = {};
  if (teamId) where.teamId = teamId;
  if (playerType && Object.values(PlayerType).includes(playerType)) {
    where.playerType = playerType;
  }
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
    ];
  }

  const orderBy: Record<string, string> = {};
  const validSorts = [
    "lastName", "firstName", "pitchingPlus", "hittingPlus", "position",
  ];
  if (validSorts.includes(sortBy)) {
    orderBy[sortBy] = sortBy.includes("Plus") ? "desc" : "asc";
  } else {
    orderBy.lastName = "asc";
  }

  const [players, total] = await Promise.all([
    prisma.player.findMany({
      where: where as never,
      include: {
        team: { select: { id: true, name: true, abbreviation: true } },
      },
      orderBy: orderBy as never,
      take: limit,
      skip: offset,
    }),
    prisma.player.count({ where: where as never }),
  ]);

  return NextResponse.json({
    data: players,
    total,
    page: Math.floor(offset / limit) + 1,
    pageSize: limit,
    totalPages: Math.ceil(total / limit),
  });
}
