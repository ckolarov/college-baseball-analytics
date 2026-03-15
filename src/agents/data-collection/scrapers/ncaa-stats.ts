import axios from "axios";
import * as cheerio from "cheerio";
import type { Element } from "domhandler";

export interface RawPlayerStats {
  firstName: string;
  lastName: string;
  position: string;
  classYear: string;
  jersey: string;
  // Pitching
  era?: string;
  wins?: string;
  losses?: string;
  inningsPitched?: string;
  strikeouts?: string;
  walks?: string;
  hitsAllowed?: string;
  earnedRuns?: string;
  gamesPlayed?: string;
  gamesStarted?: string;
  // Hitting
  atBats?: string;
  hits?: string;
  doubles?: string;
  triples?: string;
  homeRuns?: string;
  rbi?: string;
  runs?: string;
  stolenBases?: string;
  battingAvg?: string;
  obp?: string;
  slg?: string;
  ops?: string;
}

export interface RawRosterEntry {
  firstName: string;
  lastName: string;
  position: string;
  classYear: string;
  bats?: string;
  throws?: string;
  height?: string;
  weight?: string;
  hometown?: string;
}

const USER_AGENT =
  "Mozilla/5.0 (compatible; CollegeBaseballAnalytics/1.0; research)";

async function fetchPage(url: string): Promise<cheerio.CheerioAPI> {
  const response = await axios.get(url, {
    headers: { "User-Agent": USER_AGENT },
    timeout: 15000,
  });
  return cheerio.load(response.data);
}

/**
 * Scrape team roster from NCAA stats page.
 * URL format varies by school — this handles the common NCAA stats format.
 */
export async function scrapeNcaaRoster(
  teamUrl: string,
): Promise<RawRosterEntry[]> {
  const $ = await fetchPage(teamUrl);
  const roster: RawRosterEntry[] = [];

  // NCAA stats roster tables typically have player rows in tbody
  $("table tbody tr").each((_i, row) => {
    const cells = $(row).find("td");
    if (cells.length < 3) return;

    const nameParts = $(cells[1]).text().trim().split(",");
    if (nameParts.length < 2) {
      const spaceParts = $(cells[1]).text().trim().split(" ");
      if (spaceParts.length >= 2) {
        roster.push({
          firstName: spaceParts[0],
          lastName: spaceParts.slice(1).join(" "),
          position: $(cells[2]).text().trim(),
          classYear: $(cells[3]).text().trim() || "",
          height: cells.length > 4 ? $(cells[4]).text().trim() : undefined,
          weight: cells.length > 5
            ? $(cells[5]).text().trim()
            : undefined,
          hometown: cells.length > 6
            ? $(cells[6]).text().trim()
            : undefined,
        });
      }
    } else {
      roster.push({
        firstName: nameParts[1].trim(),
        lastName: nameParts[0].trim(),
        position: $(cells[2]).text().trim(),
        classYear: $(cells[3]).text().trim() || "",
      });
    }
  });

  return roster;
}

/**
 * Scrape pitching stats from an NCAA stats page.
 */
export async function scrapeNcaaPitchingStats(
  statsUrl: string,
): Promise<RawPlayerStats[]> {
  const $ = await fetchPage(statsUrl);
  const players: RawPlayerStats[] = [];

  // Look for pitching stats table
  const pitchingTable = $('table').filter((_i, el) => {
    const headers = $(el).find("th").text().toLowerCase();
    return headers.includes("era") || headers.includes("ip");
  }).first();

  if (!pitchingTable.length) return players;

  // Map header positions
  const headers: string[] = [];
  pitchingTable.find("thead th, thead td").each((_i, th) => {
    headers.push($(th).text().trim().toLowerCase());
  });

  pitchingTable.find("tbody tr").each((_i, row) => {
    const cells = $(row).find("td");
    if (cells.length < 3) return;

    const nameCell = cells[findHeaderIndex(headers, ["player", "name", "#"])];
    const name = nameCell ? $(nameCell).text().trim() : "";
    const nameParts = parseName(name);
    if (!nameParts) return;

    const player: RawPlayerStats = {
      firstName: nameParts.firstName,
      lastName: nameParts.lastName,
      position: "P",
      classYear: getCellByHeader($, cells, headers, ["yr", "cl", "class"]),
      jersey: getCellByHeader($, cells, headers, ["no", "#", "no."]),
      era: getCellByHeader($, cells, headers, ["era"]),
      wins: getCellByHeader($, cells, headers, ["w"]),
      losses: getCellByHeader($, cells, headers, ["l"]),
      inningsPitched: getCellByHeader($, cells, headers, ["ip"]),
      strikeouts: getCellByHeader($, cells, headers, ["so", "k"]),
      walks: getCellByHeader($, cells, headers, ["bb"]),
      hitsAllowed: getCellByHeader($, cells, headers, ["h"]),
      earnedRuns: getCellByHeader($, cells, headers, ["er"]),
      gamesPlayed: getCellByHeader($, cells, headers, ["app", "gp", "g"]),
      gamesStarted: getCellByHeader($, cells, headers, ["gs"]),
    };

    players.push(player);
  });

  return players;
}

