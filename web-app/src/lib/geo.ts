import type { FeatureCollection, Feature, Geometry } from "geojson";
import rawBoundaries from "../data/ug_districts.geojson?raw";

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
