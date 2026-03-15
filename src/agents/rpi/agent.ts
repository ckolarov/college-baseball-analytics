import { BaseAgent } from "../base-agent";
import { prisma } from "@/lib/db";
import type { AgentRunResult } from "@/models/types";
import { scrapeWarrenNolanRpi, scrapeBoydsworldRpi } from "./rpi-scraper";

export class RpiAgent extends BaseAgent {
  name = "rpi";
  description = "Retrieves current RPI rankings and team strength metrics";

  async run(
    params?: Record<string, unknown>,
  ): Promise<AgentRunResult> {
    const errors: string[] = [];
    let itemsProcessed = 0;
    const season =
      (params?.season as number) || new Date().getFullYear();

    this.log(`Fetching RPI rankings for ${season} season`);

    // Try primary source first
    let rpiEntries = await this.trySource(
      "Warren Nolan",
      scrapeWarrenNolanRpi,
      errors,
    );

    // Fallback to boydsworld if primary fails
    if (rpiEntries.length === 0) {
      rpiEntries = await this.trySource(
        "Boydsworld",
        scrapeBoydsworldRpi,
        errors,
      );
    }

    if (rpiEntries.length === 0) {
      return {
        success: false,
        itemsProcessed: 0,
        errors: [
          "Failed to fetch RPI data from any source",
          ...errors,
        ],
      };
    }

    this.log(`Got ${rpiEntries.length} RPI entries, storing...`);

    // Store RPI rankings
    for (const entry of rpiEntries) {
      try {
        await prisma.rpiRanking.create({
          data: {
            teamName: entry.teamName,
            rank: entry.rank,
            rating: entry.rating,
            record: entry.record || null,
            conferenceRecord: entry.conferenceRecord || null,
            season,
          },
        });

        // Try to match to an internal team record and update RPI
        const team = await prisma.team.findFirst({
          where: {
            OR: [
              { name: { contains: entry.teamName, mode: "insensitive" } },
              {
                abbreviation: {
                  equals: entry.teamName,
                  mode: "insensitive",
                },
              },
            ],
          },
        });

        if (team) {
          await prisma.team.update({
            where: { id: team.id },
            data: {
              rpiRank: entry.rank,
              rpiRating: entry.rating,
            },
          });
        }

        itemsProcessed++;
      } catch (error) {
        const msg = `Failed to store RPI entry for ${entry.teamName}: ${error instanceof Error ? error.message : error}`;
        this.logError(msg);
        errors.push(msg);
      }
    }

    return {
      success: true,
      itemsProcessed,
      errors,
      metadata: { season, totalTeams: rpiEntries.length },
    };
  }

  private async trySource(
    sourceName: string,
    scraper: () => Promise<
      { rank: number; teamName: string; rating: number; record: string; conferenceRecord: string }[]
    >,
    errors: string[],
  ) {
    try {
      this.log(`Trying ${sourceName}...`);
      const entries = await scraper();
      if (entries.length > 0) {
        this.log(`Got ${entries.length} entries from ${sourceName}`);
      }
      return entries;
    } catch (error) {
      const msg = `${sourceName} scrape failed: ${error instanceof Error ? error.message : error}`;
      this.logError(msg);
      errors.push(msg);
      await this.delay();
      return [];
    }
  }
}