/**
 * Scrape hitting stats from an NCAA stats page.
 */
export async function scrapeNcaaHittingStats(
  statsUrl: string,
): Promise<RawPlayerStats[]> {
  const $ = await fetchPage(statsUrl);
  const players: RawPlayerStats[] = [];

  // Look for hitting/batting stats table
  const hittingTable = $('table').filter((_i, el) => {
    const headers = $(el).find("th").text().toLowerCase();
    return (
      (headers.includes("avg") || headers.includes("ba")) &&
      !headers.includes("era")
    );
  }).first();

  if (!hittingTable.length) return players;

  const headers: string[] = [];
  hittingTable.find("thead th, thead td").each((_i, th) => {
    headers.push($(th).text().trim().toLowerCase());
  });

  hittingTable.find("tbody tr").each((_i, row) => {
    const cells = $(row).find("td");
    if (cells.length < 3) return;

    const nameCell = cells[findHeaderIndex(headers, ["player", "name", "#"])];
    const name = nameCell ? $(nameCell).text().trim() : "";
    const nameParts = parseName(name);
    if (!nameParts) return;

    const player: RawPlayerStats = {
      firstName: nameParts.firstName,
      lastName: nameParts.lastName,
      position: getCellByHeader($, cells, headers, ["pos"]) || "UT",
      classYear: getCellByHeader($, cells, headers, ["yr", "cl", "class"]),
      jersey: getCellByHeader($, cells, headers, ["no", "#", "no."]),
      gamesPlayed: getCellByHeader($, cells, headers, ["gp", "g"]),
      gamesStarted: getCellByHeader($, cells, headers, ["gs"]),
      atBats: getCellByHeader($, cells, headers, ["ab"]),
      hits: getCellByHeader($, cells, headers, ["h"]),
      doubles: getCellByHeader($, cells, headers, ["2b"]),
      triples: getCellByHeader($, cells, headers, ["3b"]),
      homeRuns: getCellByHeader($, cells, headers, ["hr"]),
      rbi: getCellByHeader($, cells, headers, ["rbi"]),
      runs: getCellByHeader($, cells, headers, ["r"]),
      stolenBases: getCellByHeader($, cells, headers, ["sb"]),
      battingAvg: getCellByHeader($, cells, headers, ["avg", "ba"]),
      obp: getCellByHeader($, cells, headers, ["obp", "ob%"]),
      slg: getCellByHeader($, cells, headers, ["slg", "slg%"]),
      ops: getCellByHeader($, cells, headers, ["ops"]),
    };

    players.push(player);
  });

  return players;
}

// Helper: find header index matching any of the given names
function findHeaderIndex(headers: string[], names: string[]): number {
  for (const name of names) {
    const idx = headers.findIndex((h) => h === name || h.includes(name));
    if (idx !== -1) return idx;
  }
  return 0;
}

// Helper: get cell text by header name
function getCellByHeader(
  $: cheerio.CheerioAPI,
  cells: cheerio.Cheerio<Element>,
  headers: string[],
  names: string[],
): string {
  const idx = findHeaderIndex(headers, names);
  if (idx >= 0 && idx < cells.length) {
    return $(cells[idx]).text().trim();
  }
  return "";
}

// Helper: parse "Last, First" or "First Last" name formats
function parseName(
  name: string,
): { firstName: string; lastName: string } | null {
  if (!name || name.length < 2) return null;

  // Remove jersey number prefix if present
  const cleaned = name.replace(/^\d+\s*/, "").trim();
  if (!cleaned) return null;

  if (cleaned.includes(",")) {
    const parts = cleaned.split(",").map((p) => p.trim());
    return { firstName: parts[1] || "", lastName: parts[0] };
  }

  const parts = cleaned.split(/\s+/);
  if (parts.length < 2) return null;
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}
