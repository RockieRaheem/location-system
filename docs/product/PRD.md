# Uganda Administrative Registration and Allocation System

## Product definition

The system is the controlled source of truth for registering Uganda's administrative units and allocating public funds through that hierarchy. Uganda is the only supported country in the initial release.

## Authoritative baseline

The initial hierarchy is derived from Uganda Electoral Commission administrative-unit data published in July 2022. Administrators create governed revisions when units are established, divided, renamed, transferred, or retired.

The operational hierarchy represented by the current verified dataset is:

1. District / City
2. Sub-county / Division
3. Parish / Ward
4. Village / Cell

County or constituency is an electoral grouping present in portions of the source material, not a universal local-government parent in the normalized dataset. It must not be fabricated where a reliable relationship is unavailable. A future schema may expose constituencies as a parallel electoral hierarchy.

## Users

- Public viewer: searches approved units, maps, and published allocations.
- Administrator: creates, renames, restructures, and retires units; imports and exports governed snapshots; assigns budgets.
- Auditor: reviews changes, allocation totals, provenance, and approval history.

## Core workflows

### Register a unit

An administrator selects the correct parent, enters a unique normalized name, verifies the proposed unit, and saves it. Duplicate siblings and orphaned children are rejected.

### Divide or restructure a unit

Restructuring is an auditable transaction: create replacement units, transfer children and allocations, verify totals, and retire the superseded unit. Cascade deletion is reserved for erroneous unpublished data and requires explicit confirmation.

### Allocate public funds

- Amounts are stored and displayed in Uganda shillings (UGX).
- Child allocations cannot make sibling allocations exceed their parent allocation.
- A parent cannot be reduced below the total already assigned to its children.
- Unallocated balances remain visible at every level.
- Negative, non-finite, and malformed amounts are rejected.
- Production persistence must enforce these rules transactionally on the server.

## Data governance

- Every unit carries source, source date, status, and a stable identifier.
- Every mutation records actor, timestamp, reason, previous value, and new value.
- Published identifiers are never reused.
- Imports are schema-validated before replacing state.
- Electoral and administrative hierarchies remain explicitly distinguished.
- Uganda 2010 data and Kenya datasets are outside scope and must not be reintroduced.

## Production acceptance criteria

- Authentication and authorization are enforced server-side; demo credentials are removed.
- Firestore writes use transactions and enforce hierarchy and budget invariants.
- Restructuring shows impact counts and requires a reason and confirmation.
- Unit and allocation histories are queryable and exportable.
- Automated tests cover CRUD, cascade behavior, migration, validation, and allocation caps.
- Accessibility, responsive layout, error recovery, monitoring, backups, and rollback are verified.

## Deferred scope

- Additional countries, including Kenya
- Constituency management as a parallel electoral hierarchy
- Approval chains, fiscal-year budgeting, warrants, expenditure tracking, and payments
