import axios from "axios";
import * as cheerio from "cheerio";

export interface RawRpiEntry {
  rank: number;
  teamName: string;
  rating: number;
  record: string;
  conferenceRecord: string;
}

const USER_AGENT =
  "Mozilla/5.0 (compatible; CollegeBaseballAnalytics/1.0; research)";

/**
 * Scrape RPI rankings from Warren Nolan's website.
 */
export async function scrapeWarrenNolanRpi(): Promise<RawRpiEntry[]> {
  const url = "https://www.warrennolan.com/baseball/rpi/nitty";
  const response = await axios.get(url, {
    headers: { "User-Agent": USER_AGENT },
    timeout: 15000,
  });
  const $ = cheerio.load(response.data);
  const entries: RawRpiEntry[] = [];

  $("table tbody tr").each((_i, row) => {
    const cells = $(row).find("td");
    if (cells.length < 3) return;

    const rankText = $(cells[0]).text().trim();
    const rank = parseInt(rankText);
    if (isNaN(rank)) return;

    const teamName = $(cells[1]).text().trim();
    const ratingText = $(cells[2]).text().trim();
    const rating = parseFloat(ratingText);
    if (isNaN(rating)) return;

    const record = cells.length > 3 ? $(cells[3]).text().trim() : "";
    const confRecord = cells.length > 4 ? $(cells[4]).text().trim() : "";

    entries.push({
      rank,
      teamName: cleanTeamName(teamName),
      rating,
      record,
      conferenceRecord: confRecord,
    });
  });

  return entries;
}

/**
 * Scrape RPI from boydsworld.com as a fallback source.
 */
export async function scrapeBoydsworldRpi(): Promise<RawRpiEntry[]> {
  const url = "http://boydsworld.com/data/rpi.txt";
  const entries: RawRpiEntry[] = [];

  try {
    const response = await axios.get(url, {
      headers: { "User-Agent": USER_AGENT },
      timeout: 15000,
    });

    const lines = response.data.split("\n");
    let rank = 1;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      // Format varies but typically: Rank Team Rating Record
      const parts = trimmed.split(/\s{2,}|\t/);
      if (parts.length < 3) continue;

      const teamName = parts[1]?.trim();
      const rating = parseFloat(parts[2]?.trim());

      if (!teamName || isNaN(rating)) continue;

      entries.push({
        rank: parseInt(parts[0]) || rank,
        teamName: cleanTeamName(teamName),
        rating,
        record: parts[3]?.trim() || "",
        conferenceRecord: parts[4]?.trim() || "",
      });
      rank++;
    }
  } catch {
    // Boydsworld may not always be available — this is a fallback
  }

  return entries;
}

function cleanTeamName(name: string): string {
  return name
    .replace(/^\d+\.?\s*/, "") // Remove leading rank numbers
    .replace(/\s*\(\d+-\d+\)\s*$/, "") // Remove trailing record
    .replace(/\s+/g, " ")
    .trim();
}
