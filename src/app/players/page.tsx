"use client";

import { useState } from "react";
import { usePlayers } from "@/hooks/usePlayer";
import { PlayerCard } from "@/components/dashboard/PlayerCard";

export default function PlayersPage() {
  const [search, setSearch] = useState("");
  const [playerType, setPlayerType] = useState<string>("");

  const { data, isLoading } = usePlayers({
    search: search || undefined,
    playerType: playerType || undefined,
    limit: 50,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Players</h1>

      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Search players..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 w-64 rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none"
        />
        <select
          value={playerType}
          onChange={(e) => setPlayerType(e.target.value)}
          className="h-9 rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-blue-500 focus:outline-none"
        >
          <option value="" className="bg-[#0a1628]">All Types</option>
          <option value="PITCHER" className="bg-[#0a1628]">Pitchers</option>
          <option value="HITTER" className="bg-[#0a1628]">Hitters</option>
          <option value="TWO_WAY" className="bg-[#0a1628]">Two-Way</option>
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg border border-white/10 bg-white/5" />
          ))}
        </div>
      ) : data?.data?.length > 0 ? (
        <>
          <p className="text-sm text-zinc-500">
            {data.total} players found
          </p>
          <div className="space-y-2">
            {data.data.map((p: Record<string, unknown>) => (
              <PlayerCard
                key={p.id as string}
                id={p.id as string}
                firstName={p.firstName as string}
                lastName={p.lastName as string}
                position={p.position as string}
                playerType={p.playerType as string}
                teamName={(p.team as Record<string, string>)?.name}
                classYear={p.classYear as string | null}
                pitchingPlus={p.pitchingPlus as number | null}
                hittingPlus={p.hittingPlus as number | null}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="rounded-lg border border-dashed border-white/10 p-8 text-center text-sm text-zinc-500">
          No players found. Run the agent pipeline to collect data.
        </div>
      )}
    </div>
  );
}
