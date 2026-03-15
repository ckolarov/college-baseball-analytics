"use client";

import { useQuery } from "@tanstack/react-query";

export function useTeam(teamId: string) {
  return useQuery({
    queryKey: ["team", teamId],
    queryFn: async () => {
      const res = await fetch(`/api/teams/${teamId}`);
      if (!res.ok) throw new Error("Failed to fetch team");
      return res.json();
    },
    enabled: !!teamId,
  });
}

export function useTeams(params?: { conference?: string; search?: string; sortBy?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.conference) searchParams.set("conference", params.conference);
  if (params?.search) searchParams.set("search", params.search);
  if (params?.sortBy) searchParams.set("sortBy", params.sortBy);

  return useQuery({
    queryKey: ["teams", params],
    queryFn: async () => {
      const res = await fetch(`/api/teams?${searchParams}`);
      if (!res.ok) throw new Error("Failed to fetch teams");
      return res.json();
    },
  });
}
