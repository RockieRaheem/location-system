# Backend API Setup Instructions

## 1. Configure Firebase Admin SDK

1. Go to Firebase Console: https://console.firebase.google.com/
2. Select your project
3. Go to Project Settings > Service Accounts
4. Click "Generate New Private Key"
5. Download the JSON file
6. Copy the contents and paste into `functions/api/firebaseConfig.js`

## 2. Import CSV Data to Firestore

```bash
cd functions/api
npm run import-csv
```

This will parse `ug2010.csv` and upload the Uganda hierarchy to Firestore.

## 3. Start the API Server

```bash
cd functions/api
npm start
```

The API will run on http://localhost:4000

## 4. Available Endpoints

### Districts
- GET `/api/uganda/districts` - Get all districts

### Counties
- GET `/api/uganda/districts/:district/counties` - Get counties in a district
- POST `/api/uganda/districts/:district/counties` - Add a new county
- PUT `/api/uganda/districts/:district/counties/:county` - Update a county
- DELETE `/api/uganda/districts/:district/counties/:county` - Delete a county

### Subcounties
- GET `/api/uganda/districts/:district/counties/:county/subcounties`
- POST `/api/uganda/districts/:district/counties/:county/subcounties`
- PUT `/api/uganda/districts/:district/counties/:county/subcounties/:subcounty`
- DELETE `/api/uganda/districts/:district/counties/:county/subcounties/:subcounty`

### Parishes
- GET `/api/uganda/districts/:district/counties/:county/subcounties/:subcounty/parishes`
- POST `/api/uganda/districts/:district/counties/:county/subcounties/:subcounty/parishes`
- PUT `/api/uganda/districts/:district/counties/:county/subcounties/:subcounty/parishes/:parish`
- DELETE `/api/uganda/districts/:district/counties/:county/subcounties/:subcounty/parishes/:parish`

### Villages
- GET `/api/uganda/districts/:district/counties/:county/subcounties/:subcounty/parishes/:parish/villages`
- POST `/api/uganda/districts/:district/counties/:county/subcounties/:subcounty/parishes/:parish/villages`
- PUT `/api/uganda/districts/:district/counties/:county/subcounties/:subcounty/parishes/:parish/villages/:village`
- DELETE `/api/uganda/districts/:district/counties/:county/subcounties/:subcounty/parishes/:parish/villages/:village`

## 5. Update Mobile App API URL

If deploying the backend to a cloud service (Vercel, Heroku, etc.), update the API_BASE URL in:
`mobile-app/src/services/ugandaApiService.ts`

## 6. Mobile App Usage

The mobile app now fetches Uganda hierarchy data from the backend API. Make sure the backend is running before testing the mobile app with Uganda data.

For local testing:
- Backend: http://localhost:4000
- Mobile App: Update `ugandaApiService.ts` to use your computer's local IP if testing on a physical device.
