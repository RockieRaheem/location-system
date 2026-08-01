import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { simplify } from "@turf/simplify";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = join(__dirname, "..", "src", "data");

const RAW_GEO_URL =
  "https://raw.githubusercontent.com/Geradav/Uganda-GIS/master/Districts_UG.geojson";
const RAW_GEO_FILE = join(SRC, "ug_districts_raw.geojson");

const ALIASES = {
  KASANDA: "KASSANDA",
  LUWERO: "LUWEERO",
};

function normDistrict(name) {
  return name
    .trim()
    .toUpperCase()
    .replace(/\s+/g, " ");
}

function polyToEcoDistrict(name) {
  const s = normDistrict(name);
  return ALIASES[s] ?? s;
}

async function fetchWithRetry(url, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      return await fetch(url);
    } catch (err) {
      if (i === tries - 1) throw err;
      await new Promise((r) => setTimeout(r, 1500));
    }
  }
}

async function ensureRawBoundary() {
  if (existsSync(RAW_GEO_FILE)) return;
  console.log(`Downloading district boundaries from ${RAW_GEO_URL} ...`);
  const res = await fetchWithRetry(RAW_GEO_URL);
  if (!res.ok) throw new Error(`Failed to download boundaries: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(RAW_GEO_FILE, buf);
  console.log(`Saved raw boundaries (${(buf.length / 1e6).toFixed(1)} MB)`);
}

function buildUnits() {
  const sourcePath = join(
    __dirname,
    "..",
    "..",
    "ug-locations-master",
    "ug-locations-master",
    "src",
    "data-optimized.json",
  );
  const raw = JSON.parse(readFileSync(sourcePath, "utf8"));

  const districts = [...new Set(raw.districts.map(normDistrict))].sort();

  const subcounties = {};
  const parishes = {};
  const villages = {};

  for (const [key, sc] of Object.entries(raw.bySubcounty ?? {})) {
    const [dRaw, scRaw] = key.split("||");
    const d = normDistrict(dRaw);
    const scName = scRaw.trim().toUpperCase();
    (subcounties[d] ??= new Set()).add(scName);
    const pk = `${d}||${scName}`;
    for (const p of sc.data ?? []) {
      (parishes[pk] ??= new Set()).add(p.parish.trim().toUpperCase());
    }
  }

  for (const [key, p] of Object.entries(raw.byParish ?? {})) {
    const [dRaw, scRaw, pRaw] = key.split("||");
    const d = normDistrict(dRaw);
    const scName = scRaw.trim().toUpperCase();
    const pName = pRaw.trim().toUpperCase();
    const pk = `${d}||${scName}`;
    (parishes[pk] ??= new Set()).add(pName);
    const vk = `${d}||${scName}||${pName}`;
    const existing = villages[vk] ?? (villages[vk] = new Set());
    for (const v of p.villages ?? []) existing.add(v.trim().toUpperCase());
  }

  const toSortedArrays = (obj) => {
    const out = {};
    for (const [k, v] of Object.entries(obj)) out[k] = [...v].sort();
    return out;
  };

  const subcountyArray = toSortedArrays(subcounties);
  const parishArray = toSortedArrays(parishes);
  const villageArray = toSortedArrays(villages);

  const counts = {
    districts: districts.length,
    subcounties: Object.keys(subcountyArray).reduce((n, k) => n + subcountyArray[k].length, 0),
    parishes: Object.keys(parishArray).reduce((n, k) => n + parishArray[k].length, 0),
    villages: Object.keys(villageArray).reduce((n, k) => n + villageArray[k].length, 0),
  };

  const out = {
    meta: {
      country: "ug",
      year: 2022,
      source: "Electoral Commission Uganda administrative units (July 2022)",
      counts,
    },
    districts,
    subcounties: subcountyArray,
    parishes: parishArray,
    villages: villageArray,
  };

  validateUnits(out);
  writeFileSync(join(SRC, "uganda.json"), JSON.stringify(out));
  console.log("uganda.json written", JSON.stringify(counts));
  return out;
}

function validateUnits(units) {
  const problems = [];
  const districts = new Set(units.districts);
  for (const k of Object.keys(units.subcounties)) {
    if (!districts.has(k)) problems.push(`subcounty key with unknown district: ${k}`);
  }
  for (const [k, list] of Object.entries(units.parishes)) {
    const [d, sc] = k.split("||");
    if (!districts.has(d) || !(units.subcounties[d] ?? []).includes(sc))
      problems.push(`parish key with unknown parent: ${k}`);
    if (list.length === 0) problems.push(`parish with no villages: ${k}`);
  }
  for (const [k, list] of Object.entries(units.villages)) {
    const [d, sc, p] = k.split("||");
    if (
      !districts.has(d) ||
      !(units.subcounties[d] ?? []).includes(sc) ||
      !(units.parishes[`${d}||${sc}`] ?? []).includes(p)
    )
      problems.push(`village key with unknown parent: ${k}`);
  }
  for (const [k, list] of Object.entries(units.subcounties)) {
    if (list.length === 0) problems.push(`subcounty with no parishes: ${k}`);
  }
  for (const d of units.districts) {
    if (!(units.subcounties[d] ?? []).length) problems.push(`district with no subcounties: ${d}`);
  }
  if (problems.length) {
    console.error(`DATA INTEGRITY FAILURES (${problems.length}):`);
    for (const p of problems) console.error("  - " + p);
    process.exitCode = 1;
  } else {
    console.log("Data integrity check passed: no orphan or empty units.");
  }
}

async function buildBoundaries() {
  await ensureRawBoundary();
  const raw = JSON.parse(readFileSync(RAW_GEO_FILE, "utf8"));
  const features = [];
  const seen = new Set();

  for (const f of raw.features ?? []) {
    const name = polyToEcoDistrict(String(f.properties?.District ?? ""));
    if (!name || seen.has(name)) continue;
    seen.add(name);
    const simplified = simplify(f, { tolerance: 0.012, highQuality: true });
    features.push({
      type: "Feature",
      properties: { district: name, sourceName: String(f.properties.District) },
      geometry: simplified.geometry,
    });
  }

  const out = {
    type: "FeatureCollection",
    features,
    _meta: {
      count: features.length,
      source: "OpenStreetMap district boundaries (Geradav/Uganda-GIS)",
      license: "ODbL (OpenStreetMap contributors)",
    },
  };

  const json = JSON.stringify(out);
  writeFileSync(join(SRC, "ug_districts.geojson"), json);
  console.log(
    `ug_districts.geojson written: ${features.length} polygons, ${(Buffer.byteLength(json) / 1e6).toFixed(1)} MB`,
  );
  return new Set(features.map((f) => f.properties.district));
}

async function main() {
  const units = buildUnits();
  const polygonNames = await buildBoundaries();

  const missing = units.districts.filter(
    (d) => !polygonNames.has(d) && !polygonNames.has(d.replace(/ CITY$/, "")),
  );
  const orphans = [...polygonNames].filter((p) => !units.districts.includes(p));
  console.log("EC districts without a boundary polygon:", missing.join(", ") || "(none)");
  console.log("Polygons not present in EC data:", orphans.join(", ") || "(none)");
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
