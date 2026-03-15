"use client";

import { useAgentRuns } from "@/hooks/useAgentRuns";
import { CheckCircle, AlertCircle, Clock, Activity } from "lucide-react";

function timeAgo(date: string | null): string {
  if (!date) return "Never";
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const agentLabels: Record<string, string> = {
  "data-collection": "Data Collection",
  "player-summary": "Player Summary",
  rpi: "RPI Rankings",
  "rating-engine": "Rating Engine",
  "schedule-projection": "Schedule Projection",
  "matchup-modeling": "Matchup Modeling",
};

export function ActivityFeed() {
  const { data, isLoading } = useAgentRuns();
  const agents = (data?.agents ?? []) as Record<string, unknown>[];

  return (
    <div className="glass-panel p-4">
      <div className="mb-3 flex items-center gap-2">
        <Activity className="h-4 w-4 text-cyan-400" />
        <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-400">
          Recent Activity
        </h2>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded bg-white/5" />
          ))}
        </div>
      ) : agents.length > 0 ? (
        <div className="space-y-1">
          {agents.map((agent) => {
            const run = agent.latestRun as Record<string, unknown> | null;
            const status = run?.status as string | null;
            const name = agent.agentName as string;

            return (
              <div
                key={name}
                className="flex items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-white/5"
              >
                {status === "COMPLETED" ? (
                  <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
                ) : status === "RUNNING" ? (
                  <Clock className="h-4 w-4 shrink-0 animate-pulse text-yellow-400" />
                ) : status === "FAILED" ? (
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                ) : (
                  <Clock className="h-4 w-4 shrink-0 text-zinc-600" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-medium text-zinc-300">
                    {agentLabels[name] ?? name}
                  </div>
                  <div className="text-[10px] text-zinc-500">
                    {run
                      ? `${run.itemsProcessed ?? 0} items · ${timeAgo(run.completedAt as string | null)}`
                      : "Not run yet"}
                  </div>
                </div>
                {status === "COMPLETED" && (
                  <span className="text-[10px] font-medium text-emerald-400">
                    OK
                  </span>
                )}
                {status === "FAILED" && (
                  <span className="text-[10px] font-medium text-red-400">
                    ERR
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-4 text-center text-xs text-zinc-500">
          No agent runs yet. Trigger the pipeline to get started.
        </div>
      )}
    </div>
  );
}
