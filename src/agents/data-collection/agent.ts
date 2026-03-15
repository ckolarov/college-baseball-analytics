import { BaseAgent } from "../base-agent";
import { prisma } from "@/lib/db";
import { PlayerType } from "@/generated/prisma/enums";
import type { AgentRunResult } from "@/models/types";
import {
  scrapeNcaaRoster,
  scrapeNcaaPitchingStats,
  scrapeNcaaHittingStats,
} from "./scrapers/ncaa-stats";
import { scrapeTeamRoster } from "./scrapers/team-roster";
import { scrapeSchedule } from "./scrapers/game-logs";
import { parsePitcherStats } from "./parsers/pitcher-stats";
import { parseHitterStats } from "./parsers/hitter-stats";

export class DataCollectionAgent extends BaseAgent {
  name = "data-collection";
  description =
    "Scrapes publicly available college baseball stats from NCAA and team websites";

  async run(
    params?: Record<string, unknown>,
  ): Promise<AgentRunResult> {
    const errors: string[] = [];
    let itemsProcessed = 0;
    const season =
      (params?.season as number) || new Date().getFullYear();

    // Get the target school
    const targetSchool = process.env.TARGET_SCHOOL_NAME;
    if (!targetSchool) {
      return {
        success: false,
        itemsProcessed: 0,
        errors: ["TARGET_SCHOOL_NAME environment variable not set"],
      };
    }

    this.log(`Collecting data for ${targetSchool}, season ${season}`);

    // Step 1: Find or create the target team
    let team = await prisma.team.findFirst({
      where: { name: { contains: targetSchool, mode: "insensitive" } },
    });

    if (!team) {
      team = await prisma.team.create({
        data: { name: targetSchool, division: "D1" },
      });
      this.log(`Created team record for ${targetSchool}`);
    }

    // Step 2: Scrape roster if URL is available
    if (team.rosterUrl) {
      try {
        this.log(`Scraping roster from ${team.rosterUrl}`);
        const rosterEntries = team.rosterUrl.includes("stats.ncaa.org")
          ? await scrapeNcaaRoster(team.rosterUrl)
          : await scrapeTeamRoster(team.rosterUrl);

        for (const entry of rosterEntries) {
          const isPitcher =
            entry.position.toUpperCase().includes("P") &&
            !entry.position.toUpperCase().includes("OF");

          await prisma.player.upsert({
            where: {
              id: await findPlayerId(
                entry.firstName,
                entry.lastName,
                team.id,
              ),
            },
            create: {
              firstName: entry.firstName,
              lastName: entry.lastName,
              teamId: team.id,
              position: entry.position,
              playerType: isPitcher ? PlayerType.PITCHER : PlayerType.HITTER,
              classYear: entry.classYear || null,
              bats: entry.bats || null,
              throws: entry.throws || null,
              height: entry.height || null,
              weight: entry.weight ? parseInt(entry.weight) || null : null,
              hometown: entry.hometown || null,
            },
            update: {
              position: entry.position,
              classYear: entry.classYear || undefined,
              bats: entry.bats || undefined,
              throws: entry.throws || undefined,
            },
          });
          itemsProcessed++;
        }

        this.log(`Processed ${rosterEntries.length} roster entries`);
        await this.delay();
      } catch (error) {
        const msg = `Failed to scrape roster: ${error instanceof Error ? error.message : error}`;
        this.logError(msg);
        errors.push(msg);
      }
    }

    // Step 3: Scrape pitching stats if URL available
    if (team.scheduleUrl) {
      // Use schedule URL base to construct stats URLs
      try {
        const statsBaseUrl = team.scheduleUrl.replace(/schedule.*$/i, "");
        const pitchingUrl = `${statsBaseUrl}stats/pitching`;

        this.log(`Scraping pitching stats from ${pitchingUrl}`);
        const rawPitchers = await scrapeNcaaPitchingStats(pitchingUrl);

        for (const raw of rawPitchers) {
          const parsed = parsePitcherStats(raw);
          const player = await findOrCreatePlayer(
            parsed.firstName,
            parsed.lastName,
            team.id,
            PlayerType.PITCHER,
            "P",
            parsed.classYear,
          );

          await prisma.seasonStats.upsert({
            where: {
              playerId_season: { playerId: player.id, season },
            },
            create: {
              playerId: player.id,
              season,
              gamesPlayed: parsed.gamesPlayed,
              gamesStarted: parsed.gamesStarted,
              wins: parsed.wins,
              losses: parsed.losses,
              era: parsed.era,
              inningsPitched: parsed.inningsPitched,
              strikeouts: parsed.strikeouts,
              walks: parsed.walks,
              hitsAllowed: parsed.hitsAllowed,
              earnedRuns: parsed.earnedRuns,
              whip: parsed.whip,
              kPerNine: parsed.kPerNine,
              bbPerNine: parsed.bbPerNine,
              kPercent: parsed.kPercent,
              bbPercent: parsed.bbPercent,
              strikePercent: parsed.strikePercent,
              oppBattingAvg: parsed.oppBattingAvg,
            },
            update: {
              gamesPlayed: parsed.gamesPlayed,
              gamesStarted: parsed.gamesStarted,
              wins: parsed.wins,
              losses: parsed.losses,
              era: parsed.era,
              inningsPitched: parsed.inningsPitched,
              strikeouts: parsed.strikeouts,
              walks: parsed.walks,
              hitsAllowed: parsed.hitsAllowed,
              earnedRuns: parsed.earnedRuns,
              whip: parsed.whip,
              kPerNine: parsed.kPerNine,
              bbPerNine: parsed.bbPerNine,
              kPercent: parsed.kPercent,
              bbPercent: parsed.bbPercent,
              strikePercent: parsed.strikePercent,
              oppBattingAvg: parsed.oppBattingAvg,
            },
          });
          itemsProcessed++;
        }

        this.log(`Processed ${rawPitchers.length} pitcher stat lines`);
        await this.delay();
      } catch (error) {
        const msg = `Failed to scrape pitching stats: ${error instanceof Error ? error.message : error}`;
        this.logError(msg);
        errors.push(msg);
      }

      // Step 4: Scrape hitting stats
      try {
        const statsBaseUrl = team.scheduleUrl.replace(/schedule.*$/i, "");
        const hittingUrl = `${statsBaseUrl}stats/batting`;

        this.log(`Scraping hitting stats from ${hittingUrl}`);
        const rawHitters = await scrapeNcaaHittingStats(hittingUrl);

        for (const raw of rawHitters) {
          const parsed = parseHitterStats(raw);
          const player = await findOrCreatePlayer(
            parsed.firstName,
            parsed.lastName,
            team.id,
            PlayerType.HITTER,
            parsed.position,
            parsed.classYear,
          );

          await prisma.seasonStats.upsert({
            where: {
              playerId_season: { playerId: player.id, season },
            },
            create: {
              playerId: player.id,
              season,
              gamesPlayed: parsed.gamesPlayed,
              gamesStarted: parsed.gamesStarted,
              atBats: parsed.atBats,
              hits: parsed.hits,
              doubles: parsed.doubles,
              triples: parsed.triples,
              homeRuns: parsed.homeRuns,
              rbi: parsed.rbi,
              runs: parsed.runs,
              stolenBases: parsed.stolenBases,
              battingAvg: parsed.battingAvg,
              obp: parsed.obp,
              slg: parsed.slg,
              ops: parsed.ops,
              kRateHitting: parsed.kRateHitting,
              bbRateHitting: parsed.bbRateHitting,
              babip: parsed.babip,
              isoSlg: parsed.isoSlg,
            },
            update: {
              gamesPlayed: parsed.gamesPlayed,
              gamesStarted: parsed.gamesStarted,
              atBats: parsed.atBats,
              hits: parsed.hits,
              doubles: parsed.doubles,
              triples: parsed.triples,
              homeRuns: parsed.homeRuns,
              rbi: parsed.rbi,
              runs: parsed.runs,
              stolenBases: parsed.stolenBases,
              battingAvg: parsed.battingAvg,
              obp: parsed.obp,
              slg: parsed.slg,
              ops: parsed.ops,
              kRateHitting: parsed.kRateHitting,
              bbRateHitting: parsed.bbRateHitting,
              babip: parsed.babip,
              isoSlg: parsed.isoSlg,
            },
          });
          itemsProcessed++;
        }

        this.log(`Processed ${rawHitters.length} hitter stat lines`);
        await this.delay();
      } catch (error) {
        const msg = `Failed to scrape hitting stats: ${error instanceof Error ? error.message : error}`;
        this.logError(msg);
        errors.push(msg);
      }
    }

    // Step 5: Scrape schedule
    if (team.scheduleUrl) {
      try {
        this.log(`Scraping schedule from ${team.scheduleUrl}`);
        const scheduleEntries = await scrapeSchedule(team.scheduleUrl);

        for (const entry of scheduleEntries) {
          const date = parseScheduleDate(entry.date, season);
          if (!date) continue;

          await prisma.scheduleEntry.upsert({
            where: {
              id: await findScheduleEntryId(team.id, date, entry.opponent),
            },
            create: {
              teamId: team.id,
              date,
              opponentName: entry.opponent,
              isHome: entry.isHome,
              result: entry.result || null,
            },
            update: {
              result: entry.result || undefined,
            },
          });
          itemsProcessed++;
        }

        this.log(`Processed ${scheduleEntries.length} schedule entries`);
      } catch (error) {
        const msg = `Failed to scrape schedule: ${error instanceof Error ? error.message : error}`;
        this.logError(msg);
        errors.push(msg);
      }
    }

    return {
      success: errors.length === 0,
      itemsProcessed,
      errors,
      metadata: { season, team: targetSchool },
    };
  }
}

