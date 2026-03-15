import axios from "axios";
import * as cheerio from "cheerio";
import type { Element } from "domhandler";
import type { RawRosterEntry } from "./ncaa-stats";

const USER_AGENT =
  "Mozilla/5.0 (compatible; CollegeBaseballAnalytics/1.0; research)";

/**
 * Scrape roster from a school's athletics website.
 * Handles common HTML patterns used by athletics sites (SIDEARM, etc.).
 */
export async function scrapeTeamRoster(
  rosterUrl: string,
): Promise<RawRosterEntry[]> {
  const response = await axios.get(rosterUrl, {
    headers: { "User-Agent": USER_AGENT },
    timeout: 15000,
  });
  const $ = cheerio.load(response.data);
  const roster: RawRosterEntry[] = [];

  // Strategy 1: SIDEARM-style roster cards
  $(".s-person-card, .roster-card, [class*='roster'] li, [class*='roster'] .card").each(
    (_i, el) => {
      const entry = parseRosterCard($, el);
      if (entry) roster.push(entry);
    },
  );

  if (roster.length > 0) return roster;

  // Strategy 2: Table-based roster
  $("table tbody tr").each((_i, row) => {
    const entry = parseRosterRow($, row);
    if (entry) roster.push(entry);
  });

  if (roster.length > 0) return roster;

  // Strategy 3: List-based roster
  $(".roster-list li, .s-person-details, [class*='player']").each(
    (_i, el) => {
      const entry = parseRosterListItem($, el);
      if (entry) roster.push(entry);
    },
  );

  return roster;
}

function parseRosterCard(
  $: cheerio.CheerioAPI,
  el: Element,
): RawRosterEntry | null {
  const name =
    $(el).find(".s-person-details__personal-single-line, .name, h3, h4").first().text().trim() ||
    $(el).find("a").first().text().trim();

  if (!name) return null;
  const nameParts = splitName(name);
  if (!nameParts) return null;

  return {
    firstName: nameParts.firstName,
    lastName: nameParts.lastName,
    position:
      $(el).find(".s-person-card__content__person__position, .position, [class*='pos']").first().text().trim() || "",
    classYear:
      $(el).find(".s-person-card__content__person__year, .year, [class*='year'], [class*='class']").first().text().trim() || "",
    height:
      $(el).find("[class*='height']").first().text().trim() || undefined,
    weight:
      $(el).find("[class*='weight']").first().text().trim() || undefined,
    hometown:
      $(el).find("[class*='hometown']").first().text().trim() || undefined,
    bats: extractBatsThrows($, el, "bats"),
    throws: extractBatsThrows($, el, "throws"),
  };
}

function parseRosterRow(
  $: cheerio.CheerioAPI,
  row: Element,
): RawRosterEntry | null {
  const cells = $(row).find("td");
  if (cells.length < 2) return null;

  // Try to find name — usually in the first or second column
  let name = "";
  cells.each((_i, cell) => {
    const text = $(cell).text().trim();
    // Name cells usually contain spaces and aren't purely numeric
    if (!name && text.includes(" ") && !/^\d+$/.test(text)) {
      name = text;
    }
  });

  if (!name) {
    // Fallback: use second cell (first is often jersey number)
    name = $(cells[1]).text().trim();
  }

  const nameParts = splitName(name);
  if (!nameParts) return null;

  return {
    firstName: nameParts.firstName,
    lastName: nameParts.lastName,
    position: findCellContent($, cells, /^(P|C|1B|2B|3B|SS|LF|CF|RF|DH|OF|INF|UT|RHP|LHP)$/i) || "",
    classYear: findCellContent($, cells, /^(Fr\.|So\.|Jr\.|Sr\.|R-Fr\.|R-So\.|R-Jr\.|R-Sr\.|FR|SO|JR|SR|Gr\.)$/i) || "",
  };
}

function parseRosterListItem(
  $: cheerio.CheerioAPI,
  el: Element,
): RawRosterEntry | null {
  const name = $(el).find("a, .name, h3, h4").first().text().trim();
  if (!name) return null;
  const nameParts = splitName(name);
  if (!nameParts) return null;

  return {
    firstName: nameParts.firstName,
    lastName: nameParts.lastName,
    position: $(el).find("[class*='pos']").first().text().trim() || "",
    classYear: $(el).find("[class*='year'], [class*='class']").first().text().trim() || "",
  };
}

function splitName(
  name: string,
): { firstName: string; lastName: string } | null {
  const cleaned = name.replace(/^\d+\s*/, "").trim();
  if (!cleaned || cleaned.length < 2) return null;

  if (cleaned.includes(",")) {
    const parts = cleaned.split(",").map((p) => p.trim());
    return { firstName: parts[1], lastName: parts[0] };
  }

  const parts = cleaned.split(/\s+/);
  if (parts.length < 2) return null;
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

function findCellContent(
  $: cheerio.CheerioAPI,
  cells: cheerio.Cheerio<Element>,
  pattern: RegExp,
): string | null {
  let found: string | null = null;
  cells.each((_i, cell) => {
    const text = $(cell).text().trim();
    if (pattern.test(text)) {
      found = text;
      return false; // break
    }
  });
  return found;
}

function extractBatsThrows(
  $: cheerio.CheerioAPI,
  el: Element,
  type: "bats" | "throws",
): string | undefined {
  const text = $(el).text().toLowerCase();
  const regex =
    type === "bats"
      ? /b(?:ats)?[:\s]*(l|r|s|both)/i
      : /t(?:hrows)?[:\s]*(l|r)/i;
  const match = text.match(regex);
  return match ? match[1].toUpperCase() : undefined;
}
