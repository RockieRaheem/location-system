import type { FeatureCollection, Point } from "geojson";

export interface VillagePoint {
  lon: number;
  lat: number;
  name: string;
  place: string;
  district: string;
  subcounty: string | null;
  parish: string | null;
  village: string | null;
}

export interface NearestResult {
  point: VillagePoint;
  distanceKm: number;
}

interface VillageFeatureProps {
  n: string;
  p: string;
  d: string;
  s?: string;
  v?: string;
  r?: string;
}

const NEAR_RADIUS_KM = 3;

let loadPromise: Promise<VillagePoint[]> | null = null;

async function loadRaw(): Promise<VillagePoint[]> {
  const response = await fetch("/data/ug_villages.geojson");
  if (!response.ok) throw new Error(`Village data request failed with status ${response.status}.`);
  const fc = (await response.json()) as FeatureCollection<Point, VillageFeatureProps>;
  const out: VillagePoint[] = [];
  for (const f of fc.features) {
    const pr = f.properties;
    out.push({
      lon: f.geometry.coordinates[0],
      lat: f.geometry.coordinates[1],
      name: pr.n,
      place: pr.p,
      district: pr.d,
      subcounty: pr.s || null,
      parish: pr.r || null,
      village: pr.v || null,
    });
  }
  return out;
}

export function loadVillagePoints(): Promise<VillagePoint[]> {
  loadPromise ??= loadRaw();
  return loadPromise;
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function nearestVillage(
  points: VillagePoint[],
  lon: number,
  lat: number,
  maxKm: number = NEAR_RADIUS_KM,
): NearestResult | null {
  let best: NearestResult | null = null;
  for (const q of points) {
    const d = haversineKm(lat, lon, q.lat, q.lon);
    if (d <= maxKm && (!best || d < best.distanceKm)) best = { point: q, distanceKm: d };
  }
  return best;
}
