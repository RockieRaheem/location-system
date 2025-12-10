import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as express from "express";

admin.initializeApp();
const db = admin.firestore();

const app = express();
app.use(express.json());

// GET /countries/:countryId/units
app.get("/countries/:countryId/units", async (req, res) => {
  try {
    const { countryId } = req.params;
    const { level, parentId, q, limit = 100 } = req.query as any;

    let query: FirebaseFirestore.Query = db.collection("admin_units").where("countryId", "==", countryId);

    if (level !== undefined) query = query.where("level", "==", Number(level));
    if (parentId) query = query.where("parentId", "==", parentId);

    if (q) {
      // Basic prefix search (case-sensitive depends on stored names)
      query = query.where("name", ">=", q).where("name", "<=", q + "\uf8ff");
    }

    query = query.limit(Number(limit));
    const snap = await query.get();
    const data = snap.docs.map((d) => d.data());
    res.json({ data, count: data.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal" });
  }
});

// GET /units/:unitId
app.get("/units/:unitId", async (req, res) => {
  try {
    const doc = await db.collection("admin_units").doc(req.params.unitId).get();
    if (!doc.exists) return res.status(404).json({ error: "not_found" });
    res.json({ data: doc.data() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal" });
  }
});

export const api = functions.https.onRequest(app);
