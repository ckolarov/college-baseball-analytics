"use client";

import { use } from "react";
import { useMatchups } from "@/hooks/useMatchups";
import { MatchupCard } from "@/components/matchups/MatchupCard";
import { RatingGauge } from "@/components/dashboard/RatingGauge";

export default function MatchupDetailPage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = use(params);
  const { data: game, isLoading } = useMatchups(gameId);

  if (isLoading) return <div className="animate-pulse text-zinc-500">Loading...</div>;
  if (!game) return <div className="text-zinc-500">Game not found</div>;

  const matchups = (game.matchups as Record<string, unknown>[]) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-6">
        <div className="text-center flex-1">
          <div className="text-lg font-bold">{(game.homeTeam as Record<string, string>)?.name}</div>
          <div className="text-xs text-zinc-400">Home</div>
          {game.homeWinProb != null && (
            <div className="mt-2">
              <RatingGauge value={Math.round((game.homeWinProb as number) * 100)} label="Win%" size="sm" />
            </div>
          )}
        </div>
        <div className="flex flex-col items-center px-6">
          {game.status === "COMPLETED" ? (
            <div className="text-2xl font-bold font-mono">
              {game.homeScore} - {game.awayScore}
            </div>
          ) : (
            <div className="text-xl text-zinc-500">vs</div>
          )}
          <div className="mt-1 text-xs text-zinc-400">
            {new Date(game.date as string).toLocaleDateString()}
          </div>
          {game.status && (
            <div className={`mt-1 rounded px-2 py-0.5 text-xs ${
              game.status === "COMPLETED" ? "bg-green-500/20 text-green-400" :
              game.status === "SCHEDULED" ? "bg-blue-500/20 text-blue-400" :
              "bg-zinc-500/20 text-zinc-400"
            }`}>
              {game.status as string}
            </div>
          )}
        </div>
        <div className="text-center flex-1">
          <div className="text-lg font-bold">{(game.awayTeam as Record<string, string>)?.name}</div>
          <div className="text-xs text-zinc-400">Away</div>
          {game.awayWinProb != null && (
            <div className="mt-2">
              <RatingGauge value={Math.round((game.awayWinProb as number) * 100)} label="Win%" size="sm" />
            </div>
          )}
        </div>
      </div>

      {game.projectedHomeRuns != null && game.projectedAwayRuns != null && (
        <div className="flex justify-center gap-8 rounded-lg border border-white/10 bg-white/5 p-4 text-sm">
          <div>
            <span className="text-zinc-500">Proj Home Runs: </span>
            <span className="font-mono font-semibold">{(game.projectedHomeRuns as number).toFixed(1)}</span>
          </div>
          <div>
            <span className="text-zinc-500">Proj Away Runs: </span>
            <span className="font-mono font-semibold">{(game.projectedAwayRuns as number).toFixed(1)}</span>
          </div>
        </div>
      )}

      {matchups.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold">Pitcher vs Hitter Matchups</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {matchups.map((m: Record<string, unknown>, i: number) => {
              const pitcher = m.pitcher as Record<string, unknown>;
              const hitter = m.hitter as Record<string, unknown>;
              return (
                <MatchupCard
                  key={i}
                  pitcherName={`${pitcher.firstName} ${pitcher.lastName}`}
                  pitcherPitchingPlus={pitcher.pitchingPlus as number | null}
                  hitterName={`${hitter.firstName} ${hitter.lastName}`}
                  hitterHittingPlus={hitter.hittingPlus as number | null}
                  projectedBA={m.projectedBA as number | null}
                  projectedK={m.projectedK as number | null}
                  advantage={m.advantage as string | null}
                />
              );
            })}
          </div>
        </div>
      )}

      {matchups.length === 0 && (
        <div className="rounded-lg border border-dashed border-white/10 p-8 text-center text-sm text-zinc-500">
          No pitcher-hitter matchups projected for this game yet.
        </div>
      )}
    </div>
  );
}
