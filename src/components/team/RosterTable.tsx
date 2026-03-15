"use client";

import Link from "next/link";
import { RATING_THRESHOLDS } from "@/models/constants";

interface RosterPlayer {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  playerType: string;
  classYear?: string | null;
  pitchingPlus?: number | null;
  hittingPlus?: number | null;
}

interface RosterTableProps {
  players: RosterPlayer[];
}

function ratingClass(val: number | null | undefined): string {
  if (val == null) return "text-zinc-500";
  if (val >= RATING_THRESHOLDS.ELITE) return "text-yellow-400 font-bold";
  if (val >= RATING_THRESHOLDS.ABOVE_AVERAGE) return "text-green-400";
  if (val >= RATING_THRESHOLDS.AVERAGE_LOW) return "text-white";
  if (val >= RATING_THRESHOLDS.BELOW_AVERAGE) return "text-orange-400";
  return "text-red-400";
}

export function RosterTable({ players }: RosterTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 text-left text-xs text-zinc-500">
            <th className="pb-2 pr-4">Name</th>
            <th className="pb-2 pr-4">Pos</th>
            <th className="pb-2 pr-4">Yr</th>
            <th className="pb-2 pr-4 text-right">P+</th>
            <th className="pb-2 text-right">H+</th>
          </tr>
        </thead>
        <tbody>
          {players.map((p) => {
            const href =
              p.playerType === "PITCHER"
                ? `/pitchers/${p.id}`
                : `/hitters/${p.id}`;
            return (
              <tr
                key={p.id}
                className="border-b border-white/5 hover:bg-white/5"
              >
                <td className="py-2 pr-4">
                  <Link
                    href={href}
                    className="text-white hover:text-blue-400"
                  >
                    {p.firstName} {p.lastName}
                  </Link>
                </td>
                <td className="py-2 pr-4 text-zinc-400">{p.position}</td>
                <td className="py-2 pr-4 text-zinc-400">
                  {p.classYear ?? "--"}
                </td>
                <td className={`py-2 pr-4 text-right font-mono ${ratingClass(p.pitchingPlus)}`}>
                  {p.pitchingPlus != null ? Math.round(p.pitchingPlus) : "--"}
                </td>
                <td className={`py-2 text-right font-mono ${ratingClass(p.hittingPlus)}`}>
                  {p.hittingPlus != null ? Math.round(p.hittingPlus) : "--"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
