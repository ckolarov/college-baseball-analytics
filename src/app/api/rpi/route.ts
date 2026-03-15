import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const season = parseInt(
    searchParams.get("season") || String(new Date().getFullYear()),
  );
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 400);

  const rankings = await prisma.rpiRanking.findMany({
    where: { season },
    orderBy: { rank: "asc" },
    take: limit,
  });

  return NextResponse.json({ data: rankings, season });
}
