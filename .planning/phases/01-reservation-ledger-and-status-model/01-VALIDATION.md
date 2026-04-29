---
phase: 1
slug: reservation-ledger-and-status-model
status: approved
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-29
---

# Phase 1 - Validation Strategy

> Per-phase validation contract for schema-heavy planning. This repo has no test runner yet, so Phase 1 uses migration, type-generation, static grep, and production build checks. Full automated behavioral tests are planned in Phase 6.

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Supabase migration/static verification plus Next.js build |
| **Config file** | `package.json`, `supabase/config.toml` |
| **Quick run command** | `rg "reservation_ledger_entries|transition_reservation_status|reservation_idempotency_keys" supabase/migrations` |
| **Full suite command** | `npm run db:push && npm run update-types && npm run build` |
| **Estimated runtime** | environment-dependent |

## Sampling Rate

- **After every task commit:** Run the task's grep/static verification.
- **After every plan wave:** Run the wave's listed automated commands.
- **Before `$gsd-verify-work`:** `npm run db:push`, `npm run update-types`, and `npm run build` must be green.
- **Max feedback latency:** bounded by local Supabase and Next.js build runtime.

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | LEDG-01, LEDG-02, LEDG-04 | T-01-01 / T-01-02 | Money and snapshots are durable, typed, and append-only | static | `rg "reservation_financial_summaries|reservation_ledger_entries|total_amount_minor|pickup_window_start" supabase/migrations/20260429000000_reservation_ledger_foundation.sql` | W0 | pending |
| 01-01-02 | 01 | 1 | LEDG-01 | T-01-01 | Money constants and policy math use minor units | static | `rg "PLATFORM_FEE_BPS|LATE_CANCEL_OR_NO_SHOW_BPS|calculateLateCancellationAmounts" utils/reservations/money.ts` | W0 | pending |
| 01-02-01 | 02 | 2 | LEDG-03, LEDG-04 | T-02-01 / T-02-02 | Status transitions are guarded and activity entries are role-scoped | static | `rg "transition_reservation_status|record_reservation_activity|payment_pending|admin_review" supabase/migrations/20260429000001_reservation_status_activity_rpc.sql` | W0 | pending |
| 01-02-02 | 02 | 2 | LEDG-03 | T-02-01 | App constants match DB lifecycle values | static | `rg "RESERVATION_LIFECYCLE_STATUSES|RESERVATION_STATUS_LABELS|admin_review" utils/reservations/status.ts types/app.ts` | W0 | pending |
| 01-03-01 | 03 | 3 | LEDG-05 | T-03-01 | Duplicate financial transitions are blocked at DB level | static | `rg "reservation_idempotency_keys|stripe_events|UNIQUE|idempotency_key" supabase/migrations/20260429000002_reservation_idempotency_indexes.sql` | W0 | pending |
| 01-03-02 | 03 | 3 | LEDG-01, LEDG-02, LEDG-03, LEDG-04, LEDG-05 | T-03-02 | Live schema/types/build reflect the migration set | command | `npm run db:push && npm run update-types && npm run build` | W0 | pending |

## Wave 0 Requirements

Existing infrastructure covers this phase's required verification commands. No test runner installation belongs to Phase 1.

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Supabase project access for `npm run db:push` | LEDG-01 to LEDG-05 | Requires local/linked Supabase environment and credentials | Executor must report the exact command output or blocker if Supabase is unavailable |

## Validation Sign-Off

- [x] All tasks have automated verify commands or a documented environment-bound command.
- [x] Sampling continuity: no 3 consecutive tasks without automated verify.
- [x] Wave 0 covers all missing references.
- [x] No watch-mode flags.
- [x] Feedback latency is bounded by local Supabase and Next.js build runtime.
- [x] `nyquist_compliant: true` set in frontmatter.

**Approval:** approved 2026-04-29
