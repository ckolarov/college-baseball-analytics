import { NextResponse } from "next/server";
import { buildPlayerProfile } from "@/agents/player-summary/profile-builder";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const profile = await buildPlayerProfile(id);
  if (!profile) {
    return NextResponse.json({ error: "Player not found" }, { status: 404 });
  }

  return NextResponse.json(profile);
}
