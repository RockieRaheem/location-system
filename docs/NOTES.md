NOTES / Quickstart
------------------
1. Import Script
   - Install: npm i ug-locations firebase-admin
   - Run: ts-node scripts/import_ug_to_firestore.ts /path/to/serviceAccountKey.json
   - The script creates countries/UG, admin_units and audits collections.

2. Cloud Functions
   - Deploy functions with Firebase CLI (functions folder)
   - Replace any project-specific values in functions/src/index.ts

3. Mobile App (Expo)
   - cd mobile-app
   - npm install
   - expo start

4. Firestore rules
   - Use `firebase deploy --only firestore:rules` after editing `firestore.rules`

5. Security
   - Lock the `audits` collection so only server/service account writes audits.
