# Phase 7 Web fixtures

`phase7-web-fixtures.cjs` creates a small synthetic HML data set for Web validation. It reads existing company, branch, cost center, official account and supplier keys. It never updates or deletes those corporate rows.

Run from an approved backend runtime with `DATABASE_URL` and `STORAGE_CAMINHO_BASE` supplied through protected runtime configuration. Do not place a database URL or credential in shell arguments, Git, logs or artifacts.

```text
node scripts/phase7-web-fixtures.cjs --dry-run
node scripts/phase7-web-fixtures.cjs --apply --expect-host <confirmed-host> --expect-database <confirmed-database>
node scripts/phase7-web-fixtures.cjs --reset --expect-host <confirmed-host> --expect-database <confirmed-database>
```

Before the first HML apply, run dry-run and apply/reset/apply against an isolated SQL Server with the current migrations and fictitious prerequisite rows. Confirm the target again before writing to HML.

The tool reserves IDs 9001 onward for its own addresses, motives, contracts, auxiliary drivers, vehicles, requests and rides. It writes three synthetic PDF files under the configured storage volume. It creates technical catalogs only where absent; reset retains those catalogs because unrelated records may use them. Apply is idempotent and does not overwrite a fixture changed by a test. Reset deletes only the reserved fixture records and their dependent rows; it refuses collisions or requests/rides outside the reserved set that depend on fixtures. Records created manually through the Web during a test are not included in automatic reset unless they are descendants of a reserved fixture record. Review them individually.

The fixture set includes current, near-expiry and expired contracts, two suppliers linked to the approved branch, transport and vehicle types, motives for travel, cancellation, refusal and object transport, pricing rules, three auxiliary drivers, four vehicles, 31 requests with independent states, and 24 rides for calendars and dashboards. Supplier, company, branch and cost center records are references to existing HML data. The PDFs and all other new rows are synthetic.

The reset assumes no external business transaction depends on a fixture record. After customer homologation or other data entry, rerun dry-run and review dependencies before reset. Never delete by company, branch or supplier alone.
