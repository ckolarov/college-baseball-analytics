/**
 * CLI script to manually trigger agent runs.
 *
 * Usage:
 *   npx tsx scripts/run-agents.ts              # Run full pipeline
 *   npx tsx scripts/run-agents.ts rpi          # Run single agent
 *   npx tsx scripts/run-agents.ts rating-engine --season 2025
 */

import { runFullPipeline, runAgent, agents } from "../src/agents";

async function main() {
  const args = process.argv.slice(2);
  const agentName = args[0];
  const params: Record<string, unknown> = {};

  // Parse --season flag
  const seasonIdx = args.indexOf("--season");
  if (seasonIdx !== -1 && args[seasonIdx + 1]) {
    params.season = parseInt(args[seasonIdx + 1]);
  }

  if (!agentName || agentName === "all") {
    // Run full pipeline
    console.log("Running full agent pipeline...");
    const results = await runFullPipeline(params);

    console.log("\n=== Summary ===");
    for (const [name, result] of Object.entries(results)) {
      const status = result.success ? "OK" : "FAILED";
      console.log(
        `  ${name}: ${status} (${result.itemsProcessed} items, ${result.errors.length} errors)`,
      );
    }
  } else {
    // Run single agent
    if (!agents[agentName]) {
      console.error(`Unknown agent: "${agentName}"`);
      console.error(`Available agents: ${Object.keys(agents).join(", ")}`);
      process.exit(1);
    }

    console.log(`Running agent: ${agentName}`);
    const result = await runAgent(agentName, params);

    console.log("\n=== Result ===");
    console.log(`  Status: ${result.success ? "SUCCESS" : "FAILED"}`);
    console.log(`  Items processed: ${result.itemsProcessed}`);
    if (result.errors.length > 0) {
      console.log(`  Errors:`);
      result.errors.forEach((e) => console.log(`    - ${e}`));
    }
  }

  process.exit(0);
}

main().catch((error) => {
  console.error("Agent run failed:", error);
  process.exit(1);
});
