"use client";

import { useQuery } from "@tanstack/react-query";

export function useRatingLeaders(type: "pitching" | "hitting", limit = 25) {
  return useQuery({
    queryKey: ["ratings", type, limit],
    queryFn: async () => {
      const res = await fetch(`/api/ratings?type=${type}&limit=${limit}`);
      if (!res.ok) throw new Error("Failed to fetch ratings");
      return res.json();
    },
  });
}
