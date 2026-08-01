import baseData from "../data/uganda.json";
import type { SearchResult, UgandaData } from "../types";

export const ugBaseData = baseData as UgandaData;

export function cloneData(): UgandaData {
  return structuredClone(ugBaseData);
}

export function getDistricts(data: UgandaData): string[] {
  return data.districts;
}

export function getSubcounties(data: UgandaData, district: string): string[] {
  return data.subcounties[district.toUpperCase()] ?? [];
}

export function getParishes(
  data: UgandaData,
  district: string,
  subcounty: string,
): string[] {
  return data.parishes[`${district.toUpperCase()}||${subcounty.toUpperCase()}`] ?? [];
}

export function getVillages(
  data: UgandaData,
  district: string,
  subcounty: string,
  parish: string,
): string[] {
  return (
    data.villages[
      `${district.toUpperCase()}||${subcounty.toUpperCase()}||${parish.toUpperCase()}`
    ] ?? []
  );
}

export function districtStats(
  data: UgandaData,
  district: string,
): { subcounties: number; parishes: number; villages: number } {
  const subs = getSubcounties(data, district);
  let parishes = 0;
  let villages = 0;
  for (const sc of subs) {
    const ps = getParishes(data, district, sc);
    parishes += ps.length;
    for (const p of ps) villages += getVillages(data, district, sc, p).length;
  }
  return { subcounties: subs.length, parishes, villages };
}

const DISTRICT_ALIASES: Record<string, string> = {
  LUWERO: "LUWEERO",
};

function variantsOf(name: string): string[] {
  const variants = [name];
  for (const [alias, canonical] of Object.entries(DISTRICT_ALIASES)) {
    if (canonical === name) variants.push(alias);
  }
  return variants;
}

function score(name: string, q: string): number {
  if (name === q) return 100;
  if (name.startsWith(q)) return 50;
  if (name.includes(q)) return 10;
  return 0;
}

function bestScore(name: string, q: string): number {
  let best = 0;
  for (const v of variantsOf(name)) best = Math.max(best, score(v, q));
  return best;
}

export interface SearchIndexes {
  subcounty: Map<string, { name: string; district: string }>;
  parish: Map<string, { name: string; district: string; subcounty: string }>;
  village: Map<string, SearchResult>;
}

export function buildSearchIndexes(data: UgandaData): SearchIndexes {
  const subcounty = new Map<string, { name: string; district: string }>();
  for (const [key, list] of Object.entries(data.subcounties)) {
    const d = key.split("||")[0];
    for (const name of list) subcounty.set(`${d}||${name}`, { name, district: d });
  }

  const parish = new Map<string, { name: string; district: string; subcounty: string }>();
  for (const [key, list] of Object.entries(data.parishes)) {
    const [d, sc] = key.split("||");
    for (const name of list) {
      parish.set(`${d}||${sc}||${name}`, { name, district: d, subcounty: sc });
    }
  }

  const village = new Map<string, SearchResult>();
  for (const [key, list] of Object.entries(data.villages)) {
    const [d, sc, p] = key.split("||");
    for (const name of list) {
      village.set(`${d}||${sc}||${p}||${name}`, {
        name,
        level: 4,
        district: d,
        subcounty: sc,
        parish: p,
      });
    }
  }

  return { subcounty, parish, village };
}

interface Scored {
  result: SearchResult;
  score: number;
}

export function search(
  data: UgandaData,
  indexes: SearchIndexes,
  query: string,
  limit = 30,
): SearchResult[] {
  const q = query.trim().toUpperCase();
  if (!q) return [];

  const results: Scored[] = [];

  for (const name of data.districts) {
    const s = bestScore(name, q);
    if (s > 0) results.push({ result: { name, level: 1, district: name }, score: s });
  }

  for (const { name, district } of indexes.subcounty.values()) {
    const s = bestScore(name, q);
    if (s > 0) {
      results.push({ result: { name, level: 2, district, subcounty: name }, score: s });
    }
  }

  for (const { name, district, subcounty } of indexes.parish.values()) {
    const s = bestScore(name, q);
    if (s > 0) {
      results.push({
        result: { name, level: 3, district, subcounty, parish: name },
        score: s,
      });
    }
  }

  let villageHits = 0;
  for (const r of indexes.village.values()) {
    const s = bestScore(r.name, q);
    if (s > 0) {
      if (villageHits++ >= limit * 4) break;
      results.push({ result: r, score: s });
    }
  }

  return results
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.result.level - b.result.level ||
        a.result.name.localeCompare(b.result.name),
    )
    .slice(0, limit)
    .map((s) => s.result);
}