// Helper to find or create a player
async function findOrCreatePlayer(
  firstName: string,
  lastName: string,
  teamId: string,
  playerType: PlayerType,
  position: string,
  classYear: string,
) {
  const existing = await prisma.player.findFirst({
    where: {
      firstName: { equals: firstName, mode: "insensitive" },
      lastName: { equals: lastName, mode: "insensitive" },
      teamId,
    },
  });

  if (existing) return existing;

  return prisma.player.create({
    data: {
      firstName,
      lastName,
      teamId,
      playerType,
      position,
      classYear: classYear || null,
    },
  });
}

// Helper to find a player ID for upsert
async function findPlayerId(
  firstName: string,
  lastName: string,
  teamId: string,
): Promise<string> {
  const player = await prisma.player.findFirst({
    where: {
      firstName: { equals: firstName, mode: "insensitive" },
      lastName: { equals: lastName, mode: "insensitive" },
      teamId,
    },
  });
  return player?.id ?? "new-player-" + Date.now();
}

// Helper to find a schedule entry ID for upsert
async function findScheduleEntryId(
  teamId: string,
  date: Date,
  opponent: string,
): Promise<string> {
  const entry = await prisma.scheduleEntry.findFirst({
    where: {
      teamId,
      date,
      opponentName: { equals: opponent, mode: "insensitive" },
    },
  });
  return entry?.id ?? "new-entry-" + Date.now();
}

// Parse schedule dates like "Feb 14" or "2/14" into full Date objects
function parseScheduleDate(
  dateStr: string,
  season: number,
): Date | null {
  if (!dateStr) return null;

  // Try ISO format first
  const isoDate = new Date(dateStr);
  if (!isNaN(isoDate.getTime())) return isoDate;

  // Try "Mon DD" format (e.g., "Feb 14")
  const monthDay = dateStr.match(
    /(\w{3,})\s+(\d{1,2})/,
  );
  if (monthDay) {
    const months: Record<string, number> = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
    };
    const monthNum = months[monthDay[1].toLowerCase().slice(0, 3)];
    if (monthNum !== undefined) {
      return new Date(season, monthNum, parseInt(monthDay[2]));
    }
  }

  // Try "M/D" format
  const slashDate = dateStr.match(/(\d{1,2})\/(\d{1,2})/);
  if (slashDate) {
    return new Date(
      season,
      parseInt(slashDate[1]) - 1,
      parseInt(slashDate[2]),
    );
  }

  return null;
}
