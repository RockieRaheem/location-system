
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const admin = require('firebase-admin');
const ugandaRoutes = require('./ugandaRoutes.js');

const app = express();
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin not allowed'));
  },
}));
app.use(express.json({ limit: '256kb' }));

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'uganda-administration-api' }));

async function requireAdmin(req, res, next) {
  if (req.method === 'GET') return next();
  const match = req.headers.authorization?.match(/^Bearer (.+)$/);
  if (!match) return res.status(401).json({ error: 'authentication_required' });
  try {
    const token = await admin.auth().verifyIdToken(match[1]);
    if (token.admin !== true) return res.status(403).json({ error: 'admin_required' });
    req.user = token;
    return next();
  } catch {
    return res.status(401).json({ error: 'invalid_token' });
  }
}

app.use('/api/uganda', requireAdmin, ugandaRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'internal_error' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Uganda Location API running on port ${PORT}`);
});
