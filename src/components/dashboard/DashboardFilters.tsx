"use client";

import { BarChart3, LineChart as LineChartIcon, Activity, Calendar } from "lucide-react";

interface DashboardFiltersProps {
  chartType: string;
  onChartTypeChange: (type: string) => void;
  season: number;
  onSeasonChange: (season: number) => void;
}

export function DashboardFilters({
  chartType,
  onChartTypeChange,
  season,
  onSeasonChange,
}: DashboardFiltersProps) {
  const buttons = [
    { type: "area", icon: Activity, label: "Area" },
    { type: "line", icon: LineChartIcon, label: "Line" },
    { type: "bar", icon: BarChart3, label: "Bar" },
  ];

  return (
    <div className="flex items-center gap-3">
      {/* Season selector */}
      <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5">
        <Calendar className="h-3.5 w-3.5 text-zinc-500" />
        <select
          value={season}
          onChange={(e) => onSeasonChange(Number(e.target.value))}
          className="bg-transparent text-xs text-zinc-300 outline-none cursor-pointer"
        >
          <option value={2025} className="bg-[#0d1b2a]">2025</option>
          <option value={2026} className="bg-[#0d1b2a]">2026</option>
        </select>
      </div>

      {/* Chart type */}
      <div className="flex items-center rounded-lg border border-white/10 bg-white/5 p-0.5">
        {buttons.map(({ type, icon: Icon }) => (
          <button
            key={type}
            onClick={() => onChartTypeChange(type)}
            className={`rounded-md px-2.5 py-1.5 transition ${
              chartType === type
                ? "bg-white/10 text-cyan-400"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
          </button>
        ))}
      </div>
    </div>
  );
}
