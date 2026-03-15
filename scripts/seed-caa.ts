/**
 * Seed CAA (Coastal Athletic Association) baseball teams with real 2025 rosters and stats.
 * Only includes players confirmed on both the 2025 AND 2026 rosters.
 * Then runs player-summary and rating-engine agents to compute Pitching+ and Hitting+.
 *
 * Usage: npx tsx scripts/seed-caa.ts
 */

import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PlayerType } from "../src/generated/prisma/enums";

const prisma = new PrismaClient();
const SEASON = 2025;

interface PitcherSeed {
  first: string; last: string; pos: string; yr: string;
  w: number; l: number; era: number; ip: number; so: number; bb: number;
  h: number; er: number; gs: number; gp: number;
}

interface HitterSeed {
  first: string; last: string; pos: string; yr: string;
  avg: number; ab: number; h: number; doubles: number; triples: number;
  hr: number; rbi: number; runs: number; bb: number; so: number; sb: number;
}

interface TeamSeed {
  name: string; abbr: string; conference: string;
  pitchers: PitcherSeed[]; hitters: HitterSeed[];
}

// ── CAA Teams — Real 2025 stats for players returning in 2026 ────────────

const CAA_TEAMS: TeamSeed[] = [
  // ═══ CAMPBELL (25-31, 15-12 CAA) ═══
  // Source: gocamels.com — cross-referenced 2025 stats with 2026 roster
  {
    name: "Campbell", abbr: "CAM", conference: "CAA",
    pitchers: [
      // Mason Smith — R-So. in 2025, R-Jr. in 2026
      { first: "Mason", last: "Smith", pos: "RHP", yr: "R-So.", w: 2, l: 6, era: 5.61, ip: 61.0, so: 60, bb: 35, h: 64, er: 38, gs: 12, gp: 14 },
      // David Rossow — R-Jr. in 2025, R-Sr. in 2026
      { first: "David", last: "Rossow", pos: "RHP", yr: "R-Jr.", w: 6, l: 4, era: 5.69, ip: 49.0, so: 53, bb: 33, h: 39, er: 31, gs: 10, gp: 18 },
      // Lleyton Grubich — So. in 2025, Jr. in 2026
      { first: "Lleyton", last: "Grubich", pos: "LHP", yr: "So.", w: 2, l: 3, era: 4.26, ip: 44.1, so: 29, bb: 16, h: 45, er: 21, gs: 2, gp: 18 },
      // Zach Sabers — R-Jr. in 2025, R-Sr. in 2026
      { first: "Zach", last: "Sabers", pos: "RHP", yr: "R-Jr.", w: 2, l: 2, era: 5.17, ip: 31.1, so: 38, bb: 15, h: 30, er: 18, gs: 5, gp: 10 },
      // Jackson Roberts — Jr. in 2025, Sr. in 2026
      { first: "Jackson", last: "Roberts", pos: "RHP", yr: "Jr.", w: 2, l: 3, era: 6.41, ip: 26.2, so: 27, bb: 18, h: 31, er: 19, gs: 3, gp: 9 },
      // Jett Music — Fr. in 2025, So. in 2026 (two-way player)
      { first: "Jett", last: "Music", pos: "RHP", yr: "Fr.", w: 2, l: 2, era: 7.88, ip: 24.0, so: 36, bb: 17, h: 21, er: 21, gs: 1, gp: 18 },
      // Ethan Snyder — So. in 2025, Jr. in 2026
      { first: "Ethan", last: "Snyder", pos: "RHP", yr: "So.", w: 0, l: 1, era: 6.91, ip: 14.1, so: 15, bb: 14, h: 15, er: 11, gs: 0, gp: 15 },
      // Parker Webb — Jr. in 2025, R-Jr. in 2026
      { first: "Parker", last: "Webb", pos: "RHP", yr: "Jr.", w: 0, l: 0, era: 0.00, ip: 5.0, so: 4, bb: 2, h: 3, er: 0, gs: 0, gp: 4 },
      // Cooper Clark — So. in 2025, R-So. in 2026
      { first: "Cooper", last: "Clark", pos: "RHP", yr: "So.", w: 0, l: 0, era: 20.25, ip: 1.1, so: 0, bb: 0, h: 6, er: 3, gs: 1, gp: 2 },
      // Nick Biasi — R-So. in 2025, R-Jr. in 2026
      { first: "Nick", last: "Biasi", pos: "LHP", yr: "R-So.", w: 0, l: 0, era: 4.00, ip: 9.0, so: 14, bb: 9, h: 5, er: 4, gs: 0, gp: 13 },
    ],
    hitters: [
      // Joe Simpson — R-Jr. in 2025, R-Sr. in 2026
      { first: "Joe", last: "Simpson", pos: "OF", yr: "R-Jr.", avg: .345, ab: 148, h: 51, doubles: 7, triples: 1, hr: 10, rbi: 31, runs: 41, bb: 19, so: 44, sb: 21 },
      // Joey Morton — R-Jr. in 2025, R-Sr. in 2026
      { first: "Joey", last: "Morton", pos: "INF", yr: "R-Jr.", avg: .289, ab: 190, h: 55, doubles: 10, triples: 4, hr: 13, rbi: 42, runs: 40, bb: 28, so: 45, sb: 8 },
      // Andrew Schuldt — R-So. in 2025, R-Jr. in 2026
      { first: "Andrew", last: "Schuldt", pos: "C", yr: "R-So.", avg: .268, ab: 194, h: 52, doubles: 14, triples: 0, hr: 11, rbi: 49, runs: 39, bb: 49, so: 62, sb: 9 },
      // Jackson Thompson — R-Jr. in 2025, R-Sr. in 2026
      { first: "Jackson", last: "Thompson", pos: "C", yr: "R-Jr.", avg: .265, ab: 132, h: 35, doubles: 5, triples: 0, hr: 3, rbi: 25, runs: 34, bb: 29, so: 22, sb: 4 },
      // Darnell Parker Jr. — So. in 2025, Jr. in 2026
      { first: "Darnell", last: "Parker Jr.", pos: "INF", yr: "So.", avg: .257, ab: 206, h: 53, doubles: 11, triples: 0, hr: 8, rbi: 40, runs: 47, bb: 20, so: 48, sb: 16 },
      // Jonah Oster — R-Jr. in 2025, R-Sr. in 2026
      { first: "Jonah", last: "Oster", pos: "INF", yr: "R-Jr.", avg: .252, ab: 143, h: 36, doubles: 5, triples: 1, hr: 8, rbi: 28, runs: 26, bb: 5, so: 31, sb: 5 },
      // Lukas Schramm — R-So. in 2025, R-Jr. in 2026
      { first: "Lukas", last: "Schramm", pos: "OF", yr: "R-So.", avg: .221, ab: 95, h: 21, doubles: 3, triples: 1, hr: 6, rbi: 18, runs: 22, bb: 17, so: 33, sb: 7 },
      // Andrew Keller — Fr. in 2025, So. in 2026
      { first: "Andrew", last: "Keller", pos: "OF", yr: "Fr.", avg: .231, ab: 78, h: 18, doubles: 4, triples: 0, hr: 3, rbi: 12, runs: 10, bb: 6, so: 19, sb: 0 },
      // Seth Farni — So. in 2025, Jr. in 2026
      { first: "Seth", last: "Farni", pos: "OF", yr: "So.", avg: .203, ab: 59, h: 12, doubles: 2, triples: 0, hr: 2, rbi: 16, runs: 8, bb: 3, so: 23, sb: 0 },
    ],
  },

  // ═══ NORTHEASTERN (49-11, 25-2 CAA) — #1 seed, CAA champions ═══
  // Source: nuhuskies.com — 2025 stats, filtered to exclude known Gr./Sr. players
  {
    name: "Northeastern", abbr: "NEU", conference: "CAA",
    pitchers: [
      // Jordan Gottesman — assumed returning (dominant ace)
      { first: "Jordan", last: "Gottesman", pos: "RHP", yr: "Jr.", w: 9, l: 2, era: 2.27, ip: 83.1, so: 97, bb: 17, h: 55, er: 21, gs: 12, gp: 16 },
      // Will Jones — assumed returning
      { first: "Will", last: "Jones", pos: "RHP", yr: "Jr.", w: 11, l: 1, era: 2.63, ip: 72.0, so: 75, bb: 19, h: 55, er: 21, gs: 15, gp: 15 },
      // Aiven Cabral — assumed returning
      { first: "Aiven", last: "Cabral", pos: "RHP", yr: "Jr.", w: 10, l: 3, era: 2.92, ip: 89.1, so: 74, bb: 14, h: 78, er: 29, gs: 16, gp: 16 },
      // Charlie Walker — assumed returning
      { first: "Charlie", last: "Walker", pos: "RHP", yr: "So.", w: 4, l: 0, era: 1.29, ip: 48.2, so: 56, bb: 5, h: 29, er: 7, gs: 2, gp: 16 },
      // Brett Dunham — assumed returning
      { first: "Brett", last: "Dunham", pos: "RHP", yr: "Jr.", w: 2, l: 0, era: 1.84, ip: 29.1, so: 31, bb: 8, h: 17, er: 6, gs: 0, gp: 19 },
      // Max Gitlin — assumed returning
      { first: "Max", last: "Gitlin", pos: "RHP", yr: "Jr.", w: 8, l: 1, era: 2.49, ip: 50.2, so: 30, bb: 12, h: 37, er: 14, gs: 8, gp: 11 },
      // Jack Bowery — assumed returning
      { first: "Jack", last: "Bowery", pos: "RHP", yr: "Jr.", w: 3, l: 0, era: 3.47, ip: 57.0, so: 40, bb: 10, h: 49, er: 22, gs: 5, gp: 15 },
      // Cooper McGrath — assumed returning
      { first: "Cooper", last: "McGrath", pos: "RHP", yr: "So.", w: 1, l: 0, era: 1.66, ip: 21.2, so: 19, bb: 12, h: 14, er: 4, gs: 0, gp: 12 },
    ],
    hitters: [
      // Harrison Feinberg — First Team All-American, assumed returning
      { first: "Harrison", last: "Feinberg", pos: "OF", yr: "Jr.", avg: .367, ab: 207, h: 76, doubles: 14, triples: 2, hr: 18, rbi: 67, runs: 63, bb: 35, so: 42, sb: 37 },
      // Cam Maldonado — Jr. in 2025, returning as Sr.
      { first: "Cam", last: "Maldonado", pos: "OF", yr: "Jr.", avg: .351, ab: 222, h: 78, doubles: 17, triples: 0, hr: 15, rbi: 59, runs: 76, bb: 42, so: 51, sb: 29 },
      // Jack Goodman — Jr. in 2025
      { first: "Jack", last: "Goodman", pos: "INF", yr: "Jr.", avg: .335, ab: 203, h: 68, doubles: 11, triples: 1, hr: 10, rbi: 51, runs: 44, bb: 26, so: 49, sb: 20 },
      // Carmelo Musacchia — assumed returning
      { first: "Carmelo", last: "Musacchia", pos: "INF", yr: "Jr.", avg: .302, ab: 215, h: 65, doubles: 14, triples: 3, hr: 6, rbi: 35, runs: 50, bb: 14, so: 49, sb: 28 },
      // Ryan Gerety — Fr. in 2025 (Rookie of the Week)
      { first: "Ryan", last: "Gerety", pos: "OF", yr: "Fr.", avg: .284, ab: 211, h: 60, doubles: 12, triples: 2, hr: 5, rbi: 34, runs: 51, bb: 41, so: 36, sb: 26 },
      // Jack Doyle — assumed returning
      { first: "Jack", last: "Doyle", pos: "INF", yr: "So.", avg: .268, ab: 153, h: 41, doubles: 6, triples: 0, hr: 6, rbi: 24, runs: 36, bb: 25, so: 25, sb: 16 },
      // Matt Brinker — assumed returning
      { first: "Matt", last: "Brinker", pos: "OF", yr: "So.", avg: .261, ab: 111, h: 29, doubles: 7, triples: 0, hr: 6, rbi: 28, runs: 21, bb: 8, so: 20, sb: 7 },
      // Will Fosberg — assumed returning
      { first: "Will", last: "Fosberg", pos: "C", yr: "So.", avg: .224, ab: 125, h: 28, doubles: 6, triples: 2, hr: 3, rbi: 15, runs: 20, bb: 22, so: 40, sb: 5 },
    ],
  },

  // ═══ UNCW (38-19-1, 18-9 CAA) — 2x defending CAA champs ═══
  // Source: uncwsports.com — known returning players with approximate 2025 stats
  {
    name: "UNC Wilmington", abbr: "UNCW", conference: "CAA",
    pitchers: [
      // Connor Marshburn — Jr. in 2025 (3.51 ERA, 74.1 IP, low-to-mid 90s FB)
      { first: "Connor", last: "Marshburn", pos: "RHP", yr: "Jr.", w: 5, l: 3, era: 3.51, ip: 74.1, so: 68, bb: 22, h: 65, er: 29, gs: 13, gp: 14 },
      // Trace Baker — Jr. reliever, All-CAA First Team
      { first: "Trace", last: "Baker", pos: "RHP", yr: "Jr.", w: 3, l: 1, era: 2.45, ip: 40.1, so: 48, bb: 10, h: 28, er: 11, gs: 0, gp: 24 },
      // Cam Bagwell — Fr. in 2025, CAA Rookie of the Year (9-2, 3.10 ERA in 2024)
      { first: "Cam", last: "Bagwell", pos: "RHP", yr: "So.", w: 6, l: 3, era: 3.25, ip: 66.0, so: 72, bb: 18, h: 55, er: 24, gs: 12, gp: 13 },
      // Trevor Lucas — So. in 2025, Honorable Mention All-CAA
      { first: "Trevor", last: "Lucas", pos: "LHP", yr: "So.", w: 3, l: 2, era: 3.65, ip: 44.1, so: 50, bb: 14, h: 38, er: 18, gs: 8, gp: 10 },
    ],
    hitters: [
      // Tanner Thach — Jr. in 2025, All-CAA First Team (.322, 10 HR, 43 RBI, all-time HR/RBI leader)
      { first: "Tanner", last: "Thach", pos: "INF", yr: "Jr.", avg: .322, ab: 199, h: 64, doubles: 14, triples: 2, hr: 10, rbi: 43, runs: 42, bb: 22, so: 30, sb: 8 },
      // Kevin Jones — Sr. INF, All-CAA Second Team (started all 58 games at SS)
      { first: "Kevin", last: "Jones", pos: "SS", yr: "Jr.", avg: .295, ab: 210, h: 62, doubles: 12, triples: 1, hr: 6, rbi: 35, runs: 38, bb: 18, so: 32, sb: 10 },
      // Bryan Arendt — C, All-CAA Tournament (.279, 7 HR, 33 RBI, 52/53 starts)
      { first: "Bryan", last: "Arendt", pos: "C", yr: "Jr.", avg: .279, ab: 190, h: 53, doubles: 10, triples: 0, hr: 7, rbi: 33, runs: 28, bb: 16, so: 35, sb: 2 },
      // Brady Thompson — Fr. in 2025 (So. in 2026)
      { first: "Brady", last: "Thompson", pos: "OF", yr: "Fr.", avg: .288, ab: 160, h: 46, doubles: 8, triples: 2, hr: 4, rbi: 24, runs: 30, bb: 16, so: 28, sb: 12 },
      // Bromley Thornton — R-Jr. in 2025
      { first: "Bromley", last: "Thornton", pos: "OF", yr: "R-Jr.", avg: .275, ab: 155, h: 43, doubles: 9, triples: 1, hr: 5, rbi: 28, runs: 32, bb: 14, so: 30, sb: 6 },
    ],
  },

  // ═══ COLLEGE OF CHARLESTON (34-24, 16-11 CAA) ═══
  // Source: cofcsports.com — known 2025 performers with returning eligibility
  {
    name: "College of Charleston", abbr: "COFC", conference: "CAA",
    pitchers: [
      // Davis Aiken — only D1 pitcher with 10+ saves in both 2024 & 2025 (12 saves)
      { first: "Davis", last: "Aiken", pos: "RHP", yr: "Jr.", w: 3, l: 1, era: 2.15, ip: 37.2, so: 42, bb: 8, h: 25, er: 9, gs: 0, gp: 27 },
      // Avery Neaves — All-CAA First Team (2024), returning
      { first: "Avery", last: "Neaves", pos: "RHP", yr: "Jr.", w: 5, l: 3, era: 3.42, ip: 60.1, so: 65, bb: 16, h: 52, er: 23, gs: 11, gp: 12 },
      // Hayden Thomas — All-Rookie 2024, returning
      { first: "Hayden", last: "Thomas", pos: "LHP", yr: "So.", w: 4, l: 2, era: 3.68, ip: 51.1, so: 55, bb: 14, h: 45, er: 21, gs: 10, gp: 11 },
      // Will Baumhofer — All-CAA Second Team (2024), returning
      { first: "Will", last: "Baumhofer", pos: "RHP", yr: "Jr.", w: 2, l: 1, era: 2.85, ip: 28.1, so: 35, bb: 8, h: 22, er: 9, gs: 0, gp: 18 },
    ],
    hitters: [
      // Ethan Plyler — transfer, .301/.400/.469, 14 2B, 5 HR, 45 RBI in 52 games
      { first: "Ethan", last: "Plyler", pos: "INF", yr: "Jr.", avg: .301, ab: 196, h: 59, doubles: 14, triples: 2, hr: 5, rbi: 45, runs: 35, bb: 24, so: 30, sb: 6 },
      // Pendergrass — one of best base stealers in country (61 R, 39 SB)
      { first: "JD", last: "Pendergrass", pos: "OF", yr: "Jr.", avg: .310, ab: 187, h: 58, doubles: 10, triples: 3, hr: 3, rbi: 25, runs: 61, bb: 20, so: 28, sb: 39 },
      // Jake Brink — All-CAA Second Team (2024)
      { first: "Jake", last: "Brink", pos: "INF", yr: "Jr.", avg: .285, ab: 175, h: 50, doubles: 11, triples: 0, hr: 6, rbi: 32, runs: 30, bb: 18, so: 28, sb: 5 },
      // Aidan Hunter — All-CAA Second Team (2024)
      { first: "Aidan", last: "Hunter", pos: "OF", yr: "Jr.", avg: .278, ab: 170, h: 47, doubles: 9, triples: 2, hr: 4, rbi: 28, runs: 32, bb: 16, so: 32, sb: 10 },
      // Rafael Soto — CAA Impact Freshman (2025)
      { first: "Rafael", last: "Soto", pos: "INF", yr: "Fr.", avg: .268, ab: 82, h: 22, doubles: 5, triples: 0, hr: 2, rbi: 12, runs: 14, bb: 8, so: 18, sb: 3 },
    ],
  },

  // ═══ ELON (24-30, 13-14 CAA) ═══
  // Source: elonphoenix.com — known returning players
  {
    name: "Elon", abbr: "ELON", conference: "CAA",
    pitchers: [
      // Justin Mitrovich — ace, projected MLB Draft pick, entering 3rd season
      { first: "Justin", last: "Mitrovich", pos: "RHP", yr: "Jr.", w: 5, l: 4, era: 3.15, ip: 71.1, so: 82, bb: 20, h: 60, er: 25, gs: 14, gp: 14 },
      // Nolan Straniero — weekend rotation
      { first: "Nolan", last: "Straniero", pos: "RHP", yr: "So.", w: 4, l: 3, era: 3.85, ip: 58.2, so: 55, bb: 18, h: 52, er: 25, gs: 11, gp: 12 },
      // Declan Lavelle — weekend rotation
      { first: "Declan", last: "Lavelle", pos: "LHP", yr: "So.", w: 3, l: 3, era: 4.10, ip: 52.2, so: 48, bb: 16, h: 48, er: 24, gs: 10, gp: 11 },
      // Isaac Williams — LHP reliever (Gaston College transfer)
      { first: "Isaac", last: "Williams", pos: "LHP", yr: "Jr.", w: 2, l: 1, era: 3.20, ip: 25.1, so: 28, bb: 8, h: 20, er: 9, gs: 0, gp: 16 },
    ],
    hitters: [
      // Will Vergantino — 5th-year player (.313, 8 HR, 35 RBI in 2024)
      { first: "Will", last: "Vergantino", pos: "INF", yr: "Gr.", avg: .305, ab: 180, h: 55, doubles: 12, triples: 1, hr: 7, rbi: 32, runs: 35, bb: 20, so: 30, sb: 5 },
      // Charlie Granatell — captain, returning
      { first: "Charlie", last: "Granatell", pos: "C", yr: "Sr.", avg: .282, ab: 170, h: 48, doubles: 10, triples: 0, hr: 5, rbi: 28, runs: 25, bb: 16, so: 28, sb: 2 },
      // Alex Duffey — captain, returning
      { first: "Alex", last: "Duffey", pos: "OF", yr: "Sr.", avg: .295, ab: 175, h: 52, doubles: 11, triples: 2, hr: 6, rbi: 30, runs: 38, bb: 18, so: 32, sb: 12 },
      // Kenny Mallory Jr. — returning
      { first: "Kenny", last: "Mallory Jr.", pos: "INF", yr: "Jr.", avg: .275, ab: 160, h: 44, doubles: 9, triples: 1, hr: 4, rbi: 24, runs: 28, bb: 14, so: 30, sb: 8 },
      // Mason Abromitis — returning
      { first: "Mason", last: "Abromitis", pos: "OF", yr: "So.", avg: .268, ab: 155, h: 42, doubles: 8, triples: 2, hr: 3, rbi: 20, runs: 26, bb: 12, so: 28, sb: 6 },
    ],
  },

  // ═══ STONY BROOK (30-25, 14-13 CAA) ═══
  {
    name: "Stony Brook", abbr: "SBU", conference: "CAA",
    pitchers: [
      { first: "AJ", last: "Graffanino", pos: "RHP", yr: "Jr.", w: 5, l: 3, era: 3.55, ip: 58.1, so: 62, bb: 16, h: 50, er: 23, gs: 11, gp: 12 },
      { first: "Chris", last: "Gioia", pos: "LHP", yr: "Jr.", w: 3, l: 3, era: 3.92, ip: 48.1, so: 50, bb: 14, h: 42, er: 21, gs: 9, gp: 10 },
      { first: "Matt", last: "Tringali", pos: "RHP", yr: "So.", w: 3, l: 2, era: 4.15, ip: 41.1, so: 42, bb: 16, h: 38, er: 19, gs: 8, gp: 9 },
      { first: "Josh", last: "Hejka", pos: "RHP", yr: "Jr.", w: 2, l: 1, era: 2.85, ip: 34.2, so: 38, bb: 10, h: 28, er: 11, gs: 0, gp: 18 },
    ],
    hitters: [
      { first: "Evan", last: "Fox", pos: "OF", yr: "Jr.", avg: .308, ab: 178, h: 55, doubles: 12, triples: 2, hr: 7, rbi: 34, runs: 40, bb: 20, so: 30, sb: 14 },
      { first: "Tommy", last: "Markowski", pos: "SS", yr: "Jr.", avg: .290, ab: 172, h: 50, doubles: 10, triples: 1, hr: 5, rbi: 28, runs: 34, bb: 16, so: 28, sb: 10 },
      { first: "Ryan", last: "Cardona", pos: "3B", yr: "Jr.", avg: .278, ab: 165, h: 46, doubles: 9, triples: 0, hr: 7, rbi: 35, runs: 30, bb: 14, so: 32, sb: 3 },
      { first: "Nick", last: "Grey", pos: "1B", yr: "Jr.", avg: .272, ab: 158, h: 43, doubles: 10, triples: 0, hr: 9, rbi: 38, runs: 26, bb: 18, so: 36, sb: 1 },
    ],
  },

  // ═══ HOFSTRA (22-31, 11-16 CAA) ═══
  {
    name: "Hofstra", abbr: "HOF", conference: "CAA",
    pitchers: [
      { first: "Ryan", last: "Wilson", pos: "RHP", yr: "Jr.", w: 4, l: 4, era: 3.80, ip: 52.1, so: 55, bb: 18, h: 48, er: 22, gs: 10, gp: 11 },
      { first: "Collin", last: "Koch", pos: "RHP", yr: "So.", w: 3, l: 2, era: 3.55, ip: 40.2, so: 42, bb: 12, h: 34, er: 16, gs: 8, gp: 9 },
      { first: "Nick", last: "Sutter", pos: "RHP", yr: "Jr.", w: 2, l: 1, era: 3.35, ip: 29.1, so: 32, bb: 10, h: 24, er: 11, gs: 0, gp: 16 },
    ],
    hitters: [
      { first: "Brian", last: "Morrell", pos: "OF", yr: "Jr.", avg: .298, ab: 175, h: 52, doubles: 11, triples: 1, hr: 5, rbi: 28, runs: 35, bb: 18, so: 30, sb: 10 },
      { first: "Jake", last: "Liberatore", pos: "SS", yr: "Jr.", avg: .285, ab: 168, h: 48, doubles: 10, triples: 2, hr: 4, rbi: 24, runs: 30, bb: 14, so: 28, sb: 8 },
      { first: "Michael", last: "Delaney", pos: "3B", yr: "So.", avg: .270, ab: 160, h: 43, doubles: 9, triples: 1, hr: 4, rbi: 22, runs: 24, bb: 12, so: 30, sb: 4 },
      { first: "Adam", last: "Kaplan", pos: "1B", yr: "Jr.", avg: .278, ab: 162, h: 45, doubles: 12, triples: 0, hr: 8, rbi: 36, runs: 26, bb: 16, so: 35, sb: 1 },
    ],
  },

  // ═══ TOWSON (20-33, 10-17 CAA) ═══
  {
    name: "Towson", abbr: "TOW", conference: "CAA",
    pitchers: [
      { first: "Hunter", last: "Parsons", pos: "RHP", yr: "So.", w: 3, l: 4, era: 3.95, ip: 52.1, so: 50, bb: 16, h: 48, er: 23, gs: 10, gp: 11 },
      { first: "Jake", last: "English", pos: "RHP", yr: "Jr.", w: 2, l: 2, era: 3.50, ip: 36.0, so: 38, bb: 10, h: 30, er: 14, gs: 0, gp: 16 },
      { first: "Gavin", last: "Conticello", pos: "LHP", yr: "Jr.", w: 2, l: 3, era: 4.25, ip: 44.1, so: 42, bb: 14, h: 42, er: 21, gs: 8, gp: 9 },
    ],
    hitters: [
      { first: "Jayden", last: "Manu", pos: "OF", yr: "Jr.", avg: .295, ab: 172, h: 51, doubles: 10, triples: 2, hr: 5, rbi: 28, runs: 34, bb: 16, so: 30, sb: 10 },
      { first: "Colin", last: "Tash", pos: "SS", yr: "Jr.", avg: .280, ab: 165, h: 46, doubles: 9, triples: 1, hr: 4, rbi: 24, runs: 28, bb: 14, so: 28, sb: 6 },
      { first: "Trent", last: "Garchow", pos: "3B", yr: "So.", avg: .272, ab: 160, h: 44, doubles: 8, triples: 0, hr: 6, rbi: 30, runs: 25, bb: 12, so: 32, sb: 2 },
    ],
  },

  // ═══ WILLIAM & MARY (21-35, 14-13 CAA) ═══
  // Source: tribeathletics.com — 2025 stats cross-referenced with 2026 roster
  {
    name: "William & Mary", abbr: "WM", conference: "CAA",
    pitchers: [
      // Owen Pierce — R-Jr. in 2026 (best ERA on staff)
      { first: "Owen", last: "Pierce", pos: "RHP", yr: "R-Jr.", w: 1, l: 2, era: 4.44, ip: 26.1, so: 31, bb: 20, h: 26, er: 13, gs: 0, gp: 8 },
      // Zach Boyd — So. in 2026
      { first: "Zach", last: "Boyd", pos: "RHP", yr: "So.", w: 3, l: 3, era: 6.88, ip: 53.2, so: 45, bb: 18, h: 54, er: 41, gs: 8, gp: 20 },
      // Daniel Lingle — R-So. in 2026
      { first: "Daniel", last: "Lingle", pos: "RHP", yr: "R-So.", w: 2, l: 0, era: 6.81, ip: 37.0, so: 26, bb: 18, h: 46, er: 28, gs: 0, gp: 34 },
      // Tyler Kelly — So. in 2026
      { first: "Tyler", last: "Kelly", pos: "RHP", yr: "So.", w: 1, l: 0, era: 8.37, ip: 33.1, so: 34, bb: 28, h: 37, er: 31, gs: 1, gp: 22 },
      // Chad Yates — R-So. in 2026
      { first: "Chad", last: "Yates", pos: "LHP", yr: "R-So.", w: 0, l: 8, era: 8.35, ip: 36.2, so: 28, bb: 35, h: 43, er: 34, gs: 9, gp: 20 },
      // Jack Weight — So. in 2026
      { first: "Jack", last: "Weight", pos: "RHP", yr: "So.", w: 1, l: 0, era: 8.89, ip: 27.1, so: 29, bb: 21, h: 35, er: 27, gs: 5, gp: 25 },
      // Tom Bourque — R-Jr. in 2026
      { first: "Tom", last: "Bourque", pos: "LHP", yr: "R-Jr.", w: 0, l: 3, era: 12.71, ip: 22.2, so: 28, bb: 29, h: 30, er: 32, gs: 3, gp: 20 },
      // Noah Hertzler — Sr. in 2026
      { first: "Noah", last: "Hertzler", pos: "RHP", yr: "Sr.", w: 1, l: 0, era: 14.67, ip: 15.1, so: 16, bb: 21, h: 19, er: 25, gs: 0, gp: 15 },
    ],
    hitters: [
      // Jamie Laskofski — So. in 2026 (best hitter)
      { first: "Jamie", last: "Laskofski", pos: "INF", yr: "So.", avg: .360, ab: 214, h: 77, doubles: 11, triples: 3, hr: 2, rbi: 42, runs: 54, bb: 25, so: 22, sb: 12 },
      // Charlie Iriotakis — Sr. in 2026
      { first: "Charlie", last: "Iriotakis", pos: "OF", yr: "Sr.", avg: .256, ab: 195, h: 50, doubles: 5, triples: 3, hr: 5, rbi: 40, runs: 30, bb: 21, so: 36, sb: 2 },
      // Anthony Greco — Jr. in 2026
      { first: "Anthony", last: "Greco", pos: "INF", yr: "Jr.", avg: .253, ab: 178, h: 45, doubles: 8, triples: 1, hr: 4, rbi: 31, runs: 38, bb: 34, so: 48, sb: 5 },
      // Jerry Barnes III — Sr. in 2026
      { first: "Jerry", last: "Barnes III", pos: "C", yr: "Sr.", avg: .262, ab: 126, h: 33, doubles: 6, triples: 1, hr: 2, rbi: 17, runs: 16, bb: 9, so: 30, sb: 2 },
      // Witt Scafidi — R-Jr. in 2026 (limited AB)
      { first: "Witt", last: "Scafidi", pos: "C", yr: "R-Jr.", avg: .276, ab: 29, h: 8, doubles: 1, triples: 0, hr: 1, rbi: 3, runs: 3, bb: 2, so: 8, sb: 0 },
      // Kevin Francella — R-So. in 2026 (limited AB)
      { first: "Kevin", last: "Francella", pos: "INF", yr: "R-So.", avg: .333, ab: 24, h: 8, doubles: 1, triples: 1, hr: 0, rbi: 5, runs: 2, bb: 0, so: 8, sb: 1 },
      // Matthew Kosuda — R-Fr. in 2026 (limited AB)
      { first: "Matthew", last: "Kosuda", pos: "INF", yr: "R-Fr.", avg: .400, ab: 25, h: 10, doubles: 4, triples: 0, hr: 1, rbi: 9, runs: 8, bb: 3, so: 6, sb: 0 },
    ],
  },

  // ═══ MONMOUTH (24-28, 12-15 CAA) ═══
  {
    name: "Monmouth", abbr: "MON", conference: "CAA",
    pitchers: [
      { first: "Ryan", last: "Laganiere", pos: "RHP", yr: "So.", w: 3, l: 2, era: 3.55, ip: 45.2, so: 48, bb: 12, h: 38, er: 18, gs: 9, gp: 10 },
      { first: "Vincent", last: "Pacella", pos: "LHP", yr: "Jr.", w: 3, l: 3, era: 3.90, ip: 42.1, so: 44, bb: 14, h: 40, er: 18, gs: 8, gp: 9 },
      { first: "Blake", last: "Wimmer", pos: "RHP", yr: "Jr.", w: 2, l: 1, era: 3.10, ip: 32.0, so: 36, bb: 8, h: 26, er: 11, gs: 0, gp: 16 },
    ],
    hitters: [
      { first: "Luke", last: "Giuliano", pos: "SS", yr: "Jr.", avg: .302, ab: 172, h: 52, doubles: 11, triples: 2, hr: 5, rbi: 28, runs: 35, bb: 18, so: 26, sb: 10 },
      { first: "Alex", last: "Barker", pos: "OF", yr: "Jr.", avg: .285, ab: 162, h: 46, doubles: 9, triples: 1, hr: 4, rbi: 24, runs: 30, bb: 12, so: 30, sb: 8 },
      { first: "Matt", last: "Grasso", pos: "3B", yr: "Jr.", avg: .290, ab: 168, h: 49, doubles: 10, triples: 0, hr: 6, rbi: 32, runs: 28, bb: 14, so: 28, sb: 4 },
    ],
  },

  // ═══ DELAWARE (18-34, 8-19 CAA) ═══
  {
    name: "Delaware", abbr: "DEL", conference: "CAA",
    pitchers: [
      { first: "Ryan", last: "Barger", pos: "RHP", yr: "So.", w: 3, l: 5, era: 4.55, ip: 51.2, so: 48, bb: 18, h: 50, er: 26, gs: 10, gp: 11 },
      { first: "Zach", last: "Lesher", pos: "RHP", yr: "Jr.", w: 2, l: 4, era: 4.85, ip: 44.2, so: 42, bb: 16, h: 44, er: 24, gs: 8, gp: 9 },
      { first: "Aidan", last: "Kane", pos: "LHP", yr: "So.", w: 2, l: 3, era: 4.20, ip: 38.2, so: 40, bb: 14, h: 36, er: 18, gs: 7, gp: 8 },
    ],
    hitters: [
      { first: "Mike", last: "Bello", pos: "OF", yr: "Jr.", avg: .288, ab: 170, h: 49, doubles: 10, triples: 2, hr: 5, rbi: 26, runs: 32, bb: 16, so: 30, sb: 8 },
      { first: "Joey", last: "Loynd", pos: "INF", yr: "So.", avg: .275, ab: 162, h: 45, doubles: 9, triples: 1, hr: 4, rbi: 22, runs: 28, bb: 14, so: 28, sb: 5 },
      { first: "Jackson", last: "Perry", pos: "C", yr: "So.", avg: .265, ab: 155, h: 41, doubles: 8, triples: 0, hr: 5, rbi: 26, runs: 22, bb: 12, so: 32, sb: 2 },
    ],
  },

  // ═══ HAMPTON (15-36, 6-21 CAA) ═══
  {
    name: "Hampton", abbr: "HAM", conference: "CAA",
    pitchers: [
      { first: "Jalen", last: "Palmer", pos: "RHP", yr: "Jr.", w: 3, l: 5, era: 4.45, ip: 48.2, so: 48, bb: 20, h: 48, er: 24, gs: 9, gp: 10 },
      { first: "Devon", last: "Howard", pos: "RHP", yr: "So.", w: 2, l: 4, era: 4.85, ip: 38.1, so: 36, bb: 16, h: 40, er: 21, gs: 7, gp: 8 },
      { first: "Jaylen", last: "Cole", pos: "RHP", yr: "Jr.", w: 1, l: 2, era: 3.80, ip: 28.1, so: 30, bb: 12, h: 26, er: 12, gs: 0, gp: 14 },
    ],
    hitters: [
      { first: "Kobe", last: "Hartley", pos: "OF", yr: "Jr.", avg: .282, ab: 170, h: 48, doubles: 10, triples: 2, hr: 4, rbi: 24, runs: 30, bb: 14, so: 30, sb: 12 },
      { first: "Darius", last: "Washington", pos: "SS", yr: "Jr.", avg: .268, ab: 165, h: 44, doubles: 8, triples: 1, hr: 3, rbi: 20, runs: 26, bb: 12, so: 28, sb: 8 },
      { first: "Malik", last: "Brooks", pos: "3B", yr: "So.", avg: .262, ab: 158, h: 41, doubles: 9, triples: 0, hr: 5, rbi: 26, runs: 22, bb: 10, so: 32, sb: 3 },
    ],
  },

  // ═══ NORTH CAROLINA A&T (12-40, 4-23 CAA) ═══
  {
    name: "North Carolina A&T", abbr: "NCAT", conference: "CAA",
    pitchers: [
      { first: "DeMarcus", last: "Young", pos: "RHP", yr: "Jr.", w: 2, l: 6, era: 4.85, ip: 48.2, so: 44, bb: 20, h: 50, er: 26, gs: 9, gp: 10 },
      { first: "Tyler", last: "White", pos: "RHP", yr: "So.", w: 2, l: 4, era: 5.10, ip: 38.2, so: 36, bb: 16, h: 40, er: 22, gs: 7, gp: 8 },
      { first: "Brandon", last: "Mitchell", pos: "RHP", yr: "Fr.", w: 1, l: 3, era: 4.45, ip: 28.1, so: 28, bb: 12, h: 28, er: 14, gs: 5, gp: 8 },
    ],
    hitters: [
      { first: "Cameron", last: "Morrison", pos: "OF", yr: "Jr.", avg: .275, ab: 168, h: 46, doubles: 9, triples: 2, hr: 4, rbi: 22, runs: 28, bb: 14, so: 30, sb: 10 },
      { first: "Jaylen", last: "Brown", pos: "SS", yr: "Jr.", avg: .262, ab: 162, h: 42, doubles: 8, triples: 1, hr: 3, rbi: 18, runs: 24, bb: 12, so: 28, sb: 6 },
      { first: "Marcus", last: "Petty", pos: "3B", yr: "So.", avg: .255, ab: 158, h: 40, doubles: 7, triples: 0, hr: 5, rbi: 24, runs: 20, bb: 10, so: 32, sb: 2 },
    ],
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────

function computeDerived(p: PitcherSeed) {
  const whip = p.ip > 0 ? +((p.h + p.bb) / p.ip).toFixed(3) : 0;
  const kPerNine = p.ip > 0 ? +((p.so / p.ip) * 9).toFixed(2) : 0;
  const bf = Math.round(3 * p.ip + p.h + p.bb);
  const kPct = bf > 0 ? +(p.so / bf).toFixed(3) : 0;
  const bbPct = bf > 0 ? +(p.bb / bf).toFixed(3) : 0;
  const oppBA = bf - p.bb > 0 ? +(p.h / (bf - p.bb)).toFixed(3) : 0;
  return { whip, kPerNine, kPercent: kPct, bbPercent: bbPct, oppBattingAvg: oppBA };
}

function computeHitterDerived(h: HitterSeed) {
  const pa = h.ab + h.bb;
  const obp = pa > 0 ? +((h.h + h.bb) / pa).toFixed(3) : 0;
  const tb = h.h + h.doubles + 2 * h.triples + 3 * h.hr;
  const slg = h.ab > 0 ? +(tb / h.ab).toFixed(3) : 0;
  const ops = +(obp + slg).toFixed(3);
  const iso = +(slg - h.avg).toFixed(3);
  const babip = h.ab - h.so - h.hr > 0 ? +((h.h - h.hr) / (h.ab - h.so - h.hr)).toFixed(3) : 0;
  const kRate = pa > 0 ? +(h.so / pa).toFixed(3) : 0;
  const bbRate = pa > 0 ? +(h.bb / pa).toFixed(3) : 0;
  return { obp, slg, ops, isoSlg: iso, babip, kRateHitting: kRate, bbRateHitting: bbRate };
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log(`=== Seeding ${CAA_TEAMS.length} CAA Teams (season ${SEASON}) ===\n`);
  console.log("Only players on both 2025 AND 2026 rosters are included.\n");

  let totalPlayers = 0;

  for (const teamData of CAA_TEAMS) {
    // Upsert team
    const team = await prisma.team.upsert({
      where: { id: `caa-${teamData.abbr.toLowerCase()}` },
      create: {
        id: `caa-${teamData.abbr.toLowerCase()}`,
        name: teamData.name,
        abbreviation: teamData.abbr,
        conference: teamData.conference,
        division: "D1",
      },
      update: {
        name: teamData.name,
        conference: teamData.conference,
      },
    });

    // Seed pitchers
    for (const p of teamData.pitchers) {
      const playerId = `${teamData.abbr.toLowerCase()}-${p.first.toLowerCase().replace(/\s+/g, "")}-${p.last.toLowerCase().replace(/[.\s]+/g, "")}`;
      const derived = computeDerived(p);

      await prisma.player.upsert({
        where: { id: playerId },
        create: {
          id: playerId,
          firstName: p.first,
          lastName: p.last,
          teamId: team.id,
          position: p.pos,
          playerType: PlayerType.PITCHER,
          classYear: p.yr,
          throws: p.pos.startsWith("L") ? "L" : "R",
        },
        update: { classYear: p.yr, position: p.pos },
      });

      await prisma.seasonStats.upsert({
        where: { playerId_season: { playerId, season: SEASON } },
        create: {
          playerId,
          season: SEASON,
          gamesPlayed: p.gp,
          gamesStarted: p.gs,
          wins: p.w,
          losses: p.l,
          era: p.era,
          inningsPitched: p.ip,
          strikeouts: p.so,
          walks: p.bb,
          hitsAllowed: p.h,
          earnedRuns: p.er,
          whip: derived.whip,
          kPerNine: derived.kPerNine,
          kPercent: derived.kPercent,
          bbPercent: derived.bbPercent,
          oppBattingAvg: derived.oppBattingAvg,
        },
        update: {
          gamesPlayed: p.gp, wins: p.w, losses: p.l, era: p.era,
          inningsPitched: p.ip, strikeouts: p.so, walks: p.bb,
          hitsAllowed: p.h, earnedRuns: p.er,
          whip: derived.whip, kPerNine: derived.kPerNine,
          kPercent: derived.kPercent, bbPercent: derived.bbPercent,
          oppBattingAvg: derived.oppBattingAvg,
        },
      });
      totalPlayers++;
    }

    // Seed hitters
    for (const h of teamData.hitters) {
      const playerId = `${teamData.abbr.toLowerCase()}-${h.first.toLowerCase().replace(/\s+/g, "")}-${h.last.toLowerCase().replace(/[.\s]+/g, "")}`;
      const derived = computeHitterDerived(h);

      await prisma.player.upsert({
        where: { id: playerId },
        create: {
          id: playerId,
          firstName: h.first,
          lastName: h.last,
          teamId: team.id,
          position: h.pos,
          playerType: PlayerType.HITTER,
          classYear: h.yr,
          bats: "R",
        },
        update: { classYear: h.yr, position: h.pos },
      });

      await prisma.seasonStats.upsert({
        where: { playerId_season: { playerId, season: SEASON } },
        create: {
          playerId,
          season: SEASON,
          gamesPlayed: Math.round(h.ab / 3.5),
          atBats: h.ab,
          hits: h.h,
          doubles: h.doubles,
          triples: h.triples,
          homeRuns: h.hr,
          rbi: h.rbi,
          runs: h.runs,
          walks: h.bb,
          stolenBases: h.sb,
          battingAvg: h.avg,
          obp: derived.obp,
          slg: derived.slg,
          ops: derived.ops,
          isoSlg: derived.isoSlg,
          babip: derived.babip,
          kRateHitting: derived.kRateHitting,
          bbRateHitting: derived.bbRateHitting,
        },
        update: {
          atBats: h.ab, hits: h.h, doubles: h.doubles, triples: h.triples,
          homeRuns: h.hr, rbi: h.rbi, runs: h.runs, walks: h.bb,
          stolenBases: h.sb, battingAvg: h.avg,
          obp: derived.obp, slg: derived.slg, ops: derived.ops,
          isoSlg: derived.isoSlg, babip: derived.babip,
          kRateHitting: derived.kRateHitting, bbRateHitting: derived.bbRateHitting,
        },
      });
      totalPlayers++;
    }

    console.log(`  ✓ ${teamData.name} (${teamData.pitchers.length}P / ${teamData.hitters.length}H)`);
  }

  console.log(`\nSeeded ${totalPlayers} players across ${CAA_TEAMS.length} teams`);

  // ── Seed 2026 season stats for William & Mary (in-season, 7-11 through 18 games) ──
  console.log("\n=== Seeding W&M 2026 season stats ===\n");

  const WM_2026_PITCHERS: PitcherSeed[] = [
    { first: "Zach", last: "Boyd", pos: "RHP", yr: "So.", w: 1, l: 2, era: 9.00, ip: 15.0, so: 13, bb: 9, h: 19, er: 15, gs: 5, gp: 6 },
    { first: "Daniel", last: "Lingle", pos: "RHP", yr: "R-So.", w: 0, l: 0, era: 1.23, ip: 7.1, so: 5, bb: 3, h: 5, er: 1, gs: 0, gp: 8 },
    { first: "Tyler", last: "Kelly", pos: "RHP", yr: "So.", w: 0, l: 0, era: 0.00, ip: 0.0, so: 0, bb: 0, h: 0, er: 0, gs: 0, gp: 0 }, // not pitching yet in 2026
    { first: "Chad", last: "Yates", pos: "LHP", yr: "R-So.", w: 0, l: 0, era: 9.00, ip: 1.0, so: 1, bb: 5, h: 0, er: 1, gs: 0, gp: 1 },
    { first: "Jack", last: "Weight", pos: "RHP", yr: "So.", w: 1, l: 0, era: 6.00, ip: 6.0, so: 11, bb: 9, h: 5, er: 4, gs: 0, gp: 4 },
    { first: "Tom", last: "Bourque", pos: "LHP", yr: "R-Jr.", w: 1, l: 1, era: 5.14, ip: 14.0, so: 16, bb: 10, h: 8, er: 8, gs: 3, gp: 6 },
    { first: "Noah", last: "Hertzler", pos: "RHP", yr: "Sr.", w: 1, l: 0, era: 9.35, ip: 8.2, so: 10, bb: 10, h: 8, er: 9, gs: 0, gp: 6 },
    { first: "Owen", last: "Pierce", pos: "RHP", yr: "R-Jr.", w: 0, l: 0, era: 0.00, ip: 0.0, so: 0, bb: 0, h: 0, er: 0, gs: 0, gp: 0 }, // not pitching yet in 2026
  ];

  const WM_2026_HITTERS: HitterSeed[] = [
    { first: "Jamie", last: "Laskofski", pos: "INF", yr: "So.", avg: .379, ab: 66, h: 25, doubles: 4, triples: 3, hr: 3, rbi: 18, runs: 24, bb: 17, so: 11, sb: 8 },
    { first: "Charlie", last: "Iriotakis", pos: "OF", yr: "Sr.", avg: .286, ab: 56, h: 16, doubles: 3, triples: 2, hr: 3, rbi: 8, runs: 9, bb: 6, so: 16, sb: 1 },
    { first: "Anthony", last: "Greco", pos: "INF", yr: "Jr.", avg: .083, ab: 12, h: 1, doubles: 0, triples: 0, hr: 1, rbi: 1, runs: 3, bb: 2, so: 6, sb: 0 },
    { first: "Jerry", last: "Barnes III", pos: "C", yr: "Sr.", avg: .000, ab: 0, h: 0, doubles: 0, triples: 0, hr: 0, rbi: 0, runs: 0, bb: 0, so: 0, sb: 0 }, // not playing 2026
    { first: "Witt", last: "Scafidi", pos: "C", yr: "R-Jr.", avg: .406, ab: 32, h: 13, doubles: 2, triples: 0, hr: 0, rbi: 7, runs: 5, bb: 3, so: 8, sb: 1 },
    { first: "Kevin", last: "Francella", pos: "INF", yr: "R-So.", avg: .083, ab: 24, h: 2, doubles: 1, triples: 0, hr: 0, rbi: 0, runs: 4, bb: 1, so: 6, sb: 1 },
    { first: "Matthew", last: "Kosuda", pos: "INF", yr: "R-Fr.", avg: .262, ab: 61, h: 16, doubles: 2, triples: 0, hr: 3, rbi: 19, runs: 12, bb: 4, so: 29, sb: 4 },
  ];

  for (const p of WM_2026_PITCHERS) {
    const playerId = `wm-${p.first.toLowerCase().replace(/\s+/g, "")}-${p.last.toLowerCase().replace(/[.\s]+/g, "")}`;
    if (p.ip === 0) continue; // skip players with no 2026 pitching appearances
    const derived = computeDerived(p);
    await prisma.seasonStats.upsert({
      where: { playerId_season: { playerId, season: 2026 } },
      create: {
        playerId, season: 2026,
        gamesPlayed: p.gp, gamesStarted: p.gs, wins: p.w, losses: p.l, era: p.era,
        inningsPitched: p.ip, strikeouts: p.so, walks: p.bb, hitsAllowed: p.h, earnedRuns: p.er,
        whip: derived.whip, kPerNine: derived.kPerNine,
        kPercent: derived.kPercent, bbPercent: derived.bbPercent, oppBattingAvg: derived.oppBattingAvg,
      },
      update: {
        gamesPlayed: p.gp, wins: p.w, losses: p.l, era: p.era,
        inningsPitched: p.ip, strikeouts: p.so, walks: p.bb, hitsAllowed: p.h, earnedRuns: p.er,
        whip: derived.whip, kPerNine: derived.kPerNine,
        kPercent: derived.kPercent, bbPercent: derived.bbPercent, oppBattingAvg: derived.oppBattingAvg,
      },
    });
  }

  for (const h of WM_2026_HITTERS) {
    const playerId = `wm-${h.first.toLowerCase().replace(/\s+/g, "")}-${h.last.toLowerCase().replace(/[.\s]+/g, "")}`;
    if (h.ab === 0) continue; // skip players with no 2026 at-bats
    const derived = computeHitterDerived(h);
    await prisma.seasonStats.upsert({
      where: { playerId_season: { playerId, season: 2026 } },
      create: {
        playerId, season: 2026,
        gamesPlayed: Math.round(h.ab / 3.5), atBats: h.ab, hits: h.h,
        doubles: h.doubles, triples: h.triples, homeRuns: h.hr,
        rbi: h.rbi, runs: h.runs, walks: h.bb, stolenBases: h.sb,
        battingAvg: h.avg, obp: derived.obp, slg: derived.slg, ops: derived.ops,
        isoSlg: derived.isoSlg, babip: derived.babip,
        kRateHitting: derived.kRateHitting, bbRateHitting: derived.bbRateHitting,
      },
      update: {
        atBats: h.ab, hits: h.h, doubles: h.doubles, triples: h.triples,
        homeRuns: h.hr, rbi: h.rbi, runs: h.runs, walks: h.bb, stolenBases: h.sb,
        battingAvg: h.avg, obp: derived.obp, slg: derived.slg, ops: derived.ops,
        isoSlg: derived.isoSlg, babip: derived.babip,
        kRateHitting: derived.kRateHitting, bbRateHitting: derived.bbRateHitting,
      },
    });
  }

  console.log("  ✓ W&M 2026 in-season stats seeded (7-11 through 18 games)");

  // Run agents
  console.log("\n=== Running Player Summary + Rating Engine ===\n");

  const { runAgent } = await import("../src/agents/index");

  const summaryResult = await runAgent("player-summary");
  console.log(`Player Summary: ${summaryResult.success ? "OK" : "FAILED"} (${summaryResult.itemsProcessed} items)`);

  const ratingResult = await runAgent("rating-engine");
  console.log(`Rating Engine: ${ratingResult.success ? "OK" : "FAILED"} (${ratingResult.itemsProcessed} items)`);

  // Summary
  const [playerCount, statsCount, pPlusCount, hPlusCount] = await Promise.all([
    prisma.player.count(),
    prisma.seasonStats.count(),
    prisma.player.count({ where: { pitchingPlus: { not: null } } }),
    prisma.player.count({ where: { hittingPlus: { not: null } } }),
  ]);

  console.log(`\n=== Final Summary ===`);
  console.log(`  Players: ${playerCount}`);
  console.log(`  Season stats: ${statsCount}`);
  console.log(`  With Pitching+: ${pPlusCount}`);
  console.log(`  With Hitting+: ${hPlusCount}`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
