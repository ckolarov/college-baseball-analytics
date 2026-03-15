"use client";

import { useQuery } from "@tanstack/react-query";

export function useTeamComparison(team1Id: string, team2Id: string) {
  return useQuery({
    queryKey: ["compare-teams", team1Id, team2Id],
    queryFn: async () => {
      const res = await fetch(
        `/api/compare/teams?team1Id=${team1Id}&team2Id=${team2Id}`,
      );
      if (!res.ok) throw new Error("Failed to fetch team comparison");
      return res.json();
    },
    enabled: !!team1Id && !!team2Id,
  });
}

export function usePlayerComparison(player1Id: string, player2Id: string) {
  return useQuery({
    queryKey: ["compare-players", player1Id, player2Id],
    queryFn: async () => {
      const res = await fetch(
        `/api/compare/players?player1Id=${player1Id}&player2Id=${player2Id}`,
      );
      if (!res.ok) throw new Error("Failed to fetch player comparison");
      return res.json();
    },
    enabled: !!player1Id && !!player2Id,
  });
}
