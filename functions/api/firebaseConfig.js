// Firebase Admin SDK Configuration
// 
// SETUP INSTRUCTIONS:
// 1. Go to Firebase Console: https://console.firebase.google.com/
// 2. Select your project
// 3. Go to Project Settings > Service Accounts
// 4. Click "Generate New Private Key" button
// 5. Save the downloaded JSON file as 'serviceAccountKey.json' in this directory
// 6. The config will automatically load from that file
//
// Alternative: Set environment variable GOOGLE_APPLICATION_CREDENTIALS
// pointing to your service account JSON file path

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let config;

try {
  // Try to load from serviceAccountKey.json
  const serviceAccountPath = join(__dirname, 'serviceAccountKey.json');
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
  config = serviceAccount;
} catch (error) {
  // Fallback to manual configuration (for development/testing)
  console.warn('⚠️  No serviceAccountKey.json found. Using manual configuration.');
  console.warn('   Please add your Firebase credentials to proceed.');
  
  config = {
    "type": "service_account",
    "project_id": process.env.FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
    "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID || "YOUR_PRIVATE_KEY_ID",
    "private_key": process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || "YOUR_PRIVATE_KEY",
    "client_email": process.env.FIREBASE_CLIENT_EMAIL || "YOUR_CLIENT_EMAIL",
    "client_id": process.env.FIREBASE_CLIENT_ID || "YOUR_CLIENT_ID",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": process.env.FIREBASE_CERT_URL || "YOUR_CLIENT_X509_CERT_URL"
  };
}

export { config };
