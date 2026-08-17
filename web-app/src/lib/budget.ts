import type { UgandaData } from "../types";
import type { UnitPath } from "./admin";
import { getParishes, getSubcounties, getVillages } from "./uganda";

export interface BudgetBreakdownEntry {
  key: string;
  name: string;
  path: UnitPath;
  budget: number;
}

export interface BudgetBreakdownSummary {
  unitBudget: number;
  childBudget: number;
  remaining: number;
  children: BudgetBreakdownEntry[];
}

export function unitKey(path: UnitPath): string {
  const parts = [path.district, path.subcounty, path.parish, path.village].filter(Boolean);
  return parts.join("||");
}

export function getParentPath(path: UnitPath): UnitPath | null {
  if (path.village && path.parish && path.subcounty && path.district) {
    return { district: path.district, subcounty: path.subcounty, parish: path.parish };
  }
  if (path.parish && path.subcounty && path.district) {
    return { district: path.district, subcounty: path.subcounty };
  }
  if (path.subcounty && path.district) {
    return { district: path.district };
  }
  return null;
}

export function getBudget(data: UgandaData, path: UnitPath): number {
  const key = unitKey(path);
  if (!key) return 0;
  const value = data.budgetAllocations?.[key];
  return typeof value === "number" && Number.isFinite(value) ? Math.max(0, value) : 0;
}

export function getBudgetChildren(data: UgandaData, path: UnitPath): BudgetBreakdownEntry[] {
  if (!path.district) return [];
  const { district, subcounty, parish } = path;

  if (!subcounty) {
    return getSubcounties(data, district).map((name) => {
      const childPath: UnitPath = { district, subcounty: name };
      return {
        key: unitKey(childPath),
        name,
        path: childPath,
        budget: getBudget(data, childPath),
      };
    });
  }

  if (!parish) {
    return getParishes(data, district, subcounty).map((name) => {
      const childPath: UnitPath = { district, subcounty, parish: name };
      return {
        key: unitKey(childPath),
        name,
        path: childPath,
        budget: getBudget(data, childPath),
      };
    });
  }

  return getVillages(data, district, subcounty, parish).map((name) => {
    const childPath: UnitPath = { district, subcounty, parish, village: name };
    return {
      key: unitKey(childPath),
      name,
      path: childPath,
      budget: getBudget(data, childPath),
    };
  });
}

export function getBudgetBreakdown(data: UgandaData, path: UnitPath): BudgetBreakdownSummary {
  const children = getBudgetChildren(data, path);
  const unitBudget = getBudget(data, path);
  const childBudget = children.reduce((total, child) => total + child.budget, 0);
  return {
    unitBudget,
    childBudget,
    remaining: Math.max(0, unitBudget - childBudget),
    children,
  };
}

export function getBudgetSummary(data: UgandaData, path: UnitPath): BudgetBreakdownSummary {
  return getBudgetBreakdown(data, path);
}

export function validateBudgetAllocation(data: UgandaData, path: UnitPath, value: number): string | null {
  const clean = Number(value);
  if (!path.district || !Number.isFinite(clean) || clean < 0) {
    return "Budget must be a valid non-negative amount.";
  }

  const children = getBudgetChildren(data, path);
  const childBudget = children.reduce((total, child) => total + child.budget, 0);
  if (children.length > 0 && clean < childBudget) {
    return `This allocation is below the combined child budget of UGX ${childBudget.toLocaleString()}. Increase it before saving.`;
  }

  const parentPath = getParentPath(path);
  if (parentPath) {
    const parentBudget = getBudget(data, parentPath);
    const siblings = getBudgetChildren(data, parentPath).filter((child) => child.key !== unitKey(path));
    const proposedParentTotal = siblings.reduce((total, child) => total + child.budget, 0) + clean;
    if (proposedParentTotal > parentBudget) {
      return `This budget would exceed the parent allocation of UGX ${parentBudget.toLocaleString()}.`;
    }
  }

  return null;
}

export function setBudget(data: UgandaData, path: UnitPath, value: number): UgandaData | null {
  const message = validateBudgetAllocation(data, path, value);
  if (message) return null;

  const next = structuredClone(data);
  if (!path.district) return null;
  const key = unitKey(path);
  next.budgetAllocations ??= {};
  next.budgetAllocations[key] = Math.round(Number(value));
  return next;
}
