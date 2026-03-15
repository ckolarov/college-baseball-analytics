"use client";

import { useQuery } from "@tanstack/react-query";

export function useSchedule(teamId: string) {
  return useQuery({
    queryKey: ["schedule", teamId],
    queryFn: async () => {
      const res = await fetch(`/api/schedule?teamId=${teamId}`);
      if (!res.ok) throw new Error("Failed to fetch schedule");
      return res.json();
    },
    enabled: !!teamId,
  });
}
