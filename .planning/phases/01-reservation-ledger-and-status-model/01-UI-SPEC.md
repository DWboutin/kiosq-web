---
phase: 1
slug: reservation-ledger-and-status-model
status: approved
shadcn_initialized: true
preset: backend-foundation-no-new-ui
created: 2026-04-29
---

# Phase 1 - UI Design Contract

> Visual and interaction contract for Phase 1. This is a backend/data-model foundation phase, so the contract is intentionally a **negative UI contract**: do not add new user-facing screens or dashboard surfaces in this phase. Preserve semantic labels and display-ready fields so later UI phases can render the ledger cleanly.

---

## Phase UI Scope

| Scope Item | Contract |
|------------|----------|
| New screens | None in Phase 1 |
| New reusable visual components | None in Phase 1 |
| Existing UI edits | Avoid unless required to keep builds/types passing after schema/type changes |
| User-facing impact | No visible feature launch expected from Phase 1 alone |
| Future UI dependency | Data model must expose simple display statuses, role-aware amount fields, and activity event types usable by Phase 5 dashboards |

Phase 1 must not implement checkout UI, QR receipt UI, producer scanner UI, transfer/refund dashboards, or reservation history screens. Those belong to later phases.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | shadcn/ui pattern already present |
| Preset | Existing Kiosq dashboard/product UI |
| Component library | Radix primitives through existing `components/ui/` wrappers |
| Icon library | Existing project icons plus `lucide-react` when appropriate |
| Font | Existing app font/theme; no typography changes in Phase 1 |

No design-system expansion is authorized in this phase.

---

## Spacing Scale

Declared values (must be multiples of 4):

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Existing inline/icon gaps only |
| sm | 8px | Existing compact element spacing only |
| md | 16px | Existing default element spacing only |
| lg | 24px | Existing section padding only |
| xl | 32px | Existing layout gaps only |
| 2xl | 48px | Existing major section breaks only |
| 3xl | 64px | Existing page-level spacing only |

Exceptions: none. Phase 1 should not introduce new layout surfaces.

---

## Typography

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Body | Existing body token | Existing body weight | Existing body line height |
| Label | Existing label token | Existing label weight | Existing label line height |
| Heading | Existing heading token | Existing heading weight | Existing heading line height |
| Display | Not applicable | Not applicable | Not applicable |

No new typography decisions are authorized in Phase 1.

---

## Color

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | Existing theme surface/background | Existing app surfaces |
| Secondary (30%) | Existing muted/card treatment | Existing cards, dashboard panels, and table surfaces |
| Accent (10%) | Existing brand/action treatment | Existing primary actions only |
| Destructive | Existing destructive treatment | Existing destructive actions only |

Accent reserved for: existing primary actions. Phase 1 should not add new action colors, semantic color mappings, gradients, or decorative treatments.

---

## Status Display Contract

Phase 1 must store a primary reservation lifecycle status that can later map to simple user-facing labels. Later UI phases must use these simplified labels by default rather than exposing low-level payment, transfer, refund, or idempotency states.

| Internal Status | Client Label | Producer Label | Admin Label |
|-----------------|--------------|----------------|-------------|
| `payment_pending` | Payment pending | Payment pending | Payment pending |
| `payment_processing` | Payment processing | Payment processing | Payment processing |
| `reserved` | Reserved | Reserved | Reserved |
| `pickup_confirmed` | Pickup confirmed | Pickup confirmed | Pickup confirmed |
| `cancelled` | Cancelled | Cancelled | Cancelled |
| `late_cancelled` | Late cancellation | Late cancellation | Late cancellation |
| `no_show` | No-show | No-show | No-show |
| `expired` | Expired | Expired | Expired |
| `admin_review` | Under review | Needs review | Admin review |

Financial sub-statuses for payment, settlement, transfer, and refund records should remain available to admin/support and transaction detail surfaces, but not become the primary reservation label for client/producer dashboards.

---

## Activity and Amount Display Contract

Phase 1 must make later activity timelines possible without exposing technical audit data to regular users.

| Audience | Visible Events | Visible Amounts | Hidden Details |
|----------|----------------|-----------------|----------------|
| Client | Payment received, reservation confirmed, QR generated, pickup confirmed, cancellation, late cancellation, no-show, refund completed, review changes | Amount paid, amount refunded, amount retained/penalty | Producer compensation split, platform fee internals, raw Stripe payloads, idempotency keys |
| Producer | Reservation confirmed, pickup confirmed, late cancellation, no-show, transfer completed, review changes | Producer compensation, transfer amount | Client payment internals, raw Stripe payloads, idempotency keys |
| Kiosq admin | Important events plus complete audit trail | Full ledger amounts by role and category | Secrets and raw token values must still remain hidden |

Activity copy should stay human-readable and bilingual-ready. Store event types and metadata in a way that later translation keys can be derived without parsing free-form English/French text.

---

## Copywriting Contract

Phase 1 does not add UI copy, but it locks future label intent.

| Element | Copy |
|---------|------|
| Primary CTA | Not applicable in Phase 1 |
| Empty state heading | Not applicable in Phase 1 |
| Empty state body | Not applicable in Phase 1 |
| Error state | Technical errors must stay server-side; future UI should show a plain recovery path, not raw ledger/RPC/Stripe details |
| Destructive confirmation | Not applicable in Phase 1 |
| Early cancellation policy | "Free cancellation until 24 hours before pickup" |
| Late cancellation/no-show policy | "Late cancellation or no-show keeps 20% of the order total" |
| Admin review status | "Under review" for client, "Needs review" for producer |

Copy added in later phases must avoid legal escrow language. Use delayed payout / producer paid after pickup language instead.

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | none | not required |
| third-party registry | none | not allowed in Phase 1 |

No registry blocks are authorized in this phase.

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS - Phase 1 locks future status/policy language and avoids escrow wording.
- [x] Dimension 2 Visuals: PASS - No new visual surfaces are authorized.
- [x] Dimension 3 Color: PASS - Existing theme only; no new colors.
- [x] Dimension 4 Typography: PASS - Existing typography only; no new text scale.
- [x] Dimension 5 Spacing: PASS - Existing spacing only; no new layouts.
- [x] Dimension 6 Registry Safety: PASS - No registry blocks or third-party UI additions.

**Approval:** approved 2026-04-29
