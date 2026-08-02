import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = join(__dirname, "..", "src", "data");
const RAW_DIR = join(SRC, "raw", "ug_osm_places");

const OVERPASS = "https://overpass-api.de/api/interpreter";
const PLACE_RE = "^(village|hamlet|town|city|suburb)$";
const SOUTH = -1.5;
const WEST = 29.5;
const NORTH = 4.2;
const EAST = 35.0;
const STEP = 1.0;

const OSM_META = {
  source: "OpenStreetMap place nodes (village, hamlet, town, city, suburb) via Overpass API",
  license: "ODbL (OpenStreetMap contributors)",
};

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchCell(lat0, lon0, tries = 8) {
  const bbox = `${lat0.toFixed(1)},${lon0.toFixed(1)},${(lat0 + STEP).toFixed(1)},${(lon0 + STEP).toFixed(1)}`;
  const query = `[out:json][timeout:120]; node["place"~"${PLACE_RE}"](${bbox}); out body;`;
  let lastErr;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(OVERPASS, {
        method: "POST",
        body: query,
        headers: { "Content-Type": "text/plain", "User-Agent": "location-system-dev/2.0 (admin build tool)" },
      });
      if (res.ok) {
        const json = await res.json();
        return json.elements ?? [];
      }
      lastErr = new Error(`Overpass status ${res.status}`);
    } catch (err) {
      lastErr = err;
    }
    await sleep(4000 * (i + 1));
  }
  throw lastErr ?? new Error(`Failed to fetch cell ${lat0},${lon0}`);
}

async function ensureRawVillages() {
  mkdirSync(RAW_DIR, { recursive: true });
  const cells = [];
  for (let lat = SOUTH; lat < NORTH; lat += STEP) {
    for (let lon = WEST; lon < EAST; lon += STEP) {
      cells.push([lat, lon]);
    }
  }
  const all = [];
  for (const [lat, lon] of cells) {
    const file = join(RAW_DIR, `${lat.toFixed(1)}_${lon.toFixed(1)}.json`);
    if (existsSync(file)) {
      const cached = JSON.parse(readFileSync(file, "utf8"));
      all.push(...cached);
      continue;
    }
    const elements = await fetchCell(lat, lon);
    writeFileSync(file, JSON.stringify(elements));
    all.push(...elements);
    console.log(
      `cell ${lat.toFixed(1)},${lon.toFixed(1)}: ${elements.length} places (${all.length} total)`,
    );
    await sleep(5000);
  }
  return all;
}

