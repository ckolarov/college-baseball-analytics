"use client";

import { use } from "react";
import { usePlayer } from "@/hooks/usePlayer";
import { HittingPlusDisplay } from "@/components/ratings/HittingPlusDisplay";
import { RatingGauge } from "@/components/dashboard/RatingGauge";

export default function HitterPage({
  params,
}: {
  params: Promise<{ hitterId: string }>;
}) {
  const { hitterId } = use(params);
  const { data: player, isLoading } = usePlayer(hitterId);

  if (isLoading) return <div className="animate-pulse text-zinc-500">Loading...</div>;
  if (!player) return <div className="text-zinc-500">Hitter not found</div>;

  const stats = player.seasonStats?.[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/10 text-2xl font-bold text-zinc-300">
          {player.firstName[0]}{player.lastName[0]}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{player.firstName} {player.lastName}</h1>
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <span>{player.position}</span>
            <span className="text-zinc-600">·</span>
            <span>{player.teamName}</span>
            {player.classYear && <><span className="text-zinc-600">·</span><span>{player.classYear}</span></>}
            {player.bats && <><span className="text-zinc-600">·</span><span>Bats: {player.bats}</span></>}
          </div>
        </div>
        <div className="ml-auto">
          <RatingGauge value={player.hittingPlus} label="Hitting+" size="lg" />
        </div>
      </div>

      <HittingPlusDisplay
        hittingPlus={player.hittingPlus}
        stats={stats ? {
          battingAvg: stats.battingAvg,
          obp: stats.obp,
          slg: stats.slg,
          ops: stats.ops,
          homeRuns: stats.homeRuns,
          rbi: stats.rbi,
        } : undefined}
      />

      {player.seasonStats?.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold">Season Stats</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs text-zinc-500">
                  <th className="pb-2 pr-4">Year</th>
                  <th className="pb-2 pr-4">GP</th>
                  <th className="pb-2 pr-4">AB</th>
                  <th className="pb-2 pr-4">BA</th>
                  <th className="pb-2 pr-4">OBP</th>
                  <th className="pb-2 pr-4">SLG</th>
                  <th className="pb-2 pr-4">OPS</th>
                  <th className="pb-2 pr-4">HR</th>
                  <th className="pb-2 pr-4">RBI</th>
                  <th className="pb-2 pr-4">SB</th>
                  <th className="pb-2">K%</th>
                </tr>
              </thead>
              <tbody>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {player.seasonStats.map((s: any, i: number) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-2 pr-4 font-medium">{s.season as number}</td>
                    <td className="py-2 pr-4 text-zinc-400">{(s.gamesPlayed as number) ?? "--"}</td>
                    <td className="py-2 pr-4 text-zinc-400">{(s.atBats as number) ?? "--"}</td>
                    <td className="py-2 pr-4 font-mono">{(s.battingAvg as number)?.toFixed(3) ?? "--"}</td>
                    <td className="py-2 pr-4 font-mono">{(s.obp as number)?.toFixed(3) ?? "--"}</td>
                    <td className="py-2 pr-4 font-mono">{(s.slg as number)?.toFixed(3) ?? "--"}</td>
                    <td className="py-2 pr-4 font-mono">{(s.ops as number)?.toFixed(3) ?? "--"}</td>
                    <td className="py-2 pr-4 font-mono">{(s.homeRuns as number) ?? "--"}</td>
                    <td className="py-2 pr-4 font-mono">{(s.rbi as number) ?? "--"}</td>
                    <td className="py-2 pr-4 font-mono">{(s.stolenBases as number) ?? "--"}</td>
                    <td className="py-2 font-mono">{(s.kRateHitting as number) ? `${((s.kRateHitting as number) * 100).toFixed(1)}%` : "--"}</td>
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
