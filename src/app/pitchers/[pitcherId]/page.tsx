"use client";

import { use } from "react";
import { usePlayer } from "@/hooks/usePlayer";
import { PitchingPlusDisplay } from "@/components/ratings/PitchingPlusDisplay";
import { StuffPlusPlaceholder } from "@/components/ratings/StuffPlusPlaceholder";
import { LocationPlusPlaceholder } from "@/components/ratings/LocationPlusPlaceholder";
import { RatingGauge } from "@/components/dashboard/RatingGauge";

export default function PitcherPage({
  params,
}: {
  params: Promise<{ pitcherId: string }>;
}) {
  const { pitcherId } = use(params);
  const { data: player, isLoading } = usePlayer(pitcherId);

  if (isLoading) return <div className="animate-pulse text-zinc-500">Loading...</div>;
  if (!player) return <div className="text-zinc-500">Pitcher not found</div>;

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
            {player.throws && <><span className="text-zinc-600">·</span><span>Throws: {player.throws}</span></>}
          </div>
        </div>
        <div className="ml-auto">
          <RatingGauge value={player.pitchingPlus} label="Pitching+" size="lg" />
        </div>
      </div>

      <PitchingPlusDisplay
        pitchingPlus={player.pitchingPlus}
        stats={stats ? {
          era: stats.era,
          kPercent: stats.kPercent,
          bbPercent: stats.bbPercent,
          whip: stats.whip,
          kPerNine: stats.kPerNine,
          oppBattingAvg: stats.oppBattingAvg,
        } : undefined}
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <StuffPlusPlaceholder />
        <LocationPlusPlaceholder />
      </div>

      {player.seasonStats?.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold">Season Stats</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs text-zinc-500">
                  <th className="pb-2 pr-4">Year</th>
                  <th className="pb-2 pr-4">GP</th>
                  <th className="pb-2 pr-4">GS</th>
                  <th className="pb-2 pr-4">W-L</th>
                  <th className="pb-2 pr-4">ERA</th>
                  <th className="pb-2 pr-4">IP</th>
                  <th className="pb-2 pr-4">K</th>
                  <th className="pb-2 pr-4">BB</th>
                  <th className="pb-2 pr-4">WHIP</th>
                  <th className="pb-2 pr-4">K/9</th>
                  <th className="pb-2">Opp BA</th>
                </tr>
              </thead>
              <tbody>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {player.seasonStats.map((s: any, i: number) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-2 pr-4 font-medium">{s.season as number}</td>
                    <td className="py-2 pr-4 text-zinc-400">{(s.gamesPlayed as number) ?? "--"}</td>
                    <td className="py-2 pr-4 text-zinc-400">{(s.gamesStarted as number) ?? "--"}</td>
                    <td className="py-2 pr-4">{s.wins ?? 0}-{s.losses ?? 0}</td>
                    <td className="py-2 pr-4 font-mono">{(s.era as number)?.toFixed(2) ?? "--"}</td>
                    <td className="py-2 pr-4 font-mono">{(s.inningsPitched as number)?.toFixed(1) ?? "--"}</td>
                    <td className="py-2 pr-4 font-mono">{(s.strikeouts as number) ?? "--"}</td>
                    <td className="py-2 pr-4 font-mono">{(s.walks as number) ?? "--"}</td>
                    <td className="py-2 pr-4 font-mono">{(s.whip as number)?.toFixed(2) ?? "--"}</td>
                    <td className="py-2 pr-4 font-mono">{(s.kPerNine as number)?.toFixed(1) ?? "--"}</td>
                    <td className="py-2 font-mono">{(s.oppBattingAvg as number)?.toFixed(3) ?? "--"}</td>
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
