const express = require('express');
const admin = require('firebase-admin');

const router = express.Router();

// Helper to get district reference
const getDistrictRef = (db, district) => db.collection('uganda_districts').doc(district);

// --- DISTRICTS ---
router.get('/districts', async (req, res) => {
  try {
    const db = admin.firestore();
    const snapshot = await db.collection('uganda_districts').get();
    const districts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Sort alphabetically by district name (id)
    districts.sort((a, b) => a.id.localeCompare(b.id));
    res.json(districts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/districts', async (req, res) => {
  try {
    const db = admin.firestore();
    const { name } = req.body;
    await db.collection('uganda_districts').doc(name).set({ constituencies: {} });
    res.status(201).json({ name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/districts/:district', async (req, res) => {
  try {
    const db = admin.firestore();
    const { district } = req.params;
    await getDistrictRef(db, district).update(req.body);
    res.json({ message: 'District updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/districts/:district', async (req, res) => {
  try {
    const db = admin.firestore();
    const { district } = req.params;
    await getDistrictRef(db, district).delete();
    res.json({ message: 'District deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- CONSTITUENCIES ---
router.get('/districts/:district/constituencies', async (req, res) => {
  try {
    const db = admin.firestore();
    const { district } = req.params;
    const doc = await getDistrictRef(db, district).get();
    if (!doc.exists) return res.status(404).json({ error: 'District not found' });
    const constituencies = doc.data().constituencies || {};
    res.json(constituencies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/districts/:district/constituencies', async (req, res) => {
  try {
    const db = admin.firestore();
    const { district } = req.params;
    const { name } = req.body;
    const doc = await getDistrictRef(db, district).get();
    if (!doc.exists) return res.status(404).json({ error: 'District not found' });
    const data = doc.data();
    data.constituencies = data.constituencies || {};
    data.constituencies[name] = { subdivisions: {} };
    await getDistrictRef(db, district).update({ constituencies: data.constituencies });
    res.status(201).json({ message: 'Constituency added' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/districts/:district/constituencies/:constituency', async (req, res) => {
  try {
    const db = admin.firestore();
    const { district, constituency } = req.params;
    const doc = await getDistrictRef(db, district).get();
    if (!doc.exists) return res.status(404).json({ error: 'District not found' });
    const data = doc.data();
    data.constituencies = data.constituencies || {};
    data.constituencies[constituency] = { ...data.constituencies[constituency], ...req.body };
    await getDistrictRef(db, district).update({ constituencies: data.constituencies });
    res.json({ message: 'Constituency updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/districts/:district/constituencies/:constituency', async (req, res) => {
  try {
    const db = admin.firestore();
    const { district, constituency } = req.params;
    const doc = await getDistrictRef(db, district).get();
    if (!doc.exists) return res.status(404).json({ error: 'District not found' });
    const data = doc.data();
    delete data.constituencies[constituency];
    await getDistrictRef(db, district).update({ constituencies: data.constituencies });
    res.json({ message: 'Constituency deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- SUBDIVISIONS ---
router.get('/districts/:district/constituencies/:constituency/subdivisions', async (req, res) => {
  try {
    const db = admin.firestore();
    const { district, constituency } = req.params;
    const doc = await getDistrictRef(db, district).get();
    if (!doc.exists) return res.status(404).json({ error: 'District not found' });
    const subdivisions = doc.data().constituencies?.[constituency]?.subdivisions || {};
    res.json(subdivisions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/districts/:district/constituencies/:constituency/subdivisions', async (req, res) => {
  try {
    const db = admin.firestore();
    const { district, constituency } = req.params;
    const { name } = req.body;
    const doc = await getDistrictRef(db, district).get();
    if (!doc.exists) return res.status(404).json({ error: 'District not found' });
    const data = doc.data();
    data.constituencies = data.constituencies || {};
    data.constituencies[constituency] = data.constituencies[constituency] || { subdivisions: {} };
    data.constituencies[constituency].subdivisions[name] = { parishes: {} };
    await getDistrictRef(db, district).update({ constituencies: data.constituencies });
    res.status(201).json({ message: 'Subdivision added' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/districts/:district/constituencies/:constituency/subdivisions/:subdivision', async (req, res) => {
  try {
    const db = admin.firestore();
    const { district, constituency, subdivision } = req.params;
    const doc = await getDistrictRef(db, district).get();
    if (!doc.exists) return res.status(404).json({ error: 'District not found' });
    const data = doc.data();
    data.constituencies[constituency].subdivisions[subdivision] = { ...data.constituencies[constituency].subdivisions[subdivision], ...req.body };
    await getDistrictRef(db, district).update({ constituencies: data.constituencies });
    res.json({ message: 'Subdivision updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/districts/:district/constituencies/:constituency/subdivisions/:subdivision', async (req, res) => {
  try {
    const db = admin.firestore();
    const { district, constituency, subdivision } = req.params;
    const doc = await getDistrictRef(db, district).get();
    if (!doc.exists) return res.status(404).json({ error: 'District not found' });
    const data = doc.data();
    delete data.constituencies[constituency].subdivisions[subdivision];
    await getDistrictRef(db, district).update({ constituencies: data.constituencies });
    res.json({ message: 'Subdivision deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- PARISHES ---
router.get('/districts/:district/constituencies/:constituency/subdivisions/:subdivision/parishes', async (req, res) => {
  try {
    const db = admin.firestore();
    const { district, constituency, subdivision } = req.params;
    const doc = await getDistrictRef(db, district).get();
    if (!doc.exists) return res.status(404).json({ error: 'District not found' });
    const parishes = doc.data().constituencies?.[constituency]?.subdivisions?.[subdivision]?.parishes || {};
    res.json(parishes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/districts/:district/constituencies/:constituency/subdivisions/:subdivision/parishes', async (req, res) => {
  try {
    const db = admin.firestore();
    const { district, constituency, subdivision } = req.params;
    const { name } = req.body;
    const doc = await getDistrictRef(db, district).get();
    if (!doc.exists) return res.status(404).json({ error: 'District not found' });
    const data = doc.data();
    data.constituencies[constituency].subdivisions[subdivision].parishes[name] = { villages: [] };
    await getDistrictRef(db, district).update({ constituencies: data.constituencies });
    res.status(201).json({ message: 'Parish added' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/districts/:district/constituencies/:constituency/subdivisions/:subdivision/parishes/:parish', async (req, res) => {
  try {
    const db = admin.firestore();
    const { district, constituency, subdivision, parish } = req.params;
    const doc = await getDistrictRef(db, district).get();
    if (!doc.exists) return res.status(404).json({ error: 'District not found' });
    const data = doc.data();
    data.constituencies[constituency].subdivisions[subdivision].parishes[parish] = { ...data.constituencies[constituency].subdivisions[subdivision].parishes[parish], ...req.body };
    await getDistrictRef(db, district).update({ constituencies: data.constituencies });
    res.json({ message: 'Parish updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/districts/:district/constituencies/:constituency/subdivisions/:subdivision/parishes/:parish', async (req, res) => {
  try {
    const db = admin.firestore();
    const { district, constituency, subdivision, parish } = req.params;
    const doc = await getDistrictRef(db, district).get();
    if (!doc.exists) return res.status(404).json({ error: 'District not found' });
    const data = doc.data();
    delete data.constituencies[constituency].subdivisions[subdivision].parishes[parish];
    await getDistrictRef(db, district).update({ constituencies: data.constituencies });
    res.json({ message: 'Parish deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- VILLAGES ---
router.get('/districts/:district/constituencies/:constituency/subdivisions/:subdivision/parishes/:parish/villages', async (req, res) => {
  try {
    const db = admin.firestore();
    const { district, constituency, subdivision, parish } = req.params;
    const doc = await getDistrictRef(db, district).get();
    if (!doc.exists) return res.status(404).json({ error: 'District not found' });
    const villages = doc.data().constituencies?.[constituency]?.subdivisions?.[subdivision]?.parishes?.[parish]?.villages || [];
    res.json(villages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/districts/:district/constituencies/:constituency/subdivisions/:subdivision/parishes/:parish/villages', async (req, res) => {
  try {
    const db = admin.firestore();
    const { district, constituency, subdivision, parish } = req.params;
    const { name } = req.body;
    const doc = await getDistrictRef(db, district).get();
    if (!doc.exists) return res.status(404).json({ error: 'District not found' });
    const data = doc.data();
    let villages = data.constituencies[constituency].subdivisions[subdivision].parishes[parish].villages || [];
    villages.push(name);
    data.constituencies[constituency].subdivisions[subdivision].parishes[parish].villages = villages;
    await getDistrictRef(db, district).update({ constituencies: data.constituencies });
    res.status(201).json({ message: 'Village added' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/districts/:district/constituencies/:constituency/subdivisions/:subdivision/parishes/:parish/villages/:village', async (req, res) => {
  try {
    const db = admin.firestore();
    const { district, constituency, subdivision, parish, village } = req.params;
    const { newName } = req.body;
    const doc = await getDistrictRef(db, district).get();
    if (!doc.exists) return res.status(404).json({ error: 'District not found' });
    const data = doc.data();
    let villages = data.constituencies[constituency].subdivisions[subdivision].parishes[parish].villages || [];
    villages = villages.map(v => (v === village ? newName : v));
    data.constituencies[constituency].subdivisions[subdivision].parishes[parish].villages = villages;
    await getDistrictRef(db, district).update({ constituencies: data.constituencies });
    res.json({ message: 'Village updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/districts/:district/constituencies/:constituency/subdivisions/:subdivision/parishes/:parish/villages/:village', async (req, res) => {
  try {
    const db = admin.firestore();
    const { district, constituency, subdivision, parish, village } = req.params;
    const doc = await getDistrictRef(db, district).get();
    if (!doc.exists) return res.status(404).json({ error: 'District not found' });
    const data = doc.data();
    let villages = data.constituencies[constituency].subdivisions[subdivision].parishes[parish].villages || [];
    villages = villages.filter(v => v !== village);
    data.constituencies[constituency].subdivisions[subdivision].parishes[parish].villages = villages;
    await getDistrictRef(db, district).update({ constituencies: data.constituencies });
    res.json({ message: 'Village deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
