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
      className="glass-card flex items-center gap-4 p-3 transition"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pink-500/20 to-cyan-400/20 text-sm font-bold text-zinc-300">
        {firstName[0]}
        {lastName[0]}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-white">
          {firstName} {lastName}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
          <span>{position}</span>
          {classYear ? (
            <>
              <span className="text-zinc-700">·</span>
              <span>{classYear}</span>
            </>
          ) : null}
          {teamName ? (
            <>
              <span className="text-zinc-700">·</span>
              <span className="truncate">{teamName}</span>
            </>
          ) : null}
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
