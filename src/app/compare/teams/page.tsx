"use client";

import { useState } from "react";
import { useTeams } from "@/hooks/useTeam";
import { useTeamComparison } from "@/hooks/useComparison";
import { RatingGauge } from "@/components/dashboard/RatingGauge";
import { RosterTable } from "@/components/team/RosterTable";

export default function CompareTeamsPage() {
  const [team1Id, setTeam1Id] = useState("");
  const [team2Id, setTeam2Id] = useState("");
  const { data: teams } = useTeams();
  const { data: comparison, isLoading } = useTeamComparison(team1Id, team2Id);

  const teamList = (teams as Record<string, unknown>[]) ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Compare Teams</h1>

      <div className="flex flex-wrap gap-4">
        <select
          value={team1Id}
          onChange={(e) => setTeam1Id(e.target.value)}
          className="h-9 rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-blue-500 focus:outline-none"
        >
          <option value="">Select Team 1</option>
          {teamList.map((t: Record<string, unknown>) => (
            <option key={t.id as string} value={t.id as string}>
              {t.name as string}
            </option>
          ))}
        </select>
        <span className="flex items-center text-zinc-500">vs</span>
        <select
          value={team2Id}
          onChange={(e) => setTeam2Id(e.target.value)}
          className="h-9 rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-blue-500 focus:outline-none"
        >
          <option value="">Select Team 2</option>
          {teamList.map((t: Record<string, unknown>) => (
            <option key={t.id as string} value={t.id as string}>
              {t.name as string}
            </option>
          ))}
        </select>
      </div>

      {isLoading && <div className="animate-pulse text-zinc-500">Loading comparison...</div>}

      {comparison && (
        <div className="grid gap-6 lg:grid-cols-2">
          {[comparison.team1, comparison.team2].map((team: Record<string, unknown>) => (
            <div key={team.id as string} className="space-y-4 rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-zinc-300">
                  {(team.name as string)?.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="text-lg font-semibold">{team.name as string}</div>
                  {team.conference ? (
                    <div className="text-xs text-zinc-400">{team.conference as string}</div>
                  ) : null}
                </div>
              </div>

              <div className="flex justify-center gap-6">
                <RatingGauge value={team.compositePitchingPlus as number} label="P+" size="md" />
                <RatingGauge value={team.compositeHittingPlus as number} label="H+" size="md" />
              </div>

              <div className="text-xs text-zinc-400">
                {(team._count as Record<string, number>)?.players ?? 0} players
              </div>

              {(team.players as Record<string, unknown>[])?.length > 0 && (
                <RosterTable players={team.players as never} />
              )}
            </div>
          ))}
        </div>
      )}

      {!comparison && team1Id && team2Id && !isLoading && (
        <div className="rounded-lg border border-dashed border-white/10 p-8 text-center text-sm text-zinc-500">
          Select two teams to compare.
        </div>
      )}
    </div>
  );
}
