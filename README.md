# Location System

A Uganda-first administrative registration and public-funds allocation platform. It contains a React web application, an Expo mobile application, and a Firebase-backed Express API.

## Repository layout

```text
.
|-- web-app/              React 19 + Vite web client
|-- mobile-app/           React Native + Expo client
|-- functions/api/        Express and Firebase Admin API
|-- prd/                  Product requirements
|-- ug-locations-master/  Pinned Uganda source dataset
|-- firestore.rules       Firestore access rules
`-- package.json          Workspace commands
```

Generated dependencies and build output are excluded from version control.

## Requirements and setup

- Node.js 20 or newer
- npm 10 or newer
- Firebase credentials for API or Firestore operations

```bash
npm install
npm run dev:web
# or: npm run dev:mobile
```

Run the API with Firebase Application Default Credentials:

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS='C:\path\to\service-account.json'
npm run dev:api
```

## Quality checks

```bash
npm run check
npm run build
```

`check` type-checks the production web client. `check:mobile` exposes the legacy mobile client's current type debt. `build` produces the production web bundle. Expo native builds should be created through Expo/EAS.

## Data

Large generated Uganda datasets under `web-app/src/data/` are not committed. Rebuild them with `npm run data:ug`. The builder uses the pinned Electoral Commission-derived source under `ug-locations-master/` and downloads boundary/place data from sources documented in the scripts. Obsolete 2010 data and non-Uganda datasets are intentionally excluded from the initial scope.

## Security

- Never commit service-account JSON, `.env` files, or API keys.
- The API uses Firebase Application Default Credentials.
- Review `firestore.rules` before deployment.
- The web client currently has demo-only local admin credentials; this is not secure production authentication.

See [prd/PRD.md](prd/PRD.md) for product scope. Component-specific notes live next to each component.
