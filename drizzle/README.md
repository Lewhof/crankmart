# Drizzle Migrations

## Current state

`meta/_journal.json` tracks only `0000_nervous_caretaker`. All subsequent migrations (`0001_past_red_shift`, `0005_add_business_status`, `0006_trust_verification`, `0007_boost_targets`, `0008_add_seed_source`, `0009_multi_country`) were applied **manually** via `src/db/apply-migration.ts`, not via `drizzle-kit migrate`.

This drift is intentional for now — the manual apply pattern was faster to iterate on during the pre-launch build-up. The cost: `drizzle-kit generate` will misfire if run against the current schema without first reconciling the journal.

Numbering gaps `0002`, `0003`, `0004` reflect migrations that were drafted then collapsed into later files — not a bug.

## Applying a new migration

1. Write the SQL: `drizzle/NNNN_<slug>.sql`
2. Apply: `npm run db:apply-migration -- drizzle/NNNN_<slug>.sql`
3. Commit the `.sql` file alongside the code that depends on it.

## If you ever need `drizzle-kit generate` again

Reconcile the journal first — add entries for `0001` + `0005`–`0009` matching the format of `0000`. Or nuke `meta/` and rebuild from scratch against the live DB (risky, consult before doing).

## Archive

`migrate-businesses.sql` was moved to `_archive/sql/` — non-standard name, status unclear, kept for reference only.
