import { prisma } from "@/lib/db";
import type { AgentRunResult } from "@/models/types";
import { AgentStatus } from "@/generated/prisma/enums";

export abstract class BaseAgent {
  abstract name: string;
  abstract description: string;

  abstract run(params?: Record<string, unknown>): Promise<AgentRunResult>;

  protected async logRunStart(): Promise<string> {
    const run = await prisma.agentRun.create({
      data: {
        agentName: this.name,
        status: AgentStatus.RUNNING,
        startedAt: new Date(),
      },
    });
    return run.id;
  }

  protected async logRunComplete(
    runId: string,
    result: AgentRunResult,
  ): Promise<void> {
    await prisma.agentRun.update({
      where: { id: runId },
      data: {
        status: result.success ? AgentStatus.COMPLETED : AgentStatus.FAILED,
        completedAt: new Date(),
        itemsProcessed: result.itemsProcessed,
        errors: result.errors,
        metadata: (result.metadata ?? undefined) as never,
      },
    });
  }

  protected async delay(ms?: number): Promise<void> {
    const delayMs =
      ms ?? (Number(process.env.AGENT_SCRAPE_DELAY_MS) || 2000);
    return new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  protected log(message: string): void {
    console.log(`[${this.name}] ${message}`);
  }

  protected logError(message: string, error?: unknown): void {
    console.error(
      `[${this.name}] ERROR: ${message}`,
      error instanceof Error ? error.message : error,
    );
  }

  async execute(params?: Record<string, unknown>): Promise<AgentRunResult> {
    const runId = await this.logRunStart();
    this.log(`Starting run ${runId}...`);

    try {
      const result = await this.run(params);
      await this.logRunComplete(runId, result);
      this.log(
        `Completed: ${result.itemsProcessed} items processed, ${result.errors.length} errors`,
      );
      return result;
    } catch (error) {
      const result: AgentRunResult = {
        success: false,
        itemsProcessed: 0,
        errors: [error instanceof Error ? error.message : String(error)],
      };
      await this.logRunComplete(runId, result);
      this.logError("Run failed", error);
      return result;
    }
  }
}
