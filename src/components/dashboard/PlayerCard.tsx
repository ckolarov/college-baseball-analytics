"use client";

import Link from "next/link";
import { RatingGauge } from "./RatingGauge";

interface PlayerCardProps {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  playerType: string;
  teamName?: string;
  classYear?: string | null;
  pitchingPlus?: number | null;
  hittingPlus?: number | null;
}

export function PlayerCard({
  id,
  firstName,
  lastName,
  position,
  playerType,
  teamName,
  classYear,
  pitchingPlus,
  hittingPlus,
}: PlayerCardProps) {
  const href =
    playerType === "PITCHER"
      ? `/pitchers/${id}`
      : playerType === "HITTER"
        ? `/hitters/${id}`
        : `/players/${id}`;

  return (
    <Link
      href={href}
      className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-lg font-bold text-zinc-300">
        {firstName[0]}
        {lastName[0]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-white truncate">
          {firstName} {lastName}
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <span>{position}</span>
          {classYear && (
            <>
              <span className="text-zinc-600">·</span>
              <span>{classYear}</span>
            </>
          )}
          {teamName && (
            <>
              <span className="text-zinc-600">·</span>
              <span className="truncate">{teamName}</span>
            </>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        {(playerType === "PITCHER" || playerType === "TWO_WAY") && (
          <RatingGauge value={pitchingPlus ?? null} label="P+" size="sm" />
        )}
        {(playerType === "HITTER" || playerType === "TWO_WAY") && (
          <RatingGauge value={hittingPlus ?? null} label="H+" size="sm" />
        )}
      </div>
    </Link>
  );
}
