"use client";

import { useQuery } from "@tanstack/react-query";
import type { PlayerProfile } from "@/models/types";

export function usePlayer(playerId: string) {
  return useQuery<PlayerProfile>({
    queryKey: ["player", playerId],
    queryFn: async () => {
      const res = await fetch(`/api/players/${playerId}`);
      if (!res.ok) throw new Error("Failed to fetch player");
      return res.json();
    },
    enabled: !!playerId,
  });
}

export function usePlayers(params?: {
  teamId?: string;
  playerType?: string;
  search?: string;
  sortBy?: string;
  limit?: number;
  offset?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params?.teamId) searchParams.set("teamId", params.teamId);
  if (params?.playerType) searchParams.set("playerType", params.playerType);
  if (params?.search) searchParams.set("search", params.search);
  if (params?.sortBy) searchParams.set("sortBy", params.sortBy);
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.offset) searchParams.set("offset", String(params.offset));

  return useQuery({
    queryKey: ["players", params],
    queryFn: async () => {
      const res = await fetch(`/api/players?${searchParams}`);
      if (!res.ok) throw new Error("Failed to fetch players");
      return res.json();
    },
  });
}
