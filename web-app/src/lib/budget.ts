import type { UgandaData } from "../types";
import type { UnitPath } from "./admin";

export function unitKey(path: UnitPath): string {
  const parts = [path.district, path.subcounty, path.parish, path.village].filter(Boolean);
  return parts.join("||");
}

export function getBudget(data: UgandaData, path: UnitPath): number {
  const key = unitKey(path);
  if (!key) return 0;
  const value = data.budgetAllocations?.[key];
  return typeof value === "number" && Number.isFinite(value) ? Math.max(0, value) : 0;
}

function sumMatchingChildren(data: UgandaData, path: UnitPath): number {
  const prefix = [path.district, path.subcounty, path.parish, path.village].filter(Boolean);
  const keys = Object.keys(data.budgetAllocations ?? {});
  let total = 0;
  for (const key of keys) {
    const parts = key.split("||");
    if (parts.length <= prefix.length) continue;
    if (parts.slice(0, prefix.length).join("||") !== prefix.join("||")) continue;
    total += getBudget(data, {
      district: parts[0],
      subcounty: parts[1],
      parish: parts[2],
      village: parts[3],
    });
  }
  return total;
}

export function getBudgetSummary(data: UgandaData, path: UnitPath): {
  unitBudget: number;
  childBudget: number;
  remaining: number;
} {
  const unitBudget = getBudget(data, path);
  const childBudget = sumMatchingChildren(data, path);
  return {
    unitBudget,
    childBudget,
    remaining: Math.max(0, unitBudget - childBudget),
  };
}

export function setBudget(data: UgandaData, path: UnitPath, value: number): UgandaData | null {
  const next = structuredClone(data);
  const clean = Number(value);
  if (!Number.isFinite(clean) || clean < 0) return null;
  if (!path.district) return null;
  const key = unitKey(path);
  next.budgetAllocations ??= {};
  next.budgetAllocations[key] = Math.round(clean);
  return next;
}
