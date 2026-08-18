# Uganda Administrative Location Navigator

## Product definition

The system is Uganda's governed navigator for discovering, registering, and maintaining administrative locations. Uganda is the only supported country in the initial release.

## Authoritative baseline

The hierarchy is derived from Uganda Electoral Commission administrative-unit data published in July 2022. Administrators create governed revisions when units are established, divided, renamed, transferred, or retired.

The current verified hierarchy is:

1. District / City
2. Sub-county / Division
3. Parish / Ward
4. Village / Cell

County or constituency is an electoral grouping present in portions of the source material, not a universal administrative parent in the normalized dataset. It must not be fabricated where a reliable relationship is unavailable.

## Users

- Public viewer: searches and navigates verified locations and map boundaries.
- Administrator: creates, renames, restructures, and retires units; imports and exports governed snapshots.
- Auditor: reviews changes, provenance, and approval history.

## Core workflows

### Find a location

Users search by administrative name, browse parent and child units, explore mapped boundaries, drop a map pin, or use device location to identify the surrounding district and sub-county.

### Register a unit

An administrator selects the correct parent, enters a unique normalized name, verifies the proposed unit, and saves it. Duplicate siblings and orphaned children are rejected.

### Divide or restructure a unit

Restructuring is an auditable transaction: create replacement units, transfer children, verify the resulting hierarchy, and retire the superseded unit. Cascade deletion is reserved for erroneous unpublished data and requires explicit confirmation.

## Data governance

- Every unit carries source, source date, status, and a stable identifier.
- Every mutation records actor, timestamp, reason, previous value, and new value.
- Published identifiers are never reused.
- Imports are schema-validated before replacing state.
- Electoral and administrative hierarchies remain explicitly distinguished.
- Uganda 2010 data and non-Uganda datasets remain outside scope.

## Production acceptance criteria

- Authentication and authorization are enforced server-side; demo credentials are removed.
- Firestore writes use transactions and enforce hierarchy invariants.
- Restructuring shows impact counts and requires a reason and confirmation.
- Unit histories are queryable and exportable.
- Automated tests cover search, navigation, CRUD, cascade behavior, migration, and validation.
- Accessibility, responsive layout, error recovery, monitoring, backups, and rollback are verified.

## Deferred scope

- Additional countries
- Constituency management as a parallel electoral hierarchy
- Offline navigation and native device clients
