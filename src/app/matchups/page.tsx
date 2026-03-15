"use client";

import { useState } from "react";
import Link from "next/link";
import { useTeams } from "@/hooks/useTeam";
import { useProjections } from "@/hooks/useMatchups";

export default function MatchupsPage() {
  const [teamId, setTeamId] = useState("");
  const { data: teams } = useTeams();
  const { data: projections, isLoading } = useProjections(teamId);

  const teamList = ((teams as Record<string, unknown>)?.data as Record<string, unknown>[]) ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Matchup Projections</h1>

      <select
        value={teamId}
        onChange={(e) => setTeamId(e.target.value)}
        className="h-9 rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-blue-500 focus:outline-none"
      >
        <option value="">Select a team...</option>
        {teamList.map((t: Record<string, unknown>) => (
          <option key={t.id as string} value={t.id as string}>
            {t.name as string}
          </option>
        ))}
      </select>

      {isLoading && <div className="animate-pulse text-zinc-500">Loading projections...</div>}

      {projections?.data && (projections.data as Record<string, unknown>[]).length > 0 ? (
        <div className="space-y-2">
          {(projections.data as Record<string, unknown>[]).map((game: Record<string, unknown>) => (
            <Link
              key={game.id as string}
              href={`/matchups/${game.id}`}
              className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/5 px-4 py-3 transition hover:border-white/20 hover:bg-white/[0.08]"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold">
                    {(game.homeTeam as Record<string, string>)?.name ?? "TBD"}
                  </span>
                  <span className="text-zinc-500">vs</span>
                  <span className="font-semibold">
                    {(game.awayTeam as Record<string, string>)?.name ?? "TBD"}
                  </span>
                </div>
                <div className="text-xs text-zinc-400">
                  {new Date(game.date as string).toLocaleDateString()}
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs">
                {game.homeWinProb != null && (
                  <div className="text-right">
                    <div className="text-zinc-500">Home Win</div>
                    <div className="font-mono text-white">
                      {((game.homeWinProb as number) * 100).toFixed(0)}%
                    </div>
                  </div>
                )}
                {game.status === "COMPLETED" ? (
                  <div className="rounded bg-green-500/20 px-2 py-0.5 text-green-400">
                    {String(game.homeScore)}-{String(game.awayScore)}
                  </div>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      ) : teamId && !isLoading ? (
        <div className="rounded-lg border border-dashed border-white/10 p-8 text-center text-sm text-zinc-500">
          No matchup projections found for this team.
        </div>
      ) : null}
    </div>
  );
}
