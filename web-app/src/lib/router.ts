import { useEffect, useState } from "react";
import type { Selection } from "../types";

export type Page = "explorer" | "map";

export interface AppRoute {
  page: Page;
  selection: Selection | null;
}

function decodeSegment(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

function encodeSegment(s: string): string {
  return encodeURIComponent(s);
}

function hashPath(hash: string): string {
  return hash.replace(/^#/, "").trim();
}

export function parseRoute(hash: string): AppRoute {
  const h = hashPath(hash);
  if (h === "" || h === "/") return { page: "explorer", selection: null };
  const parts = h.split("/").filter(Boolean);
  let page: Page = "explorer";
  if (parts[0].toLowerCase() === "map") {
    page = "map";
    parts.shift();
  }
  const levels = parts.map((p) => decodeSegment(p).toUpperCase()).filter(Boolean);
  if (levels.length === 0) return { page, selection: null };
  const selection: Selection = { district: levels[0] };
  if (levels[1]) selection.subcounty = levels[1];
  if (levels[2]) selection.parish = levels[2];
  if (levels[3]) selection.village = levels[3];
  return { page, selection };
}

export function routeToHash(route: AppRoute): string {
  const levels = route.selection
    ? ([
        route.selection.district,
        route.selection.subcounty,
        route.selection.parish,
        route.selection.village,
      ].filter(Boolean) as string[])
    : [];
  const segments = route.page === "map" ? ["map", ...levels] : levels;
  if (segments.length === 0) return "/";
  return `/${segments.map(encodeSegment).join("/")}`;
}

export function currentRoute(): AppRoute {
  return parseRoute(window.location.hash);
}

export function navigate(route: Partial<AppRoute>) {
  const next = { ...currentRoute(), ...route };
  const target = routeToHash(next);
  if (hashPath(window.location.hash) !== hashPath(target)) {
    window.location.hash = target;
  }
}

export function useAppRoute(): AppRoute {
  const [route, setRoute] = useState<AppRoute>(() => currentRoute());

  useEffect(() => {
    const onHash = () => setRoute(currentRoute());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  return route;
}
