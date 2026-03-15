"use client";

import { RatingGauge } from "../dashboard/RatingGauge";

interface HittingPlusDisplayProps {
  hittingPlus: number | null;
  stats?: {
    battingAvg?: number | null;
    obp?: number | null;
    slg?: number | null;
    ops?: number | null;
    homeRuns?: number | null;
    rbi?: number | null;
  };
}

export function HittingPlusDisplay({
  hittingPlus,
  stats,
}: HittingPlusDisplayProps) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-6">
      <div className="flex items-center gap-6">
        <RatingGauge value={hittingPlus} label="Hitting+" size="lg" />
        {stats && (
          <div className="grid grid-cols-3 gap-4 text-sm">
            <StatItem label="BA" value={stats.battingAvg?.toFixed(3)} />
            <StatItem label="OBP" value={stats.obp?.toFixed(3)} />
            <StatItem label="SLG" value={stats.slg?.toFixed(3)} />
            <StatItem label="OPS" value={stats.ops?.toFixed(3)} />
            <StatItem label="HR" value={stats.homeRuns?.toString()} />
            <StatItem label="RBI" value={stats.rbi?.toString()} />
          </div>
        )}
      </div>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <div className="text-zinc-500 text-xs">{label}</div>
      <div className="font-mono font-semibold text-white">
        {value ?? "--"}
      </div>
    </div>
  );
}
