export interface ValidationResult {
  valid: boolean;
  problems: string[];
}

export function validateData(d: unknown): ValidationResult {
  const problems: string[] = [];
  if (!d || typeof d !== "object" || Array.isArray(d)) {
    return { valid: false, problems: ["Data root must be an object."] };
  }

  const u = d as Record<string, unknown>;
  const districts = u.districts;
  if (!Array.isArray(districts) || districts.length === 0) {
    problems.push("`districts` must be a non-empty array of names.");
  }
  for (const rec of ["subcounties", "parishes", "villages"] as const) {
    const obj = u[rec];
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) {
      problems.push(`\`${rec}\` must be an object mapping keys to arrays.`);
    }
  }
  if (problems.length) return { valid: false, problems };

  const ds = districts as unknown[];
  const districtNames: string[] = [];
  const seenDistricts = new Set<string>();
  for (const x of ds) {
    if (typeof x !== "string" || !x.trim()) {
      problems.push("`districts` contains a blank or non-string entry.");
      continue;
    }
    const k = x.trim().toUpperCase();
    if (seenDistricts.has(k)) problems.push(`Duplicate district "${k}".`);
    seenDistricts.add(k);
    districtNames.push(k);
  }
  const districtSet = new Set(districtNames);

  const subcounties = u.subcounties as Record<string, unknown[]>;
  const parishes = u.parishes as Record<string, unknown[]>;
  const villages = u.villages as Record<string, unknown[]>;

  function checkList(list: unknown[], where: string): void {
    if (!Array.isArray(list)) {
      problems.push(`"${where}" must be an array of names.`);
      return;
    }
    const seen = new Set<string>();
    for (const item of list) {
      if (typeof item !== "string" || !item.trim()) {
        problems.push(`"${where}" contains a blank or non-string entry.`);
        continue;
      }
      const k = item.trim().toUpperCase();
      if (seen.has(k)) problems.push(`Duplicate entry "${k}" in ${where}.`);
      seen.add(k);
    }
  }

  for (const [key, list] of Object.entries(subcounties)) {
    if (!districtSet.has(key)) problems.push(`Subcounty group with unknown district: ${key}`);
    checkList(list, `subcounties of ${key}`);
  }

  for (const [key, list] of Object.entries(parishes)) {
    const [d, sc] = key.split("||");
    if (!districtSet.has(d) || !(subcounties[d] ?? []).includes(sc)) {
      problems.push(`Parish group with unknown parent: ${key}`);
    }
    checkList(list, `parishes of ${key}`);
  }

  for (const [key, list] of Object.entries(villages)) {
    const [d, sc, p] = key.split("||");
    if (
      !districtSet.has(d) ||
      !(subcounties[d] ?? []).includes(sc) ||
      !(parishes[`${d}||${sc}`] ?? []).includes(p)
    ) {
      problems.push(`Village group with unknown parent: ${key}`);
    }
    checkList(list, `villages of ${key}`);
  }

  return { valid: problems.length === 0, problems };
}
