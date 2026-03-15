"use client";

import { useRatingLeaders } from "@/hooks/useRatings";
import { usePlayers } from "@/hooks/usePlayer";
import { useTeams } from "@/hooks/useTeam";
import { StatCard } from "./StatCard";

export function StatsGrid({ season }: { season?: number }) {
  const { data: pitchingData } = useRatingLeaders("pitching", 50, season);
  const { data: hittingData } = useRatingLeaders("hitting", 50, season);
  const { data: playersData } = usePlayers({ limit: 1 });
  const { data: teamsData } = useTeams();

  const pitchers = (pitchingData?.data ?? []) as Record<string, unknown>[];
  const hitters = (hittingData?.data ?? []) as Record<string, unknown>[];

  const pitchingValues = pitchers
    .map((p) => p.pitchingPlus as number)
    .filter(Boolean);
  const hittingValues = hitters
    .map((p) => p.hittingPlus as number)
    .filter(Boolean);

  const avgPitching =
    pitchingValues.length > 0
      ? pitchingValues.reduce((a, b) => a + b, 0) / pitchingValues.length
      : 0;
  const avgHitting =
    hittingValues.length > 0
      ? hittingValues.reduce((a, b) => a + b, 0) / hittingValues.length
      : 0;
  const topPitching =
    pitchingValues.length > 0 ? Math.max(...pitchingValues) : 0;
  const topHitting =
    hittingValues.length > 0 ? Math.max(...hittingValues) : 0;
  const totalPlayers = (playersData as Record<string, unknown>)?.total ?? 0;
  const totalTeams = Array.isArray((teamsData as Record<string, unknown>)?.data)
    ? ((teamsData as Record<string, unknown>).data as unknown[]).length
    : 0;

  return (
    <div>
      <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-zinc-400">
        Key Metrics
      </h2>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Avg Pitching+"
          value={avgPitching ? avgPitching.toFixed(1) : "--"}
          trend={avgPitching ? avgPitching - 100 : undefined}
          sparklineData={pitchingValues.slice(0, 15)}
          accentColor="pink"
        />
        <StatCard
          label="Avg Hitting+"
          value={avgHitting ? avgHitting.toFixed(1) : "--"}
          trend={avgHitting ? avgHitting - 100 : undefined}
          sparklineData={hittingValues.slice(0, 15)}
          accentColor="cyan"
        />
        <StatCard
          label="Top Pitching+"
          value={topPitching ? topPitching.toFixed(1) : "--"}
          sparklineData={pitchingValues.slice(0, 10)}
          accentColor="pink"
        />
        <StatCard
          label="Top Hitting+"
          value={topHitting ? topHitting.toFixed(1) : "--"}
          sparklineData={hittingValues.slice(0, 10)}
          accentColor="cyan"
        />
        <StatCard
          label="Players Tracked"
          value={totalPlayers as number}
          accentColor="blue"
        />
        <StatCard
          label="Teams Tracked"
          value={totalTeams as number}
          accentColor="blue"
        />
      </div>
    </div>
  );
}
