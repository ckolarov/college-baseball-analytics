"use client";

import { useState } from "react";
import Link from "next/link";
import { useTeams } from "@/hooks/useTeam";
import { RatingGauge } from "@/components/dashboard/RatingGauge";

export default function TeamsPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useTeams({ search: search || undefined });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Teams</h1>
      <input
        type="text"
        placeholder="Search teams..."
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
      ) : (data as Record<string, unknown>[])?.length > 0 ? (
        <div className="space-y-2">
          {(data as Record<string, unknown>[]).map((t: Record<string, unknown>) => (
            <Link
              key={t.id as string}
              href={`/teams/${t.id}`}
              className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/5 px-4 py-3 transition hover:border-white/20 hover:bg-white/[0.08]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-zinc-300">
                {(t.name as string)?.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-white">{t.name as string}</div>
                {t.conference ? (
                  <div className="text-xs text-zinc-400">{t.conference as string}</div>
                ) : null}
              </div>
              <div className="flex items-center gap-3">
                {t.compositePitchingPlus != null && (
                  <RatingGauge value={t.compositePitchingPlus as number} label="P+" size="sm" />
                )}
                {t.compositeHittingPlus != null && (
                  <RatingGauge value={t.compositeHittingPlus as number} label="H+" size="sm" />
                )}
              </div>
              <div className="text-xs text-zinc-500">
                {t._count && (t._count as Record<string, number>).players
                  ? `${(t._count as Record<string, number>).players} players`
                  : ""}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-white/10 p-8 text-center text-sm text-zinc-500">
          No teams found.
        </div>
      )}
    </div>
  );
}
