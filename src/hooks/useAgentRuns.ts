"use client";

import { useQuery } from "@tanstack/react-query";

export function useAgentRuns() {
  return useQuery({
    queryKey: ["agentRuns"],
    queryFn: async () => {
      const res = await fetch("/api/agents");
      if (!res.ok) throw new Error("Failed to fetch agent runs");
      return res.json();
    },
    refetchInterval: 30000,
  });
}
