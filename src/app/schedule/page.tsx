"use client";

import { useState } from "react";
import Link from "next/link";
import { useTeams } from "@/hooks/useTeam";
import { useSchedule } from "@/hooks/useSchedule";

export default function SchedulePage() {
  const [teamId, setTeamId] = useState("");
  const { data: teams } = useTeams();
  const { data: schedule, isLoading } = useSchedule(teamId);

  const teamList = ((teams as Record<string, unknown>)?.data as Record<string, unknown>[]) ?? [];
  const entries = (schedule?.data as Record<string, unknown>[]) ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Schedule</h1>

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

      {isLoading && <div className="animate-pulse text-zinc-500">Loading schedule...</div>}

      {entries.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs text-zinc-500">
                <th className="pb-2 pr-4">Date</th>
                <th className="pb-2 pr-4">Opponent</th>
                <th className="pb-2 pr-4">Location</th>
                <th className="pb-2 pr-4">Result</th>
                <th className="pb-2 pr-4">Win Prob</th>
                <th className="pb-2">Proj Score</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry: Record<string, unknown>, i: number) => {
                const proj = entry.projection as Record<string, unknown> | null;
                const isCompleted = proj?.status === "COMPLETED";
                return (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-2 pr-4 text-zinc-400">
                      {new Date(entry.date as string).toLocaleDateString()}
                    </td>
                    <td className="py-2 pr-4 font-medium">
                      {entry.gameId ? (
                        <Link href={`/matchups/${entry.gameId}`} className="hover:text-blue-400">
                          {entry.opponent as string ?? "TBD"}
                        </Link>
                      ) : (
                        entry.opponent as string ?? "TBD"
                      )}
                    </td>
                    <td className="py-2 pr-4 text-zinc-400">
                      {entry.location as string ?? "--"}
                    </td>
                    <td className="py-2 pr-4 font-mono">
                      {isCompleted
                        ? `${proj?.homeScore}-${proj?.awayScore}`
                        : "--"}
                    </td>
                    <td className="py-2 pr-4 font-mono">
                      {proj?.homeWinProb != null
                        ? `${((proj.homeWinProb as number) * 100).toFixed(0)}%`
                        : "--"}
                    </td>
                    <td className="py-2 font-mono text-zinc-400">
                      {proj?.projectedHomeRuns != null && proj?.projectedAwayRuns != null
                        ? `${(proj.projectedHomeRuns as number).toFixed(1)}-${(proj.projectedAwayRuns as number).toFixed(1)}`
                        : "--"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : teamId && !isLoading ? (
        <div className="rounded-lg border border-dashed border-white/10 p-8 text-center text-sm text-zinc-500">
          No schedule entries found for this team.
        </div>
      ) : null}
    </div>
  );
}
