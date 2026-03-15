"use client";

import { RATING_THRESHOLDS } from "@/models/constants";

interface RatingGaugeProps {
  value: number | null;
  label: string;
  size?: "sm" | "md" | "lg";
}

function getRatingColor(value: number): string {
  if (value >= RATING_THRESHOLDS.ELITE) return "text-yellow-400";
  if (value >= RATING_THRESHOLDS.ABOVE_AVERAGE) return "text-green-400";
  if (value >= RATING_THRESHOLDS.AVERAGE_LOW) return "text-white";
  if (value >= RATING_THRESHOLDS.BELOW_AVERAGE) return "text-orange-400";
  return "text-red-400";
}

function getRatingBg(value: number): string {
  if (value >= RATING_THRESHOLDS.ELITE) return "border-yellow-400/30 bg-yellow-400/5";
  if (value >= RATING_THRESHOLDS.ABOVE_AVERAGE) return "border-green-400/30 bg-green-400/5";
  if (value >= RATING_THRESHOLDS.AVERAGE_LOW) return "border-white/20 bg-white/5";
  if (value >= RATING_THRESHOLDS.BELOW_AVERAGE) return "border-orange-400/30 bg-orange-400/5";
  return "border-red-400/30 bg-red-400/5";
}

const sizes = {
  sm: { container: "w-16 h-16", text: "text-lg", label: "text-[10px]" },
  md: { container: "w-24 h-24", text: "text-2xl", label: "text-xs" },
  lg: { container: "w-32 h-32", text: "text-4xl", label: "text-sm" },
};

export function RatingGauge({ value, label, size = "md" }: RatingGaugeProps) {
  const s = sizes[size];

  if (value === null) {
    return (
      <div className={`${s.container} flex flex-col items-center justify-center rounded-full border border-white/10 bg-white/5`}>
        <span className={`${s.text} font-bold text-zinc-500`}>--</span>
        <span className={`${s.label} text-zinc-500`}>{label}</span>
      </div>
    );
  }

  return (
    <div className={`${s.container} flex flex-col items-center justify-center rounded-full border-2 ${getRatingBg(value)}`}>
      <span className={`${s.text} font-bold ${getRatingColor(value)}`}>
        {Math.round(value)}
      </span>
      <span className={`${s.label} text-zinc-400`}>{label}</span>
    </div>
  );
}
