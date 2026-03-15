import { BaseAgent } from "./base-agent";
import { DataCollectionAgent } from "./data-collection/agent";
import { PlayerSummaryAgent } from "./player-summary/agent";
import { RpiAgent } from "./rpi/agent";
import { RatingEngineAgent } from "./rating-engine/agent";
import { ScheduleProjectionAgent } from "./schedule-projection/agent";
import { MatchupModelingAgent } from "./matchup-modeling/agent";
import type { AgentRunResult } from "@/models/types";

/**
 * Agent registry — maps agent names to their instances.
 */
export const agents: Record<string, BaseAgent> = {
  "data-collection": new DataCollectionAgent(),
  "player-summary": new PlayerSummaryAgent(),
  rpi: new RpiAgent(),
  "rating-engine": new RatingEngineAgent(),
  "schedule-projection": new ScheduleProjectionAgent(),
  "matchup-modeling": new MatchupModelingAgent(),
};

/**
 * Execution order for the full pipeline.
 * Each agent depends on the output of the previous ones.
 */
const PIPELINE_ORDER = [
  "data-collection",
  "player-summary",
  "rpi",
  "rating-engine",
  "schedule-projection",
  "matchup-modeling",
];

/**
 * Run the full agent pipeline in order.
 */
export async function runFullPipeline(
  params?: Record<string, unknown>,
): Promise<Record<string, AgentRunResult>> {
  const results: Record<string, AgentRunResult> = {};

  console.log("=== Starting Full Agent Pipeline ===");
  console.log(`Time: ${new Date().toISOString()}`);

  for (const agentName of PIPELINE_ORDER) {
    const agent = agents[agentName];
    if (!agent) {
      console.error(`Agent "${agentName}" not found in registry`);
      continue;
    }

    console.log(`\n--- Running ${agentName} ---`);
    const startTime = Date.now();

    const result = await agent.execute(params);
    results[agentName] = result;

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(
      `--- ${agentName} completed in ${duration}s: ${result.success ? "SUCCESS" : "FAILED"} ---`,
    );

    // If a critical agent fails, stop the pipeline
    if (
      !result.success &&
      ["data-collection", "rating-engine"].includes(agentName)
    ) {
      console.error(
        `Critical agent "${agentName}" failed, stopping pipeline`,
      );
      break;
    }
  }

  console.log("\n=== Pipeline Complete ===");
  return results;
}

/**
 * Run a single agent by name.
 */
export async function runAgent(
  agentName: string,
  params?: Record<string, unknown>,
): Promise<AgentRunResult> {
  const agent = agents[agentName];
  if (!agent) {
    return {
      success: false,
      itemsProcessed: 0,
      errors: [`Agent "${agentName}" not found`],
    };
  }

  return agent.execute(params);
}
