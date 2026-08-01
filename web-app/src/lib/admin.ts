import type { UgandaData } from "../types";

export interface UnitPath {
  district: string;
  subcounty?: string;
  parish?: string;
  village?: string;
}

function sortedUnique(arr: string[]): string[] {
  return [...new Set(arr.map((s) => s.trim().toUpperCase()).filter(Boolean))].sort();
}

function remapKeys(map: Record<string, string[]>, fn: (key: string) => string | null): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(map)) {
    const next = fn(key);
    if (next != null) out[next] = value;
  }
  return out;
}

export function recomputeCounts(data: UgandaData): void {
  data.meta.counts = {
    districts: data.districts.length,
    subcounties: Object.values(data.subcounties).reduce((n, l) => n + l.length, 0),
    parishes: Object.values(data.parishes).reduce((n, l) => n + l.length, 0),
    villages: Object.values(data.villages).reduce((n, l) => n + l.length, 0),
  };
}

export function addDistrict(data: UgandaData, name: string): UgandaData {
  const n = name.trim().toUpperCase();
  if (!n) return data;
  if (data.districts.includes(n)) return data;
  const next = structuredClone(data);
  next.districts = sortedUnique([...next.districts, n]);
  next.subcounties[n] = next.subcounties[n] ?? [];
  recomputeCounts(next);
  return next;
}

export function addSubcounty(data: UgandaData, district: string, name: string): UgandaData {
  const d = district.toUpperCase();
  const n = name.trim().toUpperCase();
  if (!n) return data;
  const next = structuredClone(data);
  next.subcounties[d] = sortedUnique([...(next.subcounties[d] ?? []), n]);
  recomputeCounts(next);
  return next;
}

export function addParish(data: UgandaData, district: string, subcounty: string, name: string): UgandaData {
  const d = district.toUpperCase();
  const sc = subcounty.toUpperCase();
  const n = name.trim().toUpperCase();
  if (!n) return data;
  const next = structuredClone(data);
  const key = `${d}||${sc}`;
  next.parishes[key] = sortedUnique([...(next.parishes[key] ?? []), n]);
  recomputeCounts(next);
  return next;
}

export function addVillage(
  data: UgandaData,
  district: string,
  subcounty: string,
  parish: string,
  name: string,
): UgandaData {
  const d = district.toUpperCase();
  const sc = subcounty.toUpperCase();
  const p = parish.toUpperCase();
  const n = name.trim().toUpperCase();
  if (!n) return data;
  const next = structuredClone(data);
  const key = `${d}||${sc}||${p}`;
  next.villages[key] = sortedUnique([...(next.villages[key] ?? []), n]);
  recomputeCounts(next);
  return next;
}

export function renameDistrict(data: UgandaData, oldName: string, newName: string): UgandaData {
  const old = oldName.toUpperCase();
  const n = newName.trim().toUpperCase();
  if (!n || old === n) return data;
  const next = structuredClone(data);
  next.districts = next.districts.map((x) => (x === old ? n : x));
  next.subcounties = remapKeys(next.subcounties, (k) => (k === old ? n : k));
  next.parishes = remapKeys(next.parishes, (k) => {
    const [d, sc] = k.split("||");
    return d === old ? `${n}||${sc}` : k;
  });
  next.villages = remapKeys(next.villages, (k) => {
    const [d, sc, p] = k.split("||");
    return d === old ? `${n}||${sc}||${p}` : k;
  });
  recomputeCounts(next);
  return next;
}

export function renameSubcounty(
  data: UgandaData,
  district: string,
  oldName: string,
  newName: string,
): UgandaData {
  const d = district.toUpperCase();
  const old = oldName.toUpperCase();
  const n = newName.trim().toUpperCase();
  if (!n || old === n) return data;
  const next = structuredClone(data);
  next.subcounties[d] = next.subcounties[d].map((x) => (x === old ? n : x));
  next.parishes = remapKeys(next.parishes, (k) => {
    const [dd, sc] = k.split("||");
    return dd === d && sc === old ? `${d}||${n}` : k;
  });
  next.villages = remapKeys(next.villages, (k) => {
    const [dd, sc, p] = k.split("||");
    return dd === d && sc === old ? `${d}||${n}||${p}` : k;
  });
  recomputeCounts(next);
  return next;
}

export function renameParish(
  data: UgandaData,
  district: string,
  subcounty: string,
  oldName: string,
  newName: string,
): UgandaData {
  const d = district.toUpperCase();
  const sc = subcounty.toUpperCase();
  const old = oldName.toUpperCase();
  const n = newName.trim().toUpperCase();
  if (!n || old === n) return data;
  const next = structuredClone(data);
  const key = `${d}||${sc}`;
  next.parishes[key] = next.parishes[key].map((x) => (x === old ? n : x));
  next.villages = remapKeys(next.villages, (k) => {
    const [dd, scc, p] = k.split("||");
    return dd === d && scc === sc && p === old ? `${d}||${sc}||${n}` : k;
  });
  recomputeCounts(next);
  return next;
}

export function renameVillage(
  data: UgandaData,
  district: string,
  subcounty: string,
  parish: string,
  oldName: string,
  newName: string,
): UgandaData {
  const key = `${district.toUpperCase()}||${subcounty.toUpperCase()}||${parish.toUpperCase()}`;
  const old = oldName.toUpperCase();
  const n = newName.trim().toUpperCase();
  if (!n || old === n) return data;
  const next = structuredClone(data);
  next.villages[key] = next.villages[key].map((x) => (x === old ? n : x));
  recomputeCounts(next);
  return next;
}

export function deleteDistrict(data: UgandaData, district: string): UgandaData {
  const d = district.toUpperCase();
  const next = structuredClone(data);
  next.districts = next.districts.filter((x) => x !== d);
  delete next.subcounties[d];
  next.parishes = remapKeys(next.parishes, (k) => (k.startsWith(`${d}||`) ? null : k));
  next.villages = remapKeys(next.villages, (k) => (k.startsWith(`${d}||`) ? null : k));
  recomputeCounts(next);
  return next;
}

export function deleteSubcounty(data: UgandaData, district: string, subcounty: string): UgandaData {
  const d = district.toUpperCase();
  const sc = subcounty.toUpperCase();
  const next = structuredClone(data);
  next.subcounties[d] = (next.subcounties[d] ?? []).filter((x) => x !== sc);
  delete next.parishes[`${d}||${sc}`];
  next.villages = remapKeys(next.villages, (k) => (k.startsWith(`${d}||${sc}||`) ? null : k));
  recomputeCounts(next);
  return next;
}

export function deleteParish(
  data: UgandaData,
  district: string,
  subcounty: string,
  parish: string,
): UgandaData {
  const d = district.toUpperCase();
  const sc = subcounty.toUpperCase();
  const p = parish.toUpperCase();
  const next = structuredClone(data);
  const key = `${d}||${sc}`;
  next.parishes[key] = (next.parishes[key] ?? []).filter((x) => x !== p);
  delete next.villages[`${d}||${sc}||${p}`];
  recomputeCounts(next);
  return next;
}

export function deleteVillage(
  data: UgandaData,
  district: string,
  subcounty: string,
  parish: string,
  village: string,
): UgandaData {
  const key = `${district.toUpperCase()}||${subcounty.toUpperCase()}||${parish.toUpperCase()}`;
  const v = village.toUpperCase();
  const next = structuredClone(data);
  next.villages[key] = (next.villages[key] ?? []).filter((x) => x !== v);
  recomputeCounts(next);
  return next;
}
