import { NextRequest, NextResponse } from "next/server";
import { buildPlayerProfile } from "@/agents/player-summary/profile-builder";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const player1Id = searchParams.get("player1Id");
  const player2Id = searchParams.get("player2Id");

  if (!player1Id || !player2Id) {
    return NextResponse.json(
      { error: "Both player1Id and player2Id query parameters required" },
      { status: 400 },
    );
  }

  const [player1, player2] = await Promise.all([
    buildPlayerProfile(player1Id),
    buildPlayerProfile(player2Id),
  ]);

  if (!player1 || !player2) {
    return NextResponse.json(
      { error: "One or both players not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({ player1, player2 });
}
