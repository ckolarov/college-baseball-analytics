"use client";

import { useQuery } from "@tanstack/react-query";

export function useRatingLeaders(type: "pitching" | "hitting", limit = 25, season?: number) {
  return useQuery({
    queryKey: ["ratings", type, limit, season],
    queryFn: async () => {
      const params = new URLSearchParams({ type, limit: String(limit) });
      if (season) params.set("season", String(season));
      const res = await fetch(`/api/ratings?${params}`);
      if (!res.ok) throw new Error("Failed to fetch ratings");
      return res.json();
    },
  });
}
