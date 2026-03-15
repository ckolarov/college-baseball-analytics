import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const conference = searchParams.get("conference");
  const search = searchParams.get("search");
  const sortBy = searchParams.get("sortBy") || "name";

  const where: Record<string, unknown> = {};
  if (conference) {
    where.conference = { contains: conference, mode: "insensitive" };
  }
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { abbreviation: { contains: search, mode: "insensitive" } },
    ];
  }

  const orderBy: Record<string, string> = {};
  const validSorts = [
    "name", "rpiRank", "teamPitchingPlus", "teamHittingPlus",
  ];
  if (validSorts.includes(sortBy)) {
    orderBy[sortBy] = sortBy === "name" ? "asc" : "desc";
  } else {
    orderBy.name = "asc";
  }

  const teams = await prisma.team.findMany({
    where: where as never,
    include: {
      _count: { select: { players: true } },
    },
    orderBy: orderBy as never,
  });

  return NextResponse.json({ data: teams });
}
