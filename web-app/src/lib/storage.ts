import { recomputeCounts } from "./admin";
import { validateData } from "./validate";
import type { UgandaData } from "../types";

const SNAPSHOT_KEY = "ug-admin-data-v2";
const LEGACY_KEY = "ug-admin-data-v1";
const CORRUPT_KEY = "ug-admin-data-corrupt";
const SCHEMA_VERSION = 2;

function readRaw(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeRaw(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function removeKey(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

function backupCorrupt(raw: string): void {
  writeRaw(CORRUPT_KEY, raw);
}

export function loadSnapshot(): UgandaData | null {
  const current = readRaw(SNAPSHOT_KEY);
  if (current) {
    try {
      const parsed = JSON.parse(current) as { version?: number; data?: unknown };
      const data = parsed?.version === SCHEMA_VERSION ? parsed.data : parsed;
      const res = validateData(data);
      if (res.valid) return data as UgandaData;
      backupCorrupt(current);
      removeKey(SNAPSHOT_KEY);
    } catch {
      backupCorrupt(current);
      removeKey(SNAPSHOT_KEY);
    }
  }

  const legacy = readRaw(LEGACY_KEY);
  if (legacy) {
    try {
      const data = JSON.parse(legacy) as unknown;
      const res = validateData(data);
      if (res.valid) {
        saveSnapshot(data as UgandaData);
        removeKey(LEGACY_KEY);
        return data as UgandaData;
      }
      backupCorrupt(legacy);
      removeKey(LEGACY_KEY);
    } catch {
      backupCorrupt(legacy);
      removeKey(LEGACY_KEY);
    }
  }

  return null;
}

export function saveSnapshot(data: UgandaData): void {
  writeRaw(
    SNAPSHOT_KEY,
    JSON.stringify({ version: SCHEMA_VERSION, savedAt: new Date().toISOString(), data }),
  );
}

export function clearSnapshot(): void {
  removeKey(SNAPSHOT_KEY);
}

export function clearAllStorage(): void {
  removeKey(SNAPSHOT_KEY);
  removeKey(LEGACY_KEY);
  removeKey(CORRUPT_KEY);
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
  if (obj && typeof obj === "object" && !Array.isArray(obj) && "version" in (obj as object)) {
    obj = (obj as { data?: unknown }).data;
  }
  const res = validateData(obj);
  if (!res.valid) {
    const shown = res.problems.slice(0, 3).join(" · ");
    throw new Error(`The file is not valid admin data: ${shown}${res.problems.length > 3 ? " …" : ""}`);
  }

  const d = obj as UgandaData;
  const imported: UgandaData = {
    meta: {
      country: typeof d.meta?.country === "string" ? d.meta.country : "ug",
      year: typeof d.meta?.year === "number" ? d.meta.year : 2022,
      source: typeof d.meta?.source === "string" ? d.meta.source : "Imported by admin",
      counts: { districts: 0, subcounties: 0, parishes: 0, villages: 0 },
    },
    districts: d.districts,
    subcounties: d.subcounties,
    parishes: d.parishes,
    villages: d.villages,
  };
  recomputeCounts(imported);
  return imported;
}
