"use client";

import { useRatingLeaders } from "@/hooks/useRatings";
import { PlayerCard } from "@/components/dashboard/PlayerCard";

export default function Home() {
  const { data: pitchingLeaders, isLoading: loadingPitching } =
    useRatingLeaders("pitching", 5);
  const { data: hittingLeaders, isLoading: loadingHitting } =
    useRatingLeaders("hitting", 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-400">
          College baseball analytics powered by Pitching+ and Hitting+ rating
          systems. 100 = D1 Average.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pitching+ Leaders */}
        <div>
          <h2 className="mb-3 text-lg font-semibold">
            Top Pitching+
          </h2>
          <div className="space-y-2">
            {loadingPitching ? (
              <LoadingSkeleton count={5} />
            ) : pitchingLeaders?.data?.length > 0 ? (
              pitchingLeaders.data.map(
                (p: Record<string, unknown>) => (
                  <PlayerCard
                    key={p.id as string}
                    id={p.id as string}
                    firstName={p.firstName as string}
                    lastName={p.lastName as string}
                    position={p.position as string}
                    playerType={p.playerType as string}
                    teamName={(p.team as Record<string, string>)?.name}
                    classYear={p.classYear as string | null}
                    pitchingPlus={p.pitchingPlus as number | null}
                    hittingPlus={p.hittingPlus as number | null}
                  />
                ),
              )
            ) : (
              <EmptyState message="No pitching data yet. Run the agent pipeline to collect data." />
            )}
          </div>
        </div>

        {/* Hitting+ Leaders */}
        <div>
          <h2 className="mb-3 text-lg font-semibold">
            Top Hitting+
          </h2>
          <div className="space-y-2">
            {loadingHitting ? (
              <LoadingSkeleton count={5} />
            ) : hittingLeaders?.data?.length > 0 ? (
              hittingLeaders.data.map(
                (p: Record<string, unknown>) => (
                  <PlayerCard
                    key={p.id as string}
                    id={p.id as string}
                    firstName={p.firstName as string}
                    lastName={p.lastName as string}
                    position={p.position as string}
                    playerType={p.playerType as string}
                    teamName={(p.team as Record<string, string>)?.name}
                    classYear={p.classYear as string | null}
                    pitchingPlus={p.pitchingPlus as number | null}
                    hittingPlus={p.hittingPlus as number | null}
                  />
                ),
              )
            ) : (
              <EmptyState message="No hitting data yet. Run the agent pipeline to collect data." />
            )}
          </div>
        </div>
      </div>

      {/* Rating Scale Legend */}
      <div className="rounded-lg border border-white/10 bg-white/5 p-4">
        <h3 className="mb-2 text-sm font-medium text-zinc-400">
          Rating Scale
        </h3>
        <div className="flex flex-wrap gap-4 text-xs">
          <span className="text-yellow-400">120+ Elite</span>
          <span className="text-green-400">105-120 Above Avg</span>
          <span className="text-white">95-105 Average</span>
          <span className="text-orange-400">80-95 Below Avg</span>
          <span className="text-red-400">&lt;80 Poor</span>
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-16 animate-pulse rounded-lg border border-white/10 bg-white/5"
        />
      ))}
    </>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-white/10 p-8 text-center text-sm text-zinc-500">
      {message}
    </div>
  );
}
