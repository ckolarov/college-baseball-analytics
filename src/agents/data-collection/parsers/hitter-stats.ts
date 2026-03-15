import type { RawPlayerStats } from "../scrapers/ncaa-stats";

export interface ParsedHitterStats {
  firstName: string;
  lastName: string;
  position: string;
  classYear: string;
  gamesPlayed: number | null;
  gamesStarted: number | null;
  atBats: number | null;
  hits: number | null;
  doubles: number | null;
  triples: number | null;
  homeRuns: number | null;
  rbi: number | null;
  runs: number | null;
  stolenBases: number | null;
  battingAvg: number | null;
  obp: number | null;
  slg: number | null;
  ops: number | null;
  // Derived stats
  kRateHitting: number | null;
  bbRateHitting: number | null;
  babip: number | null;
  isoSlg: number | null;
}

export function parseHitterStats(raw: RawPlayerStats): ParsedHitterStats {
  const ab = parseInt(raw.atBats || "") || null;
  const h = parseInt(raw.hits || "") || null;
  const doubles = parseInt(raw.doubles || "") || null;
  const triples = parseInt(raw.triples || "") || null;
  const hr = parseInt(raw.homeRuns || "") || null;
  const bb = parseInt(raw.walks || "") || null;

  // Parse or calculate batting avg
  let battingAvg = parseFloat(raw.battingAvg || "") || null;
  if (battingAvg === null && ab && ab > 0 && h !== null) {
    battingAvg = h / ab;
  }

  // Parse or calculate SLG
  let slg = parseFloat(raw.slg || "") || null;
  if (slg === null && ab && ab > 0) {
    const singles = (h || 0) - (doubles || 0) - (triples || 0) - (hr || 0);
    const totalBases =
      singles + (doubles || 0) * 2 + (triples || 0) * 3 + (hr || 0) * 4;
    slg = totalBases / ab;
  }

  // Parse or calculate OBP (simplified — without HBP/SF)
  let obp = parseFloat(raw.obp || "") || null;
  if (obp === null && ab && ab > 0 && h !== null) {
    const plateAppearances = ab + (bb || 0);
    if (plateAppearances > 0) {
      obp = ((h || 0) + (bb || 0)) / plateAppearances;
    }
  }

  // OPS
  let ops = parseFloat(raw.ops || "") || null;
  if (ops === null && obp !== null && slg !== null) {
    ops = obp + slg;
  }

  // ISO (Isolated Power) = SLG - BA
  const isoSlg =
    slg !== null && battingAvg !== null ? slg - battingAvg : null;

  // K rate and BB rate (need PA)
  const pa = ab ? ab + (bb || 0) : null;
  const strikeouts = parseInt(raw.strikeouts || "") || null;
  const kRateHitting =
    pa && pa > 0 && strikeouts !== null ? strikeouts / pa : null;
  const bbRateHitting =
    pa && pa > 0 && bb !== null ? bb / pa : null;

  // BABIP = (H - HR) / (AB - K - HR + SF)
  // Simplified without SF: (H - HR) / (AB - K - HR)
  let babip: number | null = null;
  if (h !== null && hr !== null && ab !== null && strikeouts !== null) {
    const denom = ab - strikeouts - hr;
    if (denom > 0) {
      babip = (h - hr) / denom;
    }
  }

  return {
    firstName: raw.firstName,
    lastName: raw.lastName,
    position: raw.position || "UT",
    classYear: raw.classYear || "",
    gamesPlayed: parseInt(raw.gamesPlayed || "") || null,
    gamesStarted: parseInt(raw.gamesStarted || "") || null,
    atBats: ab,
    hits: h,
    doubles,
    triples,
    homeRuns: hr,
    rbi: parseInt(raw.rbi || "") || null,
    runs: parseInt(raw.runs || "") || null,
    stolenBases: parseInt(raw.stolenBases || "") || null,
    battingAvg: round3(battingAvg),
    obp: round3(obp),
    slg: round3(slg),
    ops: round3(ops),
    kRateHitting: round3(kRateHitting),
    bbRateHitting: round3(bbRateHitting),
    babip: round3(babip),
    isoSlg: round3(isoSlg),
  };
}

function round3(val: number | null): number | null {
  return val !== null ? Math.round(val * 1000) / 1000 : null;
}
