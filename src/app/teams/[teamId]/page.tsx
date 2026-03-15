"use client";

import { use } from "react";
import { useTeam } from "@/hooks/useTeam";
import { RatingGauge } from "@/components/dashboard/RatingGauge";
import { RosterTable } from "@/components/team/RosterTable";

export default function TeamPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = use(params);
  const { data: team, isLoading } = useTeam(teamId);

  if (isLoading) return <div className="animate-pulse text-zinc-500">Loading...</div>;
  if (!team) return <div className="text-zinc-500">Team not found</div>;

  const pitchers = (team.players as Record<string, unknown>[])?.filter(
    (p: Record<string, unknown>) => p.playerType === "PITCHER"
  ) ?? [];
  const hitters = (team.players as Record<string, unknown>[])?.filter(
    (p: Record<string, unknown>) => p.playerType === "HITTER"
  ) ?? [];

  const allGames = [
    ...(team.homeGames ?? []).map((g: Record<string, unknown>) => ({
      ...g,
      isHome: true,
      opponent: g.awayTeam,
    })),
    ...(team.awayGames ?? []).map((g: Record<string, unknown>) => ({
      ...g,
      isHome: false,
      opponent: g.homeTeam,
    })),
  ].sort((a, b) => new Date(a.date as string).getTime() - new Date(b.date as string).getTime());

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/10 text-2xl font-bold text-zinc-300">
          {(team.name as string)?.substring(0, 2).toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{team.name}</h1>
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            {team.conference && <span>{team.conference}</span>}
            {team.rpiRank && (
              <>
                <span className="text-zinc-600">·</span>
                <span>RPI #{team.rpiRank}</span>
              </>
            )}
          </div>
        </div>
        <div className="ml-auto flex items-center gap-4">
          {team.compositePitchingPlus != null && (
            <RatingGauge value={team.compositePitchingPlus} label="Team P+" size="lg" />
          )}
          {team.compositeHittingPlus != null && (
            <RatingGauge value={team.compositeHittingPlus} label="Team H+" size="lg" />
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-lg font-semibold">Pitchers ({pitchers.length})</h2>
          {pitchers.length > 0 ? (
            <RosterTable players={pitchers as never} />
          ) : (
            <div className="text-sm text-zinc-500">No pitchers found</div>
          )}
        </div>
        <div>
          <h2 className="mb-3 text-lg font-semibold">Hitters ({hitters.length})</h2>
          {hitters.length > 0 ? (
            <RosterTable players={hitters as never} />
          ) : (
            <div className="text-sm text-zinc-500">No hitters found</div>
          )}
        </div>
      </div>

      {allGames.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold">Schedule</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs text-zinc-500">
                  <th className="pb-2 pr-4">Date</th>
                  <th className="pb-2 pr-4">Opponent</th>
                  <th className="pb-2 pr-4">H/A</th>
                  <th className="pb-2 pr-4">Result</th>
                  <th className="pb-2">Win Prob</th>
                </tr>
              </thead>
              <tbody>
                {allGames.map((g: Record<string, unknown>, i: number) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-2 pr-4 text-zinc-400">
                      {new Date(g.date as string).toLocaleDateString()}
                    </td>
                    <td className="py-2 pr-4 font-medium">
                      {(g.opponent as Record<string, string>)?.name ?? "TBD"}
                    </td>
                    <td className="py-2 pr-4 text-zinc-400">
                      {g.isHome ? "Home" : "Away"}
                    </td>
                    <td className="py-2 pr-4 font-mono">
                      {g.status === "COMPLETED"
                        ? `${g.homeScore}-${g.awayScore}`
                        : "--"}
                    </td>
                    <td className="py-2 font-mono">
                      {g.isHome && g.homeWinProb
                        ? `${((g.homeWinProb as number) * 100).toFixed(0)}%`
                        : !g.isHome && g.awayWinProb
                          ? `${((g.awayWinProb as number) * 100).toFixed(0)}%`
                          : "--"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