function norm(s) {
  return (s ?? "")
    .toUpperCase()
    .replace(/\s+/g, " ")
    .replace(/[^A-Z0-9 ]/g, "")
    .replace(/\b(VILLAGE|TOWN COUNCIL|TOWN|TC|CELL|CENTRE|CENTER|WARD|LC\d*|P\b)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function pointInRing(ring, x, y) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function pointInPolygon(geom, x, y) {
  if (geom.type === "Polygon") return pointInPolygonCoords(geom.coordinates, x, y);
  if (geom.type === "MultiPolygon") return geom.coordinates.some((p) => pointInPolygonCoords(p, x, y));
  return false;
}

function pointInPolygonCoords(poly, x, y) {
  if (!pointInRing(poly[0], x, y)) return false;
  for (let i = 1; i < poly.length; i++) if (pointInRing(poly[i], x, y)) return false;
  return true;
}

function featureBbox(f) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  const walk = (cs) => {
    for (const c of cs) {
      if (typeof c[0] === "number") {
        if (c[0] < minX) minX = c[0];
        if (c[0] > maxX) maxX = c[0];
        if (c[1] < minY) minY = c[1];
        if (c[1] > maxY) maxY = c[1];
      } else walk(c);
    }
  };
  walk(f.geometry.coordinates);
  return [minX, minY, maxX, maxY];
}

function inBBox(bb, x, y) {
  return x >= bb[0] && x <= bb[2] && y >= bb[1] && y <= bb[3];
}

function matchVillage(ecMap, osmNorm) {
  if (!osmNorm) return null;
  const exact = ecMap.get(osmNorm);
  if (exact) return exact;
  if (osmNorm.length >= 4) {
    for (const [k, v] of ecMap) {
      if (k.length >= 4 && (k.includes(osmNorm) || osmNorm.includes(k))) return v;
    }
  }
  return null;
}

function buildVillages(raw) {
  const units = JSON.parse(
    readFileSync(join(SRC, "uganda.json"), "utf8"),
  );
  const subFeats = JSON.parse(readFileSync(join(SRC, "ug_subcounties.geojson"), "utf8")).features.map(
    (f) => ({ f, bb: featureBbox(f) }),
  );
  const distFeats = JSON.parse(readFileSync(join(SRC, "ug_districts.geojson"), "utf8")).features.map(
    (f) => ({ f, bb: featureBbox(f) }),
  );

  const ecBySubcounty = new Map();
  for (const [key, list] of Object.entries(units.villages ?? {})) {
    const [d, sc, p] = key.split("||");
    let m = ecBySubcounty.get(`${d}||${sc}`);
    if (!m) {
      m = new Map();
      ecBySubcounty.set(`${d}||${sc}`, m);
    }
    for (const v of list) {
      const nv = norm(v);
      if (nv && !m.has(nv)) m.set(nv, { parish: p, village: v });
    }
  }

  const seen = new Set();
  const features = [];
  let noName = 0;
  let outside = 0;
  let matched = 0;

  for (const el of raw) {
    if (el.type !== "node" || !el.tags) continue;
    const name = (el.tags.name ?? "").trim();
    const place = (el.tags.place ?? "").trim();
    if (!name || !place || seen.has(el.id)) continue;
    seen.add(el.id);
    const x = el.lon;
    const y = el.lat;

    let subFeature = null;
    for (const { f, bb } of subFeats) {
      if (inBBox(bb, x, y) && pointInPolygon(f.geometry, x, y)) {
        subFeature = f;
        break;
      }
    }
    if (subFeature) {
      const d = subFeature.properties.district;
      const s = subFeature.properties.subcounty;
      const ec = ecBySubcounty.get(`${d}||${s}`);
      const m = ec ? matchVillage(ec, norm(name)) : null;
      if (m) matched++;
      features.push({
        type: "Feature",
        properties: {
          n: name,
          p: place,
          d,
          s,
          v: m?.village ?? null,
          r: m?.parish ?? null,
        },
        geometry: { type: "Point", coordinates: [x, y] },
      });
      continue;
    }

    let distFeature = null;
    for (const { f, bb } of distFeats) {
      if (inBBox(bb, x, y) && pointInPolygon(f.geometry, x, y)) {
        distFeature = f;
        break;
      }
    }
    if (distFeature) {
      features.push({
        type: "Feature",
        properties: {
          n: name,
          p: place,
          d: distFeature.properties.district,
          s: null,
          v: null,
          r: null,
        },
        geometry: { type: "Point", coordinates: [x, y] },
      });
      continue;
    }

    if (!name) noName++;
    else outside++;
  }

  features.sort((a, b) => {
    const k = (f) => `${f.properties.d ?? ""}||${f.properties.s ?? ""}||${f.properties.n}`;
    return k(a) < k(b) ? -1 : 1;
  });

  const out = {
    type: "FeatureCollection",
    features,
    _meta: {
      count: features.length,
      matchedToEC: matched,
      ...OSM_META,
    },
  };

  const json = JSON.stringify(out);
  writeFileSync(join(SRC, "ug_villages.geojson"), json);
  console.log(`ug_villages.geojson written: ${features.length} points, ${(Buffer.byteLength(json) / 1e6).toFixed(1)} MB`);
  console.log(
    `points matched to an EC village: ${matched} (${(100 * matched) / Math.max(1, features.length)}%), outside EC geometry: ${outside}, unnamed: ${noName}`,
  );
  return { total: features.length, matched, outside };
}

async function main() {
  const raw = await ensureRawVillages();
  console.log(`Fetched ${raw.length} OSM place nodes`);
  buildVillages(raw);
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
