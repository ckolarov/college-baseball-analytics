"use client";

import { use } from "react";
import { usePlayer } from "@/hooks/usePlayer";
import { RatingGauge } from "@/components/dashboard/RatingGauge";
import { PitchingPlusDisplay } from "@/components/ratings/PitchingPlusDisplay";
import { HittingPlusDisplay } from "@/components/ratings/HittingPlusDisplay";
import { StuffPlusPlaceholder } from "@/components/ratings/StuffPlusPlaceholder";
import { LocationPlusPlaceholder } from "@/components/ratings/LocationPlusPlaceholder";

export default function PlayerPage({
  params,
}: {
  params: Promise<{ playerId: string }>;
}) {
  const { playerId } = use(params);
  const { data: player, isLoading } = usePlayer(playerId);

  if (isLoading) {
    return <div className="animate-pulse text-zinc-500">Loading player...</div>;
  }

  if (!player) {
    return <div className="text-zinc-500">Player not found</div>;
  }

  const latestStats = player.seasonStats?.[0];
  const isPitcher =
    player.playerType === "PITCHER" || player.playerType === "TWO_WAY";
  const isHitter =
    player.playerType === "HITTER" || player.playerType === "TWO_WAY";

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="flex items-center gap-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/10 text-2xl font-bold text-zinc-300">
          {player.firstName[0]}
          {player.lastName[0]}
        </div>
        <div>
          <h1 className="text-2xl font-bold">
            {player.firstName} {player.lastName}
          </h1>
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <span>{player.position}</span>
            <span className="text-zinc-600">·</span>
            <span>{player.teamName}</span>
            {player.classYear && (
              <>
                <span className="text-zinc-600">·</span>
                <span>{player.classYear}</span>
              </>
            )}
            {player.bats && (
              <>
                <span className="text-zinc-600">·</span>
                <span>B: {player.bats}</span>
              </>
            )}
            {player.throws && (
              <>
                <span className="text-zinc-600">·</span>
                <span>T: {player.throws}</span>
              </>
            )}
          </div>
        </div>
        <div className="ml-auto flex gap-3">
          {isPitcher && (
            <RatingGauge value={player.pitchingPlus} label="P+" size="md" />
          )}
          {isHitter && (
            <RatingGauge value={player.hittingPlus} label="H+" size="md" />
          )}
        </div>
      </div>

      {/* Ratings */}
      <div className="space-y-4">
        {isPitcher && (
          <PitchingPlusDisplay
            pitchingPlus={player.pitchingPlus}
            stats={latestStats ? {
              era: latestStats.era,
              kPercent: latestStats.kPercent,
              bbPercent: latestStats.bbPercent,
              whip: latestStats.whip,
              kPerNine: latestStats.kPerNine,
              oppBattingAvg: latestStats.oppBattingAvg,
            } : undefined}
          />
        )}
        {isHitter && (
          <HittingPlusDisplay
            hittingPlus={player.hittingPlus}
            stats={latestStats ? {
              battingAvg: latestStats.battingAvg,
              obp: latestStats.obp,
              slg: latestStats.slg,
              ops: latestStats.ops,
              homeRuns: latestStats.homeRuns,
              rbi: latestStats.rbi,
            } : undefined}
          />
        )}
      </div>

      {/* Placeholders */}
      {isPitcher && (
        <div className="grid gap-3 sm:grid-cols-2">
          <StuffPlusPlaceholder />
          <LocationPlusPlaceholder />
        </div>
      )}

      {/* Season Stats Table */}
      {player.seasonStats?.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold">Season Stats</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs text-zinc-500">
                  <th className="pb-2 pr-4">Year</th>
                  <th className="pb-2 pr-4">GP</th>
                  {isPitcher && (
                    <>
                      <th className="pb-2 pr-4">W-L</th>
                      <th className="pb-2 pr-4">ERA</th>
                      <th className="pb-2 pr-4">IP</th>
                      <th className="pb-2 pr-4">K</th>
                      <th className="pb-2 pr-4">BB</th>
                      <th className="pb-2 pr-4">WHIP</th>
                    </>
                  )}
                  {isHitter && (
                    <>
                      <th className="pb-2 pr-4">BA</th>
                      <th className="pb-2 pr-4">OBP</th>
                      <th className="pb-2 pr-4">SLG</th>
                      <th className="pb-2 pr-4">HR</th>
                      <th className="pb-2 pr-4">RBI</th>
                      <th className="pb-2 pr-4">SB</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {player.seasonStats.map(
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (s: any, i: number) => (
                    <tr
                      key={i}
                      className="border-b border-white/5 hover:bg-white/5"
                    >
                      <td className="py-2 pr-4 font-medium">
                        {s.season as number}
                      </td>
                      <td className="py-2 pr-4 text-zinc-400">
                        {(s.gamesPlayed as number) ?? "--"}
                      </td>
                      {isPitcher && (
                        <>
                          <td className="py-2 pr-4 text-zinc-400">
                            {s.wins ?? 0}-{s.losses ?? 0}
                          </td>
                          <td className="py-2 pr-4 font-mono">
                            {(s.era as number)?.toFixed(2) ?? "--"}
                          </td>
                          <td className="py-2 pr-4 font-mono">
                            {(s.inningsPitched as number)?.toFixed(1) ?? "--"}
                          </td>
                          <td className="py-2 pr-4 font-mono">
                            {(s.strikeouts as number) ?? "--"}
                          </td>
                          <td className="py-2 pr-4 font-mono">
                            {(s.walks as number) ?? "--"}
                          </td>
                          <td className="py-2 pr-4 font-mono">
                            {(s.whip as number)?.toFixed(2) ?? "--"}
                          </td>
                        </>
                      )}
                      {isHitter && (
                        <>
                          <td className="py-2 pr-4 font-mono">
                            {(s.battingAvg as number)?.toFixed(3) ?? "--"}
                          </td>
                          <td className="py-2 pr-4 font-mono">
                            {(s.obp as number)?.toFixed(3) ?? "--"}
                          </td>
                          <td className="py-2 pr-4 font-mono">
                            {(s.slg as number)?.toFixed(3) ?? "--"}
                          </td>
                          <td className="py-2 pr-4 font-mono">
                            {(s.homeRuns as number) ?? "--"}
                          </td>
                          <td className="py-2 pr-4 font-mono">
                            {(s.rbi as number) ?? "--"}
                          </td>
                          <td className="py-2 pr-4 font-mono">
                            {(s.stolenBases as number) ?? "--"}
                          </td>
                        </>
                      )}
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
