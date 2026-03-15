"use client";

import { useState } from "react";
import { useRatingLeaders } from "@/hooks/useRatings";
import { PlayerCard } from "@/components/dashboard/PlayerCard";
import { HeroChart } from "@/components/dashboard/HeroChart";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";

export default function Home() {
  const [chartType, setChartType] = useState("area");
  const [season, setSeason] = useState(2025);

  const { data: pitchingLeaders, isLoading: loadingPitching } =
    useRatingLeaders("pitching", 5, season);
  const { data: hittingLeaders, isLoading: loadingHitting } =
    useRatingLeaders("hitting", 5, season);

  return (
    <div className="space-y-6">
      {/* Header + Filters */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Dashboard</h1>
          <p className="mt-0.5 text-xs text-zinc-500">
            Pitching+ and Hitting+ analytics — 100 = D1 Average
          </p>
        </div>
        <DashboardFilters
          chartType={chartType}
          onChartTypeChange={setChartType}
          season={season}
          onSeasonChange={setSeason}
        />
      </div>

      {/* Main Grid: Content + Sidebar */}
      <div className="grid gap-6 xl:grid-cols-4">
        {/* Left: 3 columns */}
        <div className="space-y-6 xl:col-span-3">
          <HeroChart season={season} />
          <StatsGrid season={season} />

          {/* Leaderboards */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-zinc-400">
                Top Pitching+
              </h2>
              <div className="space-y-1.5">
                {loadingPitching ? (
                  <LoadingSkeleton count={5} />
                ) : pitchingLeaders?.data?.length > 0 ? (
                  pitchingLeaders.data.map(
                    (p: Record<string, unknown>) => (
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
                    ),
                  )
                ) : (
                  <EmptyState message="No pitching data yet." />
                )}
              </div>
            </div>

            <div>
              <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-zinc-400">
                Top Hitting+
              </h2>
              <div className="space-y-1.5">
                {loadingHitting ? (
                  <LoadingSkeleton count={5} />
                ) : hittingLeaders?.data?.length > 0 ? (
                  hittingLeaders.data.map(
                    (p: Record<string, unknown>) => (
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
                    ),
                  )
                ) : (
                  <EmptyState message="No hitting data yet." />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          <ActivityFeed />

          {/* Rating Scale */}
          <div className="glass-panel p-4">
            <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
              Rating Scale
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-yellow-400" />
                <span className="text-yellow-400">120+</span>
                <span className="text-zinc-500">Elite</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-400" />
                <span className="text-green-400">105-120</span>
                <span className="text-zinc-500">Above Avg</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-white" />
                <span className="text-white">95-105</span>
                <span className="text-zinc-500">Average</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-orange-400" />
                <span className="text-orange-400">80-95</span>
                <span className="text-zinc-500">Below Avg</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-400" />
                <span className="text-red-400">&lt;80</span>
                <span className="text-zinc-500">Poor</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-14 animate-pulse rounded-xl border border-white/[0.06] bg-white/[0.03]"
        />
      ))}
    </>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="glass-panel border-dashed p-6 text-center text-xs text-zinc-500">
      {message}
    </div>
  );
}
