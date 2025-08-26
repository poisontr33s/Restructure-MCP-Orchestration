# Session Log Micro-dataset Pipeline

This pipeline turns `docs/session-log` artifacts into a small dataset for targeted fixes and minimal-noise maintenance.

What it does:

- Ingest Problems dumps + session.jsonl into a consolidated dataset
- Deduplicate repeating entries and classify issues (lint, format, types, build, runtime, other)
- Emit a focused autofix target list (files affected by linters/formatters)
- Run safe fixes (Prettier, ESLint) and prune redundant Problems snapshots

## Tasks

- Logs: Ingest Session Logs — builds dataset under `docs/session-log/dataset/`
- Logs: Triage + Autofix — runs Prettier/ESLint on targeted files, prunes redundant logs
- Logs: Ingest -> Triage -> Snapshot — end-to-end including a daily snapshot entry

Artifacts:

- `dataset.raw.json` — all records (problems + log events)
- `dataset.dedup.json` — deduplicated problem records
- `problems.bySeverity.json`, `problems.bySource.json`, `problems.byCategory.json`
- `autofix.targets.json` — unique files for Prettier/ESLint
- `prune.report.json` — how many logs were removed vs kept

Notes:

- The session logger skips appending an entry identical to the last one to avoid noise.
- Use this pipeline after significant edits or CI runs to keep logs meaningful and small.
