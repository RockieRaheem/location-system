# Uganda Administration API

Express API for Uganda administrative-unit management backed by Firestore.

## Credentials

Use Firebase Application Default Credentials. Locally, set `GOOGLE_APPLICATION_CREDENTIALS` to an uncommitted service-account JSON file; deployed Google Cloud and Firebase runtimes should use their assigned service account.

## Run

From the repository root, run `npm run dev:api`.

The server listens on `PORT` or `4000` and exposes Uganda routes below `/api/uganda`.

## Data policy

The API no longer imports the obsolete Uganda 2010 CSV. Seed and migration tooling must use the approved Electoral Commission baseline and preserve source metadata, stable identifiers, audit history, and hierarchy integrity.

Never commit credentials or generated data exports.
