"use client";

import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useRatingLeaders } from "@/hooks/useRatings";

export function HeroChart({ season }: { season?: number }) {
  const { data: pitchingData } = useRatingLeaders("pitching", 30, season);
  const { data: hittingData } = useRatingLeaders("hitting", 30, season);

  const pitchers = (pitchingData?.data ?? []) as Record<string, unknown>[];
  const hitters = (hittingData?.data ?? []) as Record<string, unknown>[];

  const maxLen = Math.max(pitchers.length, hitters.length, 1);
  const chartData = Array.from({ length: maxLen }, (_, i) => ({
    rank: i + 1,
    pitchingPlus: pitchers[i]
      ? (pitchers[i].pitchingPlus as number)
      : undefined,
    hittingPlus: hitters[i] ? (hitters[i].hittingPlus as number) : undefined,
  }));

  // If no data, show a demo wave
  const hasData = pitchers.length > 0 || hitters.length > 0;
  const displayData = hasData
    ? chartData
    : Array.from({ length: 30 }, (_, i) => ({
        rank: i + 1,
        pitchingPlus: 100 + 30 * Math.sin((i / 30) * Math.PI) * Math.exp(-i / 20),
        hittingPlus: 100 + 25 * Math.cos((i / 30) * Math.PI) * Math.exp(-i / 25),
      }));

  return (
    <div className="glass-panel p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-400">
            Performance Landscape
          </h2>
          <p className="text-xs text-zinc-500">
            {hasData
              ? "Top rated players by Pitching+ and Hitting+"
              : "Sample visualization — run agents to populate data"}
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs text-zinc-400">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-pink-500" />
            Pitching+
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-cyan-400" />
            Hitting+
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={displayData}>
          <defs>
            <linearGradient id="pinkGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ec4899" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#ec4899" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="rank" hide />
          <YAxis hide domain={["auto", "auto"]} />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              return (
                <div className="glow-pink rounded-lg bg-[#0d1b2a] px-3 py-2 text-xs shadow-lg">
                  {payload.map((p) => (
                    <div key={p.dataKey as string} className="flex items-center gap-2">
                      <span
                        className="inline-block h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: p.color }}
                      />
                      <span className="text-zinc-400">{p.dataKey === "pitchingPlus" ? "P+" : "H+"}</span>
                      <span className="font-mono font-bold text-white">
                        {(p.value as number)?.toFixed(1)}
                      </span>
                    </div>
                  ))}
                </div>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="pitchingPlus"
            stroke="#ec4899"
            strokeWidth={2}
            fill="url(#pinkGradient)"
            dot={false}
            connectNulls
          />
          <Area
            type="monotone"
            dataKey="hittingPlus"
            stroke="#22d3ee"
            strokeWidth={2}
            fill="url(#cyanGradient)"
            dot={false}
            connectNulls
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
