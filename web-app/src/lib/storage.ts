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
