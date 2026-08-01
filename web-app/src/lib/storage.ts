import { recomputeCounts } from "./admin";
import type { UgandaData } from "../types";

const SNAPSHOT_KEY = "ug-admin-data-v1";

export function loadSnapshot(): UgandaData | null {
  try {
    const raw = localStorage.getItem(SNAPSHOT_KEY);
    return raw ? (JSON.parse(raw) as UgandaData) : null;
  } catch {
    return null;
  }
}

export function saveSnapshot(data: UgandaData): void {
  try {
    localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(data));
  } catch {
    // storage full or unavailable; edits still work for the session
  }
}

export function clearSnapshot(): void {
  try {
    localStorage.removeItem(SNAPSHOT_KEY);
  } catch {
    // ignore
  }
}

export function downloadData(data: UgandaData, filename = "uganda-admin.json"): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function parseImportedData(raw: string): UgandaData {
  let obj: unknown;
  try {
    obj = JSON.parse(raw);
  } catch {
    throw new Error("The file is not valid JSON.");
  }
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) {
    throw new Error("The file must contain a single data object.");
  }
  const d = obj as Record<string, unknown>;
  if (!Array.isArray(d.districts) || d.districts.some((x) => typeof x !== "string")) {
    throw new Error("Missing a valid `districts` array of names.");
  }
  for (const key of ["subcounties", "parishes", "villages"] as const) {
    const rec = d[key];
    if (!rec || typeof rec !== "object" || Array.isArray(rec)) {
      throw new Error(`Missing a valid \`${key}\` object.`);
    }
    for (const list of Object.values(rec as Record<string, unknown>)) {
      if (!Array.isArray(list) || list.some((x) => typeof x !== "string")) {
        throw new Error(`\`${key}\` must map to arrays of unit names.`);
      }
    }
  }
  const meta = (d.meta ?? {}) as Record<string, unknown>;
  const imported: UgandaData = {
    meta: {
      country: typeof meta.country === "string" ? meta.country : "ug",
      year: typeof meta.year === "number" ? meta.year : 2022,
      source: typeof meta.source === "string" ? meta.source : "Imported by admin",
      counts: { districts: 0, subcounties: 0, parishes: 0, villages: 0 },
    },
    districts: d.districts as string[],
    subcounties: d.subcounties as Record<string, string[]>,
    parishes: d.parishes as Record<string, string[]>,
    villages: d.villages as Record<string, string[]>,
  };
  recomputeCounts(imported);
  return imported;
}
