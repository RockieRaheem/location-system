/**
 * import_ug_to_firestore.ts
 * Usage:
 *   ts-node scripts/import_ug_to_firestore.ts /path/to/serviceAccountKey.json
 *
 * Installs:
 *  npm i ug-locations firebase-admin
 *  npm i -D ts-node typescript @types/node
 */
import * as admin from "firebase-admin";
import ug from "ug-locations";
import * as path from "path";

const SERVICE_ACCOUNT_PATH = process.argv[2];
if (!SERVICE_ACCOUNT_PATH) {
  console.error("Usage: ts-node scripts/import_ug_to_firestore.ts <serviceAccountJson>");
  process.exit(1);
}

const serviceAccount = require(path.resolve(SERVICE_ACCOUNT_PATH));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function main() {
  const countryId = "UG";
  const countryDocRef = db.collection("countries").doc(countryId);

  await countryDocRef.set({
    name: "Uganda",
    countryCode: "UG",
    phoneCode: "+256",
    administrativeLevels: 8,
    electoralLevels: 3,
    economicZones: ["East African Community"],
    meta: {
      levelNames: [
        "Country",
        "Region",
        "Sub-region",
        "District / City",
        "County / Constituency",
        "Sub-county / Division / Ward",
        "Parish",
        "Village / Cell"
      ],
      source: "ug-locations",
      source_repo: "https://github.com/NatumanyaGuy/ug-locations",
    },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  console.log("Created countries/UG");

  async function writeAdminUnit(unit: any) {
    const docRef = db.collection("admin_units").doc(unit.id);
    await docRef.set(unit);
    await db.collection("audits").add({
      objectType: "admin_unit",
      objectId: unit.id,
      action: "CREATE",
      changedBy: "import-script",
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      oldValue: null,
      newValue: unit,
      reason: "Initial import from ug-locations"
    });
  }

  function slugify(s: string) {
    return s.replace(/\s+/g, "_").replace(/[^A-Za-z0-9_\-]/g, "").toUpperCase();
  }

  const districts = ug.getDistricts();
  console.log(`Found ${districts.length} districts`);

  for (const districtName of districts) {
    const districtId = `UG::DISTRICT::${slugify(districtName)}`;
    const districtUnit = {
      id: districtId,
      countryId,
      level: 3,
      type: "District/City",
      name: districtName,
      code: null,
      parentId: countryId,
      pathNames: ["Uganda", districtName],
      pathIds: [countryId, districtId],
      version: 1,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    await writeAdminUnit(districtUnit);

    const subcounties = ug.getSubcountiesInDistrict(districtName) || [];
    for (const sub of subcounties) {
      const subId = `UG::SUBCOUNTY::${slugify(districtName)}::${slugify(sub)}`;
      const subUnit = {
        id: subId,
        countryId,
        level: 5,
        type: "Sub-county/Division/Ward",
        name: sub,
        code: null,
        parentId: districtId,
        pathNames: ["Uganda", districtName, sub],
        pathIds: [countryId, districtId, subId],
        version: 1,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      await writeAdminUnit(subUnit);

      const parishes = ug.getParishesInSubcounty(districtName, sub) || [];
      for (const parish of parishes) {
        const parishId = `UG::PARISH::${slugify(districtName)}::${slugify(sub)}::${slugify(parish)}`;
        const parishUnit = {
          id: parishId,
          countryId,
          level: 6,
          type: "Parish",
          name: parish,
          code: null,
          parentId: subId,
          pathNames: ["Uganda", districtName, sub, parish],
          pathIds: [countryId, districtId, subId, parishId],
          version: 1,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        await writeAdminUnit(parishUnit);

        const villages = ug.getVillagesInParish(districtName, sub, parish) || [];
        for (const village of villages) {
          const villageId = `UG::VILLAGE::${slugify(districtName)}::${slugify(sub)}::${slugify(parish)}::${slugify(village)}`;
          const villageUnit = {
            id: villageId,
            countryId,
            level: 7,
            type: "Village/Cell",
            name: village,
            code: null,
            parentId: parishId,
            pathNames: ["Uganda", districtName, sub, parish, village],
            pathIds: [countryId, districtId, subId, parishId, villageId],
            version: 1,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          };
          await writeAdminUnit(villageUnit);
        }
      }
    }
  }

  console.log("Import complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Import failed:", err);
  process.exit(1);
});
