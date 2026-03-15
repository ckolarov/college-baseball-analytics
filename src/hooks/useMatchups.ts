"use client";

import { useQuery } from "@tanstack/react-query";

export function useMatchups(gameId: string) {
  return useQuery({
    queryKey: ["matchups", gameId],
    queryFn: async () => {
      const res = await fetch(`/api/matchups/${gameId}`);
      if (!res.ok) throw new Error("Failed to fetch matchups");
      return res.json();
    },
    enabled: !!gameId,
  });
}

export function useProjections(teamId: string) {
  return useQuery({
    queryKey: ["projections", teamId],
    queryFn: async () => {
      const res = await fetch(`/api/projections?teamId=${teamId}`);
      if (!res.ok) throw new Error("Failed to fetch projections");
      return res.json();
    },
    enabled: !!teamId,
  });
}
