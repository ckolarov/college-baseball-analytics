"use client";

import { useState } from "react";
import { usePlayers } from "@/hooks/usePlayer";
import { usePlayerComparison } from "@/hooks/useComparison";
import { RatingGauge } from "@/components/dashboard/RatingGauge";

export default function ComparePlayersPage() {
  const [player1Id, setPlayer1Id] = useState("");
  const [player2Id, setPlayer2Id] = useState("");
  const [search, setSearch] = useState("");
  const { data: playersData } = usePlayers({ search: search || undefined, limit: 50 });
  const { data: comparison, isLoading } = usePlayerComparison(player1Id, player2Id);

  const players = (playersData?.data as Record<string, unknown>[]) ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Compare Players</h1>

      <input
        type="text"
        placeholder="Search players to compare..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="h-9 w-64 rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none"
      />

      <div className="flex flex-wrap gap-4">
        <select
          value={player1Id}
          onChange={(e) => setPlayer1Id(e.target.value)}
          className="h-9 rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-blue-500 focus:outline-none"
        >
          <option value="">Select Player 1</option>
          {players.map((p: Record<string, unknown>) => (
            <option key={p.id as string} value={p.id as string}>
              {p.firstName as string} {p.lastName as string} ({p.position as string})
            </option>
          ))}
        </select>
        <span className="flex items-center text-zinc-500">vs</span>
        <select
          value={player2Id}
          onChange={(e) => setPlayer2Id(e.target.value)}
          className="h-9 rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-blue-500 focus:outline-none"
        >
          <option value="">Select Player 2</option>
          {players.map((p: Record<string, unknown>) => (
            <option key={p.id as string} value={p.id as string}>
              {p.firstName as string} {p.lastName as string} ({p.position as string})
            </option>
          ))}
        </select>
      </div>

      {isLoading && <div className="animate-pulse text-zinc-500">Loading comparison...</div>}

      {comparison && (
        <div className="grid gap-6 lg:grid-cols-2">
          {[comparison.player1, comparison.player2].map((player: Record<string, unknown>) => (
            <div key={player.id as string} className="space-y-4 rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-lg font-bold text-zinc-300">
                  {(player.firstName as string)?.[0]}{(player.lastName as string)?.[0]}
                </div>
                <div>
                  <div className="text-lg font-semibold">{player.firstName as string} {player.lastName as string}</div>
                  <div className="text-xs text-zinc-400">
                    {player.position as string} · {player.teamName as string}
                    {player.classYear ? ` · ${player.classYear as string}` : null}
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-6">
                {player.pitchingPlus != null && (
                  <RatingGauge value={player.pitchingPlus as number} label="P+" size="md" />
                )}
                {player.hittingPlus != null && (
                  <RatingGauge value={player.hittingPlus as number} label="H+" size="md" />
                )}
              </div>

              {(player.seasonStats as Record<string, unknown>[])?.length > 0 && (
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-zinc-400">Latest Season</h3>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {player.playerType === "PITCHER" ? (
                      <>
                        <Stat label="ERA" value={((player.seasonStats as Record<string, unknown>[])[0].era as number)?.toFixed(2)} />
                        <Stat label="K%" value={((player.seasonStats as Record<string, unknown>[])[0].kPercent as number) ? `${(((player.seasonStats as Record<string, unknown>[])[0].kPercent as number) * 100).toFixed(1)}%` : undefined} />
                        <Stat label="WHIP" value={((player.seasonStats as Record<string, unknown>[])[0].whip as number)?.toFixed(2)} />
                        <Stat label="IP" value={((player.seasonStats as Record<string, unknown>[])[0].inningsPitched as number)?.toFixed(1)} />
                        <Stat label="BB%" value={((player.seasonStats as Record<string, unknown>[])[0].bbPercent as number) ? `${(((player.seasonStats as Record<string, unknown>[])[0].bbPercent as number) * 100).toFixed(1)}%` : undefined} />
                        <Stat label="K/9" value={((player.seasonStats as Record<string, unknown>[])[0].kPerNine as number)?.toFixed(1)} />
                      </>
                    ) : (
                      <>
                        <Stat label="BA" value={((player.seasonStats as Record<string, unknown>[])[0].battingAvg as number)?.toFixed(3)} />
                        <Stat label="OBP" value={((player.seasonStats as Record<string, unknown>[])[0].obp as number)?.toFixed(3)} />
                        <Stat label="SLG" value={((player.seasonStats as Record<string, unknown>[])[0].slg as number)?.toFixed(3)} />
                        <Stat label="OPS" value={((player.seasonStats as Record<string, unknown>[])[0].ops as number)?.toFixed(3)} />
                        <Stat label="HR" value={String((player.seasonStats as Record<string, unknown>[])[0].homeRuns ?? "--")} />
                        <Stat label="RBI" value={String((player.seasonStats as Record<string, unknown>[])[0].rbi ?? "--")} />
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!comparison && !isLoading && (
        <div className="rounded-lg border border-dashed border-white/10 p-8 text-center text-sm text-zinc-500">
          Select two players to compare.
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded bg-white/5 px-2 py-1">
      <div className="text-zinc-500">{label}</div>
      <div className="font-mono text-white">{value ?? "--"}</div>
    </div>
  );
}
