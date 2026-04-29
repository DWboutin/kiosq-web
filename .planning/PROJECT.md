# Kiosq Reservation Pickup Payments

## What This Is

Kiosq is a bilingual marketplace where local producers manage products, kiosqs, schedules, reservations, and Stripe-connected payments. This project turns the existing reservation foundation into a reliable online product reservation flow: the client reserves and pays online, then picks up the order in person while the producer scans a QR code in the site to confirm the handoff.

The payment model is escrow-like without presenting Kiosq as a legal escrow service: Kiosq records and charges the PaymentIntent on the platform, tracks the producer payout obligation internally, and transfers the producer share only after pickup confirmation.

## Core Value

Clients can reserve and pay for products online, and producers only receive the order funds after a verified in-person QR pickup confirmation.

## Requirements

### Validated

- ✓ Bilingual public marketplace routes exist for browsing vendors, products, schedules, and product details — existing
- ✓ Supabase Auth, profiles, vendor onboarding, product management, kiosq management, schedules, and dashboard shells exist — existing
- ✓ Stripe dependencies and initial Connect/payment actions exist for producer onboarding and reservation PaymentIntent creation — existing
- ✓ Reservation, order, and order item tables exist in Supabase migrations, with an unfinished reservation dashboard surface — existing
- ✓ Codebase conventions are established around Next.js App Router, Supabase route handlers/server actions, factories, React Query hooks, and feature modules — existing

### Active

- [ ] Client can reserve products online through a complete "reserve -> pay -> pickup -> confirm" flow.
- [ ] Reservation payment creates and records a Stripe PaymentIntent with enough metadata to reconcile orders, producer payout, cancellation policy, and pickup confirmation.
- [ ] Kiosq uses Stripe Connect separate charges and transfers: charge the client on the platform, then transfer the producer share only after QR pickup confirmation.
- [ ] Producer can scan a client QR code from the Kiosq site to confirm the in-person handoff; no second client confirmation is required in v1.
- [ ] Reservation lifecycle tracks statuses for pending payment, paid/reserved, cancelled, pickup-ready, confirmed, producer-payable/transferred, no-show, and disputed/admin-review states.
- [ ] Client can cancel until 24 hours before the reservation date without the no-show penalty.
- [ ] If the client cancels within 24 hours of the reservation date or does not pick up the order, the client owes 20% of the order total and the producer compensation policy is applied.
- [ ] Producer and client dashboards expose reservation history, cancellation actions, pickup/QR status, and transaction status, while implementation focuses first on the core reservation-payment-pickup loop.
- [ ] Existing fragile payment/reservation paths are consolidated so duplicate orders, inconsistent amount units, raw reservation JSON screens, and payment logs are removed.

### Out of Scope

- Legal escrow service positioning — Kiosq will implement delayed marketplace transfers, not regulated escrow custody.
- Dual producer/client confirmation at pickup — v1 treats the producer QR scan as sufficient confirmation.
- Shipping, delivery, or carrier tracking — v1 pickup is in person at the producer/kiosq.
- Full dispute-resolution operations center — v1 can flag disputes/admin review, but complex mediation tooling is deferred.
- Multi-producer cart settlement in one checkout — v1 may preserve a one-producer-per-reservation constraint unless later requirements explicitly expand it.
- Native mobile app QR scanning — v1 uses the web app/site.

## Context

The existing app is a Next.js 15 App Router monolith with React 19, TypeScript, Supabase Auth/Postgres/Storage/PostGIS, Stripe, next-intl, TanStack Query, shadcn/Radix UI, and Tailwind CSS. Codebase maps live in `.planning/codebase/` and identify the current architecture, conventions, test gap, and concerns.

The current reservation/payment implementation is partially present but risky. `actions/create-reservation-payment-intent.ts`, `features/stripe-payment/stripe-payment-modal.tsx`, `actions/create-reservation.ts`, and `app/api/payment-success/route.ts` split PaymentIntent creation, client confirmation, reservation/order writes, and payment-return handling across multiple surfaces. `app/[locale]/dashboard/reservations/page.tsx` and `components/client-pages/dashboard-profile-reservations/dashboard-profile-reservations.tsx` currently render raw reservation data rather than a finished dashboard experience.

Stripe architecture decision: manual capture is not the default fit because card authorization windows are usually measured in days and can expire before pickup. The simpler marketplace model is separate charges and transfers: collect payment on the platform, record the reservation/order/payout state internally, and create the transfer to the connected producer account after QR pickup confirmation. This keeps one charge fee event, avoids authorization expiry, and gives Kiosq a clear internal ledger for cancellation/no-show policy.

Cancellation and producer compensation policy for v1:
- Cancellation more than 24 hours before the reservation date: client can cancel without the 20% penalty.
- Cancellation within 24 hours or no-show: client owes 20% of the order total.
- Producer compensation must be represented explicitly in the order/reservation ledger before funds are transferred or refunded.

## Constraints

- **Tech stack**: Use the existing Next.js App Router, TypeScript, Supabase, Stripe, next-intl, TanStack Query, and component patterns already documented in `.planning/codebase/`.
- **Payment architecture**: Use Stripe Connect separate charges and transfers for delayed producer payout; avoid relying on manual capture for pickup windows that may exceed card authorization validity.
- **Money safety**: Store all payment amounts in minor units consistently; centralize amount calculations, penalty calculations, transfer amounts, refunds, and Stripe metadata.
- **Verification**: Payment finalization must be server-owned and idempotent; QR scan confirmation must not create duplicate transfers or duplicate orders.
- **Security**: Remove sensitive payment logging, avoid exposing client secrets beyond the client confirmation flow, and treat QR pickup tokens as single-use, expiring, hard-to-guess credentials.
- **Authorization**: Client and producer dashboards must enforce ownership at the route/query layer, not rely only on broad RLS behavior.
- **UX**: The first usable slice must complete the core reservation-payment-pickup loop before expanding dashboard polish and secondary history management.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Use separate charges and transfers instead of manual capture | Pickup may occur after card authorization windows expire; charging up front then delaying producer transfer is simpler and more reliable for this marketplace flow. | — Pending |
| Treat producer QR scan as the v1 pickup confirmation | The producer controls order handoff and this avoids a second confirmation step for clients at pickup. | — Pending |
| Apply 24-hour cancellation cutoff with 20% no-show/late-cancel charge | Producers need compensation for prepared/reserved inventory when a client cancels late or does not show. | — Pending |
| Plan both producer and client dashboards, but implement the core loop first | Dashboards are needed for history and status management, but the core value depends on payment and pickup confirmation working end to end. | — Pending |
| Avoid legal escrow framing | Stripe Connect delayed transfers can support the product flow without introducing regulated escrow language or obligations in v1. | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `$gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `$gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-29 after initialization*
