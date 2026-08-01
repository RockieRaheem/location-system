import data from "../data/uganda.json";
import type { SearchResult, UgandaData } from "../types";

export const ugData = data as UgandaData;

export function getDistricts(): string[] {
  return ugData.districts;
}

export function getSubcounties(district: string): string[] {
  return ugData.subcounties[district.toUpperCase()] ?? [];
}

export function getParishes(district: string, subcounty: string): string[] {
  return ugData.parishes[`${district.toUpperCase()}||${subcounty.toUpperCase()}`] ?? [];
}

export function getVillages(district: string, subcounty: string, parish: string): string[] {
  return (
    ugData.villages[
      `${district.toUpperCase()}||${subcounty.toUpperCase()}||${parish.toUpperCase()}`
    ] ?? []
  );
}

export function districtStats(district: string): {
  subcounties: number;
  parishes: number;
  villages: number;
} {
  const subs = getSubcounties(district);
  let parishes = 0;
  let villages = 0;
  for (const sc of subs) {
    const ps = getParishes(district, sc);
    parishes += ps.length;
    for (const p of ps) villages += getVillages(district, sc, p).length;
  }
  return { subcounties: subs.length, parishes, villages };
}

function score(name: string, q: string): number {
  if (name === q) return 100;
  if (name.startsWith(q)) return 50;
  if (name.includes(q)) return 10;
  return 0;
}

const subcountyIndex = new Map<string, { name: string; district: string }>();
for (const [key, list] of Object.entries(ugData.subcounties)) {
  const d = key.split("||")[0];
  for (const name of list) subcountyIndex.set(`${d}||${name}`, { name, district: d });
}

const parishIndex = new Map<string, { name: string; district: string; subcounty: string }>();
for (const [key, list] of Object.entries(ugData.parishes)) {
  const [d, sc] = key.split("||");
  for (const name of list) parishIndex.set(`${d}||${sc}||${name}`, { name, district: d, subcounty: sc });
}

const villageIndex = new Map<string, SearchResult>();
for (const [key, list] of Object.entries(ugData.villages)) {
  const [d, sc, p] = key.split("||");
  for (const name of list) {
    villageIndex.set(`${d}||${sc}||${p}||${name}`, {
      name,
      level: 4,
      district: d,
      subcounty: sc,
      parish: p,
    });
  }
}

interface Scored {
  result: SearchResult;
  score: number;
}

export function search(query: string, limit = 30): SearchResult[] {
  const q = query.trim().toUpperCase();
  if (!q) return [];

  const results: Scored[] = [];

  for (const name of ugData.districts) {
    const s = score(name, q);
    if (s > 0) results.push({ result: { name, level: 1, district: name }, score: s });
  }

  for (const { name, district } of subcountyIndex.values()) {
    const s = score(name, q);
    if (s > 0) {
      results.push({ result: { name, level: 2, district, subcounty: name }, score: s });
    }
  }

  for (const { name, district, subcounty } of parishIndex.values()) {
    const s = score(name, q);
    if (s > 0) {
      results.push({
        result: { name, level: 3, district, subcounty, parish: name },
        score: s,
      });
    }
  }

  let villageHits = 0;
  for (const r of villageIndex.values()) {
    const s = score(r.name, q);
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
