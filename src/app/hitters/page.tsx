"use client";

import { useState } from "react";
import { usePlayers } from "@/hooks/usePlayer";
import { PlayerCard } from "@/components/dashboard/PlayerCard";

export default function HittersPage() {
  const [search, setSearch] = useState("");

  const { data, isLoading } = usePlayers({
    playerType: "HITTER",
    search: search || undefined,
    sortBy: "hittingPlus",
    limit: 50,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Hitters</h1>
      <input
        type="text"
        placeholder="Search hitters..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="h-9 w-64 rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none"
      />
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg border border-white/10 bg-white/5" />
          ))}
        </div>
      ) : data?.data?.length > 0 ? (
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
      ) : (
        <div className="rounded-lg border border-dashed border-white/10 p-8 text-center text-sm text-zinc-500">
          No hitters found.
        </div>
      )}
    </div>
  );
}
