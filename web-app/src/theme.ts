import type { FlagColors } from "./types";

export interface Theme {
  primary: string;
  secondary: string;
  accent: string;
  primarySoft: string;
  secondarySoft: string;
  accentSoft: string;
  text: string;
  textMuted: string;
  bg: string;
  surface: string;
  border: string;
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const n = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const v = parseInt(n, 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}

function blend(hex: string, target: string, t: number): string {
  const a = hexToRgb(hex);
  const b = hexToRgb(target);
  const c = a.map((x, i) => Math.round(x + (b[i] - x) * t));
  return `#${c.map((x) => x.toString(16).padStart(2, "0")).join("")}`;
}

export function themeFromFlag(flag: FlagColors): Theme {
  return {
    primary: flag.primary,
    secondary: flag.secondary,
    accent: flag.accent,
    primarySoft: blend(flag.primary, "#ffffff", 0.92),
    secondarySoft: blend(flag.secondary, "#ffffff", 0.78),
    accentSoft: blend(flag.accent, "#ffffff", 0.88),
    text: "#111827",
    textMuted: "#6b7280",
    bg: "#f7f7f5",
    surface: "#ffffff",
    border: "#e5e5e0",
  };
}
