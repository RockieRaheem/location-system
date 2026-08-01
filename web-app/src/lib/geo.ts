import type { FeatureCollection, Feature, Geometry } from "geojson";
import rawBoundaries from "../data/ug_districts.geojson?raw";
import rawSubcounties from "../data/ug_subcounties.geojson?raw";

const PARENT_POLYGON: Record<string, string> = {
  "ARUA CITY": "ARUA",
  "FORT PORTAL CITY": "KABAROLE",
  "GULU CITY": "GULU",
  "HOIMA CITY": "HOIMA",
  "JINJA CITY": "JINJA",
  "LIRA CITY": "LIRA",
  "MASAKA CITY": "MASAKA",
  "MBALE CITY": "MBALE",
  "MBARARA CITY": "MBARARA",
  "SOROTI CITY": "SOROTI",
  KALAKI: "KABERAMAIDO",
  KARENGA: "KAABONG",
  KAZO: "KIRUHURA",
  KITAGWENDA: "KAMWENGE",
  OBONGI: "MOYO",
  RWAMPARA: "MBARARA",
  TEREGO: "ARUA",
};

const boundaryData: FeatureCollection = JSON.parse(rawBoundaries) as FeatureCollection;

const districtMap = new Map<string, Feature<Geometry>>();
for (const f of boundaryData.features) {
  const name = f.properties?.district as string | undefined;
  if (name) districtMap.set(name.toUpperCase(), f);
}

export function getDistrictMap(): Map<string, Feature<Geometry>> {
  return districtMap;
}

export function polygonNameFor(
  district: string,
  polygons: Map<string, Feature<Geometry>> = districtMap,
): string | null {
  const d = district.toUpperCase();
  if (polygons.has(d)) return d;
  const parent = PARENT_POLYGON[d];
  if (parent && polygons.has(parent)) return parent;
  const stripped = d.replace(/ CITY$/, "");
  if (polygons.has(stripped)) return stripped;
  return null;
}

const subcountyData: FeatureCollection = JSON.parse(rawSubcounties) as FeatureCollection;

const subcountyMap = new Map<string, Feature<Geometry>>();
for (const f of subcountyData.features) {
  const d = f.properties?.district as string | undefined;
  const sc = f.properties?.subcounty as string | undefined;
  if (d && sc) subcountyMap.set(`${d.toUpperCase()}||${sc.toUpperCase()}`, f);
}

export function getSubcountyMap(): Map<string, Feature<Geometry>> {
  return subcountyMap;
}

function normName(s: string): string {
  return s
    .toUpperCase()
    .replace(/\s+/g, " ")
    .replace(/'/g, "")
    .replace(/_/g, " ")
    .replace(/\s*\/\s*/g, " ")
    .replace(/\s*-\s*/g, " ")
    .replace(/\s*\.\s*/g, " ")
    .replace(/\bTOWN COUNCIL\b/g, "")
    .replace(/\bTOWN\b/g, "")
    .replace(/\bCENTRAL DIVISION\b/g, " CENTRAL")
    .replace(/\b(DIVISION|DIV|TC)\b/g, "")
    .replace(/\bLC\d*\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function subcountyKeyFor(
  district: string,
  subcounty: string,
  polygons: Map<string, Feature<Geometry>> = subcountyMap,
): string | null {
  const d = district.toUpperCase();
  const sc = subcounty.toUpperCase();
  const exact = `${d}||${sc}`;
  if (polygons.has(exact)) return exact;
  const n = normName(subcounty);
  if (n.length < 4) return null;
  const prefix = `${d}||`;
  for (const key of polygons.keys()) {
    if (!key.startsWith(prefix)) continue;
    const m = normName(key.slice(prefix.length));
    if (m.length >= 4 && (m.includes(n) || n.includes(m))) return key;
  }
  return null;
}

export function subcountyPolygonFor(
  district: string,
  subcounty: string,
  polygons: Map<string, Feature<Geometry>> = subcountyMap,
): Feature<Geometry> | null {
  const key = subcountyKeyFor(district, subcounty, polygons);
  return key ? (polygons.get(key) ?? null) : null;
}
