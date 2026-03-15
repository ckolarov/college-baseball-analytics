import axios from "axios";
import * as cheerio from "cheerio";
import type { Element } from "domhandler";

export interface RawGameLog {
  date: string;
  opponent: string;
  isHome: boolean;
  result: string; // "W 5-3", "L 2-4", etc.
  score?: { us: number; them: number };
}

export interface RawScheduleEntry {
  date: string;
  opponent: string;
  isHome: boolean;
  result?: string;
  time?: string;
  location?: string;
}

const USER_AGENT =
  "Mozilla/5.0 (compatible; CollegeBaseballAnalytics/1.0; research)";

/**
 * Scrape game schedule/results from a team's schedule page.
 */
export async function scrapeSchedule(
  scheduleUrl: string,
): Promise<RawScheduleEntry[]> {
  const response = await axios.get(scheduleUrl, {
    headers: { "User-Agent": USER_AGENT },
    timeout: 15000,
  });
  const $ = cheerio.load(response.data);
  const entries: RawScheduleEntry[] = [];

  // Strategy 1: SIDEARM schedule format
  $(".sidearm-schedule-game, [class*='schedule'] li, .schedule-list li").each(
    (_i, el) => {
      const entry = parseSidearmScheduleEntry($, el);
      if (entry) entries.push(entry);
    },
  );

  if (entries.length > 0) return entries;

  // Strategy 2: Table-based schedule
  $("table tbody tr").each((_i, row) => {
    const entry = parseScheduleRow($, row);
    if (entry) entries.push(entry);
  });

  return entries;
}

/**
 * Scrape game logs (per-game results) for a team.
 */
export async function scrapeGameLogs(
  gameLogUrl: string,
): Promise<RawGameLog[]> {
  const response = await axios.get(gameLogUrl, {
    headers: { "User-Agent": USER_AGENT },
    timeout: 15000,
  });
  const $ = cheerio.load(response.data);
  const logs: RawGameLog[] = [];

  $("table tbody tr").each((_i, row) => {
    const cells = $(row).find("td");
    if (cells.length < 3) return;

    const dateText = $(cells[0]).text().trim();
    const opponentText = $(cells[1]).text().trim();
    const resultText = $(cells[2]).text().trim();

    if (!dateText || !opponentText) return;

    const isHome = !opponentText.startsWith("@") && !opponentText.startsWith("at ");
    const opponent = opponentText
      .replace(/^(@|at |vs\.?\s*)/i, "")
      .replace(/\s*\*+$/, "") // Remove conference game markers
      .trim();

    const score = parseScore(resultText);

    logs.push({
      date: dateText,
      opponent,
      isHome,
      result: resultText,
      score: score ?? undefined,
    });
  });

  return logs;
}

function parseSidearmScheduleEntry(
  $: cheerio.CheerioAPI,
  el: Element,
): RawScheduleEntry | null {
  const dateEl = $(el).find(
    ".sidearm-schedule-game-opponent-date, [class*='date'], time",
  );
  const opponentEl = $(el).find(
    ".sidearm-schedule-game-opponent-name, [class*='opponent'], [class*='team-name']",
  );
  const resultEl = $(el).find(
    ".sidearm-schedule-game-result, [class*='result'], [class*='score']",
  );

  const date = dateEl.text().trim();
  const opponent = opponentEl.text().trim();

  if (!date || !opponent) return null;

  const locationText = $(el).find("[class*='location']").text().trim().toLowerCase();
  const isHome =
    locationText.includes("home") ||
    (!locationText.includes("away") && !opponent.startsWith("@"));

  return {
    date,
    opponent: opponent.replace(/^(@|at |vs\.?\s*)/i, "").trim(),
    isHome,
    result: resultEl.text().trim() || undefined,
  };
}

function parseScheduleRow(
  $: cheerio.CheerioAPI,
  row: Element,
): RawScheduleEntry | null {
  const cells = $(row).find("td");
  if (cells.length < 2) return null;

  const date = $(cells[0]).text().trim();
  const opponentRaw = $(cells[1]).text().trim();

  if (!date || !opponentRaw) return null;

  const isHome = !opponentRaw.startsWith("@") && !opponentRaw.startsWith("at ");
  const opponent = opponentRaw
    .replace(/^(@|at |vs\.?\s*)/i, "")
    .replace(/\s*\*+$/, "")
    .trim();

  const result =
    cells.length > 2 ? $(cells[2]).text().trim() || undefined : undefined;

  return { date, opponent, isHome, result };
}

function parseScore(
  text: string,
): { us: number; them: number } | null {
  // Match patterns like "W 5-3", "L 2-4", "W, 5-3", "5-3 W"
  const match = text.match(/(\d+)\s*[-–]\s*(\d+)/);
  if (!match) return null;

  const a = parseInt(match[1], 10);
  const b = parseInt(match[2], 10);

  // If starts with W, first score is ours; if L, second is ours
  if (/^W/i.test(text)) return { us: Math.max(a, b), them: Math.min(a, b) };
  if (/^L/i.test(text)) return { us: Math.min(a, b), them: Math.max(a, b) };

  return { us: a, them: b };
}
