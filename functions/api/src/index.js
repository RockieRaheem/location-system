
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const ugandaRoutes = require('./ugandaRoutes.js');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

// Mount Uganda hierarchy API
app.use('/api/uganda', ugandaRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Uganda Location API running on port ${PORT}`);
});
