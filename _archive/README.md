# Archive

Point-in-time scripts and artifacts retained for reference.
Cutoff: **2026-04-13** (pre-launch tidy).

Everything here was working code at some point. It's archived rather than deleted so the git-mv history stays findable by filename, and any future "what did we do about X back in March?" question has an answer.

## Folders

| Path | Contents |
|---|---|
| `src-db-one-offs/` | Debug / check / audit / fix / update / seed scripts from specific past incidents. Originally lived in `src/db/`. |
| `src-db-migrate-scripts/` | Ad-hoc TS migration runners (`migrate-admin.ts`, `migrate-routes.ts`, etc.). Superseded by `drizzle/` + `src/db/apply-migration.ts`. |
| `seeds-legacy/` | Early `seed-blog-*.ts` variants (root-level). Replaced by `src/db/seeds/` orchestrator. |
| `sql/` | Non-standard SQL files that don't match the drizzle naming convention. |

## Rules

- **Prune after 6 months** — anything here with no referenced incident gets `git rm`'d. Git history still preserves it.
- **Don't run anything in here** — these scripts target schema states that may no longer exist. If you need to re-run a pattern, copy the file out, update it, and land it in the current tree.
- **New one-offs go here, not in `src/db/`** — if you're writing a `check-*` or `fix-*` script, drop it in `_archive/YYYY-MM-<slug>/` directly.

## Excluded from builds
`tsconfig.json` has `_archive/**/*` in `exclude` so archived code doesn't slow TypeScript or appear in imports.
