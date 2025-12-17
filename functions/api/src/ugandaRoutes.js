import express from 'express';
import admin from 'firebase-admin';

const router = express.Router();
const db = admin.firestore();

// Helper to get collection references
const getDistrictRef = (district) => db.collection('uganda_districts').doc(district);

// --- DISTRICTS ---
router.get('/districts', async (req, res) => {
  try {
    const snapshot = await db.collection('uganda_districts').get();
    const districts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(districts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/districts', async (req, res) => {
  try {
    const { name } = req.body;
    await db.collection('uganda_districts').doc(name).set({ counties: {} });
    res.status(201).json({ message: 'District created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/districts/:district', async (req, res) => {
  try {
    const { district } = req.params;
    await getDistrictRef(district).update(req.body);
    res.json({ message: 'District updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/districts/:district', async (req, res) => {
  try {
    const { district } = req.params;
    await getDistrictRef(district).delete();
    res.json({ message: 'District deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- COUNTIES ---
router.get('/districts/:district/counties', async (req, res) => {
  try {
    const { district } = req.params;
    const doc = await getDistrictRef(district).get();
    if (!doc.exists) return res.status(404).json({ error: 'District not found' });
    const counties = doc.data().counties || {};
    res.json(counties);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/districts/:district/counties', async (req, res) => {
  try {
    const { district } = req.params;
    const { name } = req.body;
    const doc = await getDistrictRef(district).get();
    if (!doc.exists) return res.status(404).json({ error: 'District not found' });
    const data = doc.data();
    data.counties = data.counties || {};
    data.counties[name] = { subcounties: {} };
    await getDistrictRef(district).update({ counties: data.counties });
    res.status(201).json({ message: 'County added' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/districts/:district/counties/:county', async (req, res) => {
  try {
    const { district, county } = req.params;
    const doc = await getDistrictRef(district).get();
    if (!doc.exists) return res.status(404).json({ error: 'District not found' });
    const data = doc.data();
    data.counties = data.counties || {};
    data.counties[county] = { ...data.counties[county], ...req.body };
    await getDistrictRef(district).update({ counties: data.counties });
    res.json({ message: 'County updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/districts/:district/counties/:county', async (req, res) => {
  try {
    const { district, county } = req.params;
    const doc = await getDistrictRef(district).get();
    if (!doc.exists) return res.status(404).json({ error: 'District not found' });
    const data = doc.data();
    data.counties = data.counties || {};
    delete data.counties[county];
    await getDistrictRef(district).update({ counties: data.counties });
    res.json({ message: 'County deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- SUBCOUNTIES ---
router.get('/districts/:district/counties/:county/subcounties', async (req, res) => {
  try {
    const { district, county } = req.params;
    const doc = await getDistrictRef(district).get();
    if (!doc.exists) return res.status(404).json({ error: 'District not found' });
    const subcounties = (doc.data().counties?.[county]?.subcounties) || {};
    res.json(subcounties);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/districts/:district/counties/:county/subcounties', async (req, res) => {
  try {
    const { district, county } = req.params;
    const { name } = req.body;
    const doc = await getDistrictRef(district).get();
    if (!doc.exists) return res.status(404).json({ error: 'District not found' });
    const data = doc.data();
    data.counties = data.counties || {};
    data.counties[county] = data.counties[county] || { subcounties: {} };
    data.counties[county].subcounties[name] = { parishes: {} };
    await getDistrictRef(district).update({ counties: data.counties });
    res.status(201).json({ message: 'Subcounty added' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/districts/:district/counties/:county/subcounties/:subcounty', async (req, res) => {
  try {
    const { district, county, subcounty } = req.params;
    const doc = await getDistrictRef(district).get();
    if (!doc.exists) return res.status(404).json({ error: 'District not found' });
    const data = doc.data();
    data.counties = data.counties || {};
    data.counties[county] = data.counties[county] || { subcounties: {} };
    data.counties[county].subcounties[subcounty] = { ...data.counties[county].subcounties[subcounty], ...req.body };
    await getDistrictRef(district).update({ counties: data.counties });
    res.json({ message: 'Subcounty updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/districts/:district/counties/:county/subcounties/:subcounty', async (req, res) => {
  try {
    const { district, county, subcounty } = req.params;
    const doc = await getDistrictRef(district).get();
    if (!doc.exists) return res.status(404).json({ error: 'District not found' });
    const data = doc.data();
    data.counties = data.counties || {};
    delete data.counties[county].subcounties[subcounty];
    await getDistrictRef(district).update({ counties: data.counties });
    res.json({ message: 'Subcounty deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- PARISHES ---
router.get('/districts/:district/counties/:county/subcounties/:subcounty/parishes', async (req, res) => {
  try {
    const { district, county, subcounty } = req.params;
    const doc = await getDistrictRef(district).get();
    if (!doc.exists) return res.status(404).json({ error: 'District not found' });
    const parishes = (doc.data().counties?.[county]?.subcounties?.[subcounty]?.parishes) || {};
    res.json(parishes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/districts/:district/counties/:county/subcounties/:subcounty/parishes', async (req, res) => {
  try {
    const { district, county, subcounty } = req.params;
    const { name } = req.body;
    const doc = await getDistrictRef(district).get();
    if (!doc.exists) return res.status(404).json({ error: 'District not found' });
    const data = doc.data();
    data.counties = data.counties || {};
    data.counties[county] = data.counties[county] || { subcounties: {} };
    data.counties[county].subcounties[subcounty] = data.counties[county].subcounties[subcounty] || { parishes: {} };
    data.counties[county].subcounties[subcounty].parishes[name] = { villages: [] };
    await getDistrictRef(district).update({ counties: data.counties });
    res.status(201).json({ message: 'Parish added' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/districts/:district/counties/:county/subcounties/:subcounty/parishes/:parish', async (req, res) => {
  try {
    const { district, county, subcounty, parish } = req.params;
    const doc = await getDistrictRef(district).get();
    if (!doc.exists) return res.status(404).json({ error: 'District not found' });
    const data = doc.data();
    data.counties = data.counties || {};
    data.counties[county] = data.counties[county] || { subcounties: {} };
    data.counties[county].subcounties[subcounty] = data.counties[county].subcounties[subcounty] || { parishes: {} };
    data.counties[county].subcounties[subcounty].parishes[parish] = { ...data.counties[county].subcounties[subcounty].parishes[parish], ...req.body };
    await getDistrictRef(district).update({ counties: data.counties });
    res.json({ message: 'Parish updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/districts/:district/counties/:county/subcounties/:subcounty/parishes/:parish', async (req, res) => {
  try {
    const { district, county, subcounty, parish } = req.params;
    const doc = await getDistrictRef(district).get();
    if (!doc.exists) return res.status(404).json({ error: 'District not found' });
    const data = doc.data();
    data.counties = data.counties || {};
    delete data.counties[county].subcounties[subcounty].parishes[parish];
    await getDistrictRef(district).update({ counties: data.counties });
    res.json({ message: 'Parish deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- VILLAGES ---
router.get('/districts/:district/counties/:county/subcounties/:subcounty/parishes/:parish/villages', async (req, res) => {
  try {
    const { district, county, subcounty, parish } = req.params;
    const doc = await getDistrictRef(district).get();
    if (!doc.exists) return res.status(404).json({ error: 'District not found' });
    const villages = (doc.data().counties?.[county]?.subcounties?.[subcounty]?.parishes?.[parish]?.villages) || [];
    res.json(villages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/districts/:district/counties/:county/subcounties/:subcounty/parishes/:parish/villages', async (req, res) => {
  try {
    const { district, county, subcounty, parish } = req.params;
    const { name } = req.body;
    const doc = await getDistrictRef(district).get();
    if (!doc.exists) return res.status(404).json({ error: 'District not found' });
    const data = doc.data();
    data.counties = data.counties || {};
    data.counties[county] = data.counties[county] || { subcounties: {} };
    data.counties[county].subcounties[subcounty] = data.counties[county].subcounties[subcounty] || { parishes: {} };
    data.counties[county].subcounties[subcounty].parishes[parish] = data.counties[county].subcounties[subcounty].parishes[parish] || { villages: [] };
    data.counties[county].subcounties[subcounty].parishes[parish].villages.push(name);
    await getDistrictRef(district).update({ counties: data.counties });
    res.status(201).json({ message: 'Village added' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/districts/:district/counties/:county/subcounties/:subcounty/parishes/:parish/villages/:village', async (req, res) => {
  try {
    const { district, county, subcounty, parish, village } = req.params;
    const { newName } = req.body;
    const doc = await getDistrictRef(district).get();
    if (!doc.exists) return res.status(404).json({ error: 'District not found' });
    const data = doc.data();
    let villages = (data.counties?.[county]?.subcounties?.[subcounty]?.parishes?.[parish]?.villages) || [];
    villages = villages.map(v => (v === village ? newName : v));
    data.counties[county].subcounties[subcounty].parishes[parish].villages = villages;
    await getDistrictRef(district).update({ counties: data.counties });
    res.json({ message: 'Village updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/districts/:district/counties/:county/subcounties/:subcounty/parishes/:parish/villages/:village', async (req, res) => {
  try {
    const { district, county, subcounty, parish, village } = req.params;
    const doc = await getDistrictRef(district).get();
    if (!doc.exists) return res.status(404).json({ error: 'District not found' });
    const data = doc.data();
    let villages = (data.counties?.[county]?.subcounties?.[subcounty]?.parishes?.[parish]?.villages) || [];
    villages = villages.filter(v => v !== village);
    data.counties[county].subcounties[subcounty].parishes[parish].villages = villages;
    await getDistrictRef(district).update({ counties: data.counties });
    res.json({ message: 'Village deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
