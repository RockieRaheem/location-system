# Uganda Administration Platform

A single Uganda-first product for navigating and maintaining authoritative administrative locations.

## Architecture

```text
apps/
  web/                 Responsive React application for public and admin users
  api/                 Firebase-backed Express API and authorization boundary
data/
  uganda/source/       Governed Electoral Commission-derived baseline
docs/product/          Product requirements and governance rules
infra/firebase/        Firestore security configuration
```

There is intentionally no separate mobile application. The initial product is one responsive web experience, reducing duplicated UI, inconsistent business rules, security drift, and release overhead. A native client should be introduced only when validated device capabilities or offline requirements justify its lifetime cost.

The Uganda dataset is not an application or workspace package. It is a governed source artifact consumed by the data build.

## Requirements

- Node.js 20 or newer
- npm 10 or newer
- Firebase Application Default Credentials for API access

## Setup

```bash
npm install
npm run data:ug
npm run dev:web
```

Run the API separately:

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS='C:\path\to\service-account.json'
$env:ALLOWED_ORIGINS='http://localhost:5173'
npm run dev:api
```

## Commands

- `npm run dev:web` starts the product UI.
- `npm run dev:api` starts the administration API.
- `npm run data:ug` rebuilds generated Uganda data.
- `npm run check` performs source validation.
- `npm run build` creates the production web bundle.

## Security and release status

API mutations require a valid Firebase ID token carrying the custom `admin: true` claim. Credentials, local configuration, generated datasets, dependencies, and build outputs are excluded from Git.

The responsive web UI still uses local snapshot persistence and demo authentication. Before real-user deployment, connect it to the authenticated API, replace destructive restructuring with audited transactions, add automated integration tests, and enable production monitoring and backups. The definitive acceptance criteria are in [docs/product/PRD.md](docs/product/PRD.md).
