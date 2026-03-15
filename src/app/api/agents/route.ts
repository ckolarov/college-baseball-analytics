import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { runFullPipeline, runAgent, agents } from "@/agents";

export async function POST(request: NextRequest) {
  let body: { agentName?: string; season?: number } = {};
  try {
    body = await request.json();
  } catch {
    // Empty body = run full pipeline
  }

  const { agentName, season } = body;
  const params: Record<string, unknown> = {};
  if (season) params.season = season;

  if (agentName) {
    if (!agents[agentName]) {
      return NextResponse.json(
        {
          error: `Unknown agent: "${agentName}"`,
          available: Object.keys(agents),
        },
        { status: 400 },
      );
    }

    // Run single agent (non-blocking — kick off and return)
    const resultPromise = runAgent(agentName, params);

    // Don't await — return immediately with accepted status
    resultPromise.catch((error) => {
      console.error(`Agent ${agentName} failed:`, error);
    });

    return NextResponse.json(
      { message: `Agent "${agentName}" started`, agentName },
      { status: 202 },
    );
  }

  // Run full pipeline (non-blocking)
  const pipelinePromise = runFullPipeline(params);
  pipelinePromise.catch((error) => {
    console.error("Pipeline failed:", error);
  });

  return NextResponse.json(
    { message: "Full agent pipeline started" },
    { status: 202 },
  );
}

export async function GET(request: NextRequest) {
  // Vercel cron trigger — check for Authorization header
  const authHeader = request.headers.get("authorization");
  if (authHeader === `Bearer ${process.env.CRON_SECRET}`) {
    const pipelinePromise = runFullPipeline();
    pipelinePromise.catch((error) => {
      console.error("Cron pipeline failed:", error);
    });
    return NextResponse.json({ message: "Cron-triggered pipeline started" }, { status: 202 });
  }

  // Return latest run status for each agent
  const agentNames = Object.keys(agents);

  const statuses = await Promise.all(
    agentNames.map(async (name) => {
      const latestRun = await prisma.agentRun.findFirst({
        where: { agentName: name },
        orderBy: { startedAt: "desc" },
      });

      return {
        agentName: name,
        description: agents[name].description,
        latestRun: latestRun
          ? {
              id: latestRun.id,
              status: latestRun.status,
              startedAt: latestRun.startedAt,
              completedAt: latestRun.completedAt,
              itemsProcessed: latestRun.itemsProcessed,
              errors: latestRun.errors,
            }
          : null,
      };
    }),
  );

  return NextResponse.json({ agents: statuses });
}
