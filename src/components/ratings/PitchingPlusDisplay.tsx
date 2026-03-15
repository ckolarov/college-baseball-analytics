"use client";

import { RatingGauge } from "../dashboard/RatingGauge";

interface PitchingPlusDisplayProps {
  pitchingPlus: number | null;
  stats?: {
    era?: number | null;
    kPercent?: number | null;
    bbPercent?: number | null;
    whip?: number | null;
    kPerNine?: number | null;
    oppBattingAvg?: number | null;
  };
}

export function PitchingPlusDisplay({
  pitchingPlus,
  stats,
}: PitchingPlusDisplayProps) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-6">
      <div className="flex items-center gap-6">
        <RatingGauge value={pitchingPlus} label="Pitching+" size="lg" />
        {stats && (
          <div className="grid grid-cols-3 gap-4 text-sm">
            <StatItem label="ERA" value={stats.era?.toFixed(2)} />
            <StatItem label="K%" value={stats.kPercent ? `${(stats.kPercent * 100).toFixed(1)}%` : undefined} />
            <StatItem label="BB%" value={stats.bbPercent ? `${(stats.bbPercent * 100).toFixed(1)}%` : undefined} />
            <StatItem label="WHIP" value={stats.whip?.toFixed(2)} />
            <StatItem label="K/9" value={stats.kPerNine?.toFixed(1)} />
            <StatItem label="Opp BA" value={stats.oppBattingAvg?.toFixed(3)} />
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
