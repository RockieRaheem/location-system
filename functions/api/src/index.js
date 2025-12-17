import express from 'express';
import cors from 'cors';
import admin from 'firebase-admin';
import { config } from '../firebaseConfig.js';
import ugandaRoutes from './ugandaRoutes.js';

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(config),
  });
}

// Mount Uganda hierarchy API
app.use('/api/uganda', ugandaRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Uganda Location API running on port ${PORT}`);
});
