"use client";

interface MatchupCardProps {
  pitcherName: string;
  pitcherPitchingPlus: number | null;
  hitterName: string;
  hitterHittingPlus: number | null;
  projectedBA: number | null;
  projectedK: number | null;
  advantage: string | null;
}

export function MatchupCard({
  pitcherName,
  pitcherPitchingPlus,
  hitterName,
  hitterHittingPlus,
  projectedBA,
  projectedK,
  advantage,
}: MatchupCardProps) {
  const advColor =
    advantage === "PITCHER"
      ? "text-blue-400"
      : advantage === "HITTER"
        ? "text-red-400"
        : "text-zinc-400";

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="text-xs text-zinc-500">Pitcher</div>
          <div className="font-semibold text-white">{pitcherName}</div>
          <div className="text-sm text-zinc-400">
            P+ {pitcherPitchingPlus ?? "--"}
          </div>
        </div>
        <div className="flex flex-col items-center px-4">
          <div className="text-xs text-zinc-500">vs</div>
          <div className={`text-xs font-bold ${advColor}`}>
            {advantage ?? "—"}
          </div>
        </div>
        <div className="flex-1 text-right">
          <div className="text-xs text-zinc-500">Hitter</div>
          <div className="font-semibold text-white">{hitterName}</div>
          <div className="text-sm text-zinc-400">
            H+ {hitterHittingPlus ?? "--"}
          </div>
        </div>
      </div>
      <div className="mt-3 flex gap-4 border-t border-white/5 pt-3 text-xs">
        <div>
          <span className="text-zinc-500">Proj BA: </span>
          <span className="font-mono text-white">
            {projectedBA?.toFixed(3) ?? "--"}
          </span>
        </div>
        <div>
          <span className="text-zinc-500">Proj K%: </span>
          <span className="font-mono text-white">
            {projectedK ? `${(projectedK * 100).toFixed(1)}%` : "--"}
          </span>
        </div>
      </div>
    </div>
  );
}
