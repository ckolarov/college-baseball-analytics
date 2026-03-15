"use client";

import { LineChart, Line, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: number;
  sparklineData?: number[];
  accentColor?: "pink" | "cyan" | "blue";
}

const colorMap = {
  pink: "#ec4899",
  cyan: "#22d3ee",
  blue: "#3b82f6",
};

export function StatCard({
  label,
  value,
  trend,
  sparklineData,
  accentColor = "cyan",
}: StatCardProps) {
  const sparkData = (sparklineData ?? []).map((v, i) => ({ i, v }));
  const strokeColor = colorMap[accentColor];

  return (
    <div className="glass-card p-4">
      <div className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
        {label}
      </div>
      <div className="mt-1 flex items-end justify-between">
        <div className="text-2xl font-bold text-white">{value}</div>
        {sparkData.length > 1 && (
          <div className="h-[30px] w-[60px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparkData}>
                <Line
                  type="monotone"
                  dataKey="v"
                  stroke={strokeColor}
                  strokeWidth={1.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
      {trend != null && (
        <div className="mt-2 flex items-center gap-1 text-xs">
          {trend > 0 ? (
            <TrendingUp className="h-3 w-3 text-emerald-400" />
          ) : trend < 0 ? (
            <TrendingDown className="h-3 w-3 text-red-400" />
          ) : (
            <Minus className="h-3 w-3 text-zinc-500" />
          )}
          <span
            className={
              trend > 0
                ? "text-emerald-400"
                : trend < 0
                  ? "text-red-400"
                  : "text-zinc-500"
            }
          >
            {trend > 0 ? "+" : ""}
            {trend.toFixed(1)}
          </span>
        </div>
      )}
    </div>
  );
}
