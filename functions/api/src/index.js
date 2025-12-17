import express from 'express';
import cors from 'cors';
import admin from 'firebase-admin';
import { config } from '../firebaseConfig.js';

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(config),
  });
}
const db = admin.firestore();

// Example: Get all districts
app.get('/api/uganda/districts', async (req, res) => {
  try {
    const snapshot = await db.collection('uganda_districts').get();
    const districts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(districts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// TODO: Add CRUD endpoints for counties, parishes, villages, etc.

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Uganda Location API running on port ${PORT}`);
});
