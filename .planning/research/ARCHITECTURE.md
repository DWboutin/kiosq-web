# Architecture Research

**Domain:** Kiosq reservation pickup payments
**Researched:** 2026-04-29
**Confidence:** HIGH for the technical architecture; MEDIUM for the exact no-show compensation split because the business rule says "producer compensation policy" but does not yet specify whether Kiosq keeps a fee from the 20% penalty.

## Standard Architecture

### System Overview

```text
+------------------------------------------------------------------+
| Client and Producer UI                                           |
| Product reservation form, Stripe Payment Element, QR display,     |
| producer scanner, client/vendor reservation dashboards            |
+------------------------+--------------------+--------------------+
                         |                    |
                         v                    v
+------------------------------------------------------------------+
| Next.js Server Boundary                                          |
| Server actions for user-initiated mutations, route handlers for   |
| webhooks/read APIs, factories for dashboard DTOs                  |
+------------------------+--------------------+--------------------+
                         |                    |
                         v                    v
+------------------------------------------------------------------+
| Reservation Domain Core                                          |
| Postgres RPCs own atomic state transitions, money calculations,   |
| ledger entries, idempotency keys, token consumption, row locks     |
+------------------------+--------------------+--------------------+
                         |                    |
                         v                    v
+------------------------------------------------------------------+
| Persistence and Integrations                                     |
| Supabase Postgres/RLS, Stripe PaymentIntents, Stripe webhooks,    |
| Stripe refunds, Stripe Connect transfers                          |
+------------------------------------------------------------------+
```

The architecture should remain a brownfield Next.js App Router monolith. Do not introduce a separate payment service for v1. The important change is ownership: client UI starts payment and pickup actions, but database RPCs and the Stripe webhook own finalization. Server actions become orchestration wrappers around validation, Stripe API calls, RPC calls, and cache revalidation.

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Reservation checkout UI | Collect variant, quantity, kiosq, pickup window/date, and start Stripe payment. | `features/reservation-checkout/` or a replacement for `features/reservation-button/`; React Hook Form plus existing modal/provider conventions. |
| Stripe payment UI | Mount Payment Element with a server-created PaymentIntent client secret and confirm payment. | Keep `features/stripe-payment/`, but remove reservation finalization from the client. The client only confirms and then polls/reads reservation state. |
| Reservation server actions | Authenticated mutation entry points for checkout creation, cancellation, pickup confirmation, no-show marking, transfer retry. | `actions/create-reservation-checkout.ts`, `actions/cancel-reservation.ts`, `actions/confirm-reservation-pickup.ts`, `actions/retry-reservation-transfer.ts`. |
| Stripe webhook route | Verify Stripe signature, record event idempotently, dispatch payment/refund/dispute updates. | `app/api/stripe/webhook/route.ts`, `request.text()`, `stripe.webhooks.constructEvent(...)`, admin Supabase client. |
| Payment return page/route | Display pending/success/error status only. | Existing `/payment-success` can remain as UI routing, but it must not insert orders or order items. |
| Reservation read APIs | Return paginated, owner-filtered reservation DTOs for dashboards. | `app/api/users/current/reservations/route.ts` with `cache: "no-store"` behavior for private data and a focused factory. |
| Database RPC layer | Own atomic multi-table mutations, row locking, money policy calculations, status transitions, and idempotent ledger writes. | Supabase Postgres functions called with `supabase.rpc(...)`; use `security invoker` by default and narrowly scoped `security definer` only for system/webhook functions. |
| Reservation ledger | Append-only audit of payment, refund, transfer, penalty, and settlement decisions. | New `reservation_ledger_entries` table plus typed settlement/payment/refund/transfer tables. |
| QR token boundary | Generate one-time pickup credentials after payment finalization; consume only after producer authorization. | New `reservation_pickup_tokens` table storing token hashes, not plaintext tokens. |
| Stripe transfer boundary | Create Connect transfers only after pickup confirmation or a no-show/late-cancel settlement that owes producer compensation. | New `reservation_transfers` table and idempotent `stripe.transfers.create(...)` calls with `source_transaction`. |

## Current Fit and Required Correction

Kiosq already has the right high-level codebase shape: App Router pages, server actions for mutations, route handlers for callbacks and reads, factories for DTOs, and Supabase migrations for durable workflow rules. The current reservation/payment implementation should be consolidated, not extended as-is.

Important corrections:

- `actions/create-reservation-payment-intent.ts` currently creates a PaymentIntent with `transfer_data.destination` and `application_fee_amount`. That is the wrong shape for delayed producer payout. For separate charges and later transfers, create the charge on the platform, set a `transfer_group`, and create the producer Transfer only after QR confirmation or policy settlement.
- `features/stripe-payment/stripe-payment-modal.tsx` currently calls `createReservation(...)` after client-side confirmation. That makes the browser part of payment finalization. Replace it with webhook-owned finalization.
- `app/api/payment-success/route.ts` currently inserts orders/order items from a public return URL and stores inconsistent amount units. Make it display-only and move order/payment finalization into a signed webhook plus idempotent RPC.
- `actions/create-reservation.ts` performs multi-table writes without a transaction. Replace direct table inserts with one `create_reservation_checkout(...)` RPC.
- Existing reservation/order status triggers are not aligned with the target lifecycle and even reference a `completed` reservation transition that is not in the current reservation status constraint. Replace the status model in one corrective migration rather than layering more triggers on top.

## Recommended Project Structure

```text
actions/
  create-reservation-checkout.ts        # Creates pending reservation/order and Stripe PaymentIntent
  cancel-reservation.ts                 # Applies cancellation policy and starts refund if needed
  confirm-reservation-pickup.ts         # Producer QR confirmation and settlement preparation
  mark-reservation-no-show.ts           # Producer/admin no-show path after pickup window
  retry-reservation-transfer.ts         # Retries failed producer transfer rows
  revalidators/reservations-revalidator.ts

app/api/
  stripe/webhook/route.ts               # Signed Stripe event ingestion
  users/current/reservations/route.ts   # Private dashboard reads, paginated and no-store
  reservations/[reservationId]/route.ts # Focused status read after checkout/payment

features/
  reservation-checkout/                 # Form, modal, checkout state, validation schema
  stripe-payment/                       # Payment Element only, no DB finalization
  pickup-qr/                            # Client reservation QR display
  pickup-scanner/                       # Producer scanner and confirmation UI

utils/
  reservations/money.ts                 # Minor-unit calculations, rounding, policy helpers
  reservations/status.ts                # Allowed status transitions and UI labels
  reservations/stripe-metadata.ts       # Metadata builders/parsers
  reservations/qr-token.ts              # Token generation/hash helpers
  factories/reservation-factory.ts      # Dashboard-safe DTO mapping
  invalidators-hooks/use-reservations-invalidator.ts

supabase/migrations/
  <timestamp>_reservation_payment_ledger.sql
  <timestamp>_reservation_rpc_functions.sql
  <timestamp>_reservation_rls_and_indexes.sql
```

### Structure Rationale

- **`actions/`:** Keep user-initiated mutations in the established server action layer, but use actions as orchestration only. They should not manually insert `reservations`, `orders`, and `order_items` across separate Supabase calls.
- **`app/api/stripe/webhook/route.ts`:** Webhooks are external POST callbacks, so they belong in route handlers, not server actions. This route is the only place that trusts Stripe events after signature verification.
- **`utils/reservations/`:** Money, status, Stripe metadata, and QR token helpers are shared by actions, routes, factories, and tests. They are domain utilities, not UI code.
- **`supabase/migrations/`:** The critical invariants are database invariants. Multi-row reservation creation, payment finalization, pickup confirmation, refunds, and transfers need transaction-backed RPCs and unique constraints.

## Data Model Recommendation

Keep the existing `reservations`, `orders`, and `order_items` concepts, but stop using them as the only payment record. Add a small payment/settlement ledger around them.

| Table | Purpose | Key Constraints |
|-------|---------|-----------------|
| `reservations` | User-visible reservation lifecycle and pickup window. | Add `pickup_window_start`, `pickup_window_end`, `status`, `policy_version`; index by customer, vendor profile, status, pickup window. |
| `orders` | Commercial order snapshot for dashboard/reporting. | Add/migrate to `total_amount_minor BIGINT`, `currency TEXT`; make `stripe_payment_intent_id` unique if retained here. |
| `order_items` | Immutable item/price snapshot. | Add/migrate to `unit_price_minor`, `total_price_minor`, `currency`; never recalculate from current product price after checkout. |
| `reservation_payment_intents` | Stripe PaymentIntent record for the reservation. | Unique `reservation_id`, unique `stripe_payment_intent_id`, unique `transfer_group`, amount/currency checks. |
| `stripe_events` | Webhook event idempotency and audit. | Unique `stripe_event_id`; store event type, livemode, processed status, processed timestamp, error summary. |
| `reservation_pickup_tokens` | One-time QR pickup credentials. | Unique `reservation_id` for active token, unique `token_hash`, `expires_at`, `consumed_at`, `consumed_by`. |
| `reservation_settlements` | Policy decision for pickup, free cancel, late cancel, no-show, dispute. | Unique active settlement per reservation/reason; stores gross, refund, producer transfer, platform retained amounts in minor units. |
| `reservation_refunds` | Stripe Refund attempts and outcomes. | Unique idempotency key; optional unique `(settlement_id, refund_type)`. |
| `reservation_transfers` | Stripe Connect Transfer attempts and outcomes. | Unique idempotency key; optional unique `(settlement_id, transfer_type)`; stores `source_charge_id`. |
| `reservation_ledger_entries` | Append-only money movement and decision audit. | Unique `idempotency_key`; no updates except metadata correction by admin migration. |

### Money Representation

Use minor units for all payment, refund, transfer, penalty, and ledger amounts. Existing catalog prices can remain `NUMERIC(10,2)` for now, but checkout must snapshot into integer minor units before creating Stripe objects. Stripe expects integer amounts in the smallest currency unit, and the current code already has a bug where one path stores cents and another stores dollars.

Recommended rule:

```typescript
type Money = {
  amountMinor: number;
  currency: "CAD" | "USD";
};
```

Store uppercase ISO currency in Kiosq. Convert to lowercase only at the Stripe boundary.

## Architectural Patterns

### Pattern 1: Transactional RPC as Domain Boundary

**What:** Use Postgres functions for any mutation that changes more than one reservation/payment table.

**When to use:** Creating a reservation checkout, finalizing payment, confirming pickup, applying cancellation/no-show policy, recording transfer/refund results.

**Trade-offs:** This keeps invariants close to data and avoids partial writes. The cost is more migration discipline and generated type refreshes after schema changes.

**Example:**

```typescript
const { data, error } = await supabase.rpc("create_reservation_checkout", {
  p_client_request_id: clientRequestId,
  p_variant_id: variantId,
  p_quantity: quantity,
  p_kiosq_id: kiosqId,
  p_pickup_window_start: pickupWindowStart,
  p_pickup_window_end: pickupWindowEnd,
});

if (error) {
  throw error;
}
```

Database functions should lock the reservation/order rows they mutate with `FOR UPDATE`, assert legal state transitions, and write ledger entries with deterministic idempotency keys.

### Pattern 2: Stripe Webhook as Payment Finalizer

**What:** The client confirms the PaymentIntent, but only the signed Stripe webhook marks the reservation paid/reserved.

**When to use:** Every PaymentIntent status change that affects fulfillment or money.

**Trade-offs:** The UI may need to show "payment processing" while the webhook arrives. This is the correct trade-off because client callbacks and redirect return URLs can be skipped or replayed.

**Example:**

```typescript
export async function POST(request: Request) {
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");

  const event = stripe.webhooks.constructEvent(
    payload,
    signature ?? "",
    process.env.STRIPE_WEBHOOK_SECRET!
  );

  await recordAndProcessStripeEvent(event);

  return Response.json({ received: true });
}
```

Handle at least `payment_intent.succeeded`, `payment_intent.payment_failed`, `payment_intent.processing`, `charge.refunded`, and `charge.dispute.created`. For v1, start with card payments if the team wants to avoid asynchronous payment-method complexity; add broader automatic payment methods only when the processing states are fully represented in dashboards.

### Pattern 3: Separate Charge, Delayed Transfer

**What:** Charge the client on the platform PaymentIntent, record the producer liability internally, and create a Stripe Transfer to the connected producer account only after QR pickup confirmation or no-show/late-cancel settlement.

**When to use:** All reservation payments in this milestone.

**Trade-offs:** The platform is responsible for fees, refunds, chargebacks, and negative balances, so the internal ledger must be explicit. The benefit is that pickup dates can exceed card authorization windows, and producer payout no longer depends on manual capture validity.

**Implementation notes:**

- Create the PaymentIntent on the platform account.
- Set `transfer_group` to a stable value such as `reservation:<reservation_id>`.
- Do not set `transfer_data.destination` on the PaymentIntent for this delayed payout flow.
- Do not rely on `application_fee_amount`; Kiosq keeps its platform share by transferring less than the captured amount.
- Store `latest_charge` from the succeeded PaymentIntent and use it as the transfer `source_transaction` when creating the producer transfer.

### Pattern 4: Single-Use QR Token With Producer Authorization

**What:** The QR code is a bearer pickup credential, but it is not sufficient authorization by itself. A signed-in producer who owns the vendor profile must scan and submit it.

**When to use:** Pickup confirmation after payment finalization.

**Trade-offs:** Requiring producer auth adds one operational step, but it prevents a leaked QR from confirming pickup without a producer session.

**Example:**

```typescript
const token = crypto.randomBytes(32).toString("base64url");
const tokenHash = hmacSha256(token, process.env.PICKUP_TOKEN_SECRET!);
```

Store only `token_hash`. The QR payload should contain an opaque token or a URL containing the token. Confirmation must be a POST/server action, not a GET that completes pickup just by loading a URL.

### Pattern 5: Settlement Rows Before Stripe Side Effects

**What:** Cancellation, no-show, refund, and transfer decisions are recorded in Postgres before calling Stripe.

**When to use:** Any action that creates a refund or transfer.

**Trade-offs:** This creates retryable pending rows if Stripe fails. That is better than an untracked external money movement.

**Example flow:**

1. RPC creates `reservation_settlements` and a pending `reservation_refunds` or `reservation_transfers` row.
2. Server action calls Stripe with the row's deterministic idempotency key.
3. Server action records the Stripe result through a second RPC.
4. Webhooks reconcile any result that the action missed.

## Data Flow

### Checkout and PaymentIntent Creation

```text
Client reservation form
    |
    v
createReservationCheckout server action
    |
    v
create_reservation_checkout RPC
    |  inserts reservation(payment_pending), order, order_items,
    |  payment_intent row, ledger checkout entry
    v
Stripe PaymentIntent create on platform
    |  transfer_group=reservation:<id>
    |  metadata has reservation/order/profile ids
    |  idempotencyKey=reservation-payment-intent:<reservation_id>:v1
    v
record_payment_intent_created RPC
    |
    v
Return client_secret to Payment Element
```

The server action may return `clientSecret`, `reservationId`, and `statusReadUrl`. It must not return Stripe metadata or store/log the client secret.

### Payment Finalization

```text
Stripe payment_intent.succeeded
    |
    v
app/api/stripe/webhook/route.ts
    |  verifies raw-body signature
    |  inserts stripe_events row by event id
    v
finalize_reservation_payment RPC
    |  validates amount/currency/PaymentIntent id
    |  stores charge id
    |  marks reservation reserved
    |  creates pickup token
    |  writes ledger entries
    v
Dashboard/status reads show paid and pickup-ready state
```

If the PaymentIntent moves to `processing`, keep the reservation in `payment_processing`. If it fails, mark the payment row failed and expire/release the pending reservation state.

### QR Pickup Confirmation

```text
Client displays QR for paid reservation
    |
    v
Producer scanner reads token
    |
    v
confirmReservationPickup server action
    |  requires authenticated producer owner
    v
confirm_reservation_pickup RPC
    |  hashes token and validates active token
    |  checks producer owns vendor profile
    |  locks reservation/settlement rows
    |  consumes token
    |  marks reservation picked_up
    |  creates settlement with producer_transfer_amount
    |  creates pending transfer row
    v
create Stripe Transfer
    |
    v
record_reservation_transfer_result RPC
```

Confirmation is idempotent. A second scan of the same token should return the already confirmed reservation if the same producer owns it, not create another transfer.

### Cancellation and No-Show

```text
Client cancellation or producer/admin no-show action
    |
    v
settle_reservation_policy RPC
    |  locks reservation/order/payment rows
    |  computes cutoff: pickup_window_start - 24 hours
    |  free cancel: refund 100%, producer 0
    |  late cancel/no-show: refund 80%, producer compensation policy row for 20%
    |  writes settlement and ledger
    v
Stripe Refund if refund_amount_minor > 0
    |
    v
Stripe Transfer if producer_transfer_amount_minor > 0
```

The 24-hour cutoff and 20% penalty must be computed server-side. Store `policy_version`, `cutoff_at`, `client_penalty_amount_minor`, `client_refund_amount_minor`, `producer_compensation_amount_minor`, and `platform_retained_amount_minor` on the settlement row. Do not derive these later from status text.

## State Management

Use separate state fields rather than one overloaded status:

| Concern | Owner | Recommended Values |
|---------|-------|--------------------|
| Reservation lifecycle | `reservations.status` | `payment_pending`, `payment_processing`, `reserved`, `picked_up`, `cancelled`, `late_cancelled`, `no_show`, `expired`, `disputed`, `admin_review` |
| Payment state | `reservation_payment_intents.status` | Stripe-aligned values such as `requires_payment_method`, `requires_action`, `processing`, `succeeded`, `failed`, `canceled` |
| Settlement state | `reservation_settlements.status` | `pending`, `refund_pending`, `transfer_pending`, `settled`, `failed`, `admin_review` |
| Transfer state | `reservation_transfers.status` | `pending`, `processing`, `succeeded`, `failed`, `retryable` |
| Refund state | `reservation_refunds.status` | `pending`, `processing`, `succeeded`, `failed` |

`orders.status` can stay as a dashboard/reporting mirror during migration, but the roadmap should treat `reservations.status`, payment rows, and settlement rows as the source of truth.

## Security and Idempotency Boundaries

### Required Security Boundaries

- Verify Stripe webhook signatures using the raw request body and `STRIPE_WEBHOOK_SECRET`.
- Use the service-role Supabase client only in the Stripe webhook and narrowly scoped system routes. Keep user actions on the normal server client unless a system RPC is required.
- Store only QR token hashes; never store plaintext pickup tokens.
- Require producer ownership for QR confirmation. The token alone is not enough.
- Do not log PaymentIntent client secrets, Stripe metadata payloads, QR tokens, or full reservation payment objects.
- Keep private dashboard reservation reads uncached or `no-store`; do not use 24-hour Next cache tags for current-user reservation state.
- Put owner filters in route/RPC queries even when RLS exists.
- Revoke public execution from sensitive RPCs and grant only the roles that need them.

### Required Idempotency Keys and Constraints

| Operation | Idempotency Boundary |
|-----------|----------------------|
| Reservation checkout creation | Unique `(customer_id, client_request_id)` or equivalent checkout request key. |
| Stripe PaymentIntent creation | Stripe idempotency key `reservation-payment-intent:<reservation_id>:v1`; unique `reservation_payment_intents.reservation_id`. |
| Webhook processing | Unique `stripe_events.stripe_event_id`; RPC no-ops when event already processed. |
| Payment finalization | Unique `stripe_payment_intent_id`; ledger idempotency key `payment-succeeded:<payment_intent_id>`. |
| QR confirmation | Unique active pickup token per reservation; token row has `consumed_at`; unique transfer row per settlement. |
| Refund creation | Stripe idempotency key `reservation-refund:<refund_id>:v1`; unique refund row per settlement/refund type. |
| Transfer creation | Stripe idempotency key `reservation-transfer:<transfer_id>:v1`; unique transfer row per settlement/transfer type. |
| Ledger entries | Unique `reservation_ledger_entries.idempotency_key`. |

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k users | Monolith plus Supabase RPCs is sufficient. Prioritize correctness, idempotency, and dashboard clarity. |
| 1k-100k users | Add pagination/status filters to reservation APIs, scheduled reconciliation for stale pending payments/no-shows, and retry queues for transfers/refunds. |
| 100k+ users | Split payment outbox processing into a worker or managed queue, partition ledger/event tables by time, and add operational dashboards for failed settlements and disputes. |

### Scaling Priorities

1. **First bottleneck:** Unpaginated private reservation dashboard reads. Add cursor pagination, status/date filters, and select only fields used by the UI.
2. **Second bottleneck:** Synchronous Stripe side effects in user actions. Add a durable outbox/retry worker when failed refunds/transfers become operationally frequent.
3. **Third bottleneck:** Ledger/event table growth. Index by reservation, Stripe object id, event id, and created month; archive old raw event payload details if needed.

## Anti-Patterns

### Anti-Pattern 1: Finalizing Payment From the Browser

**What people do:** After `stripe.confirmPayment`, the client calls a server action that inserts reservation/order records.

**Why it is wrong:** Browser callbacks can be skipped, repeated, or race with redirect flows. Async payment methods can succeed after the user leaves.

**Do this instead:** Precreate a pending reservation/order, then finalize from the signed Stripe webhook.

### Anti-Pattern 2: Destination Charge for Delayed Pickup Payout

**What people do:** Create the PaymentIntent with `transfer_data.destination` and later try to treat the money as held for pickup.

**Why it is wrong:** That transfers funds as part of the charge flow. It does not match the requirement to transfer the producer share only after QR confirmation.

**Do this instead:** Use a platform charge with `transfer_group`; create a separate Transfer after settlement.

### Anti-Pattern 3: One Status Field for Payment, Pickup, Refund, and Transfer

**What people do:** Add statuses like `paid`, `confirmed`, `transferred`, `no_show`, and `refunded` into one string field.

**Why it is wrong:** Payment, fulfillment, cancellation policy, refunds, and transfers can change independently and asynchronously.

**Do this instead:** Keep reservation lifecycle, PaymentIntent state, settlement state, transfer state, and refund state in separate rows/fields with ledger entries tying them together.

### Anti-Pattern 4: Plaintext QR Tokens

**What people do:** Store the QR token or reservation id directly and trust possession of the URL.

**Why it is wrong:** URLs leak through browser history, screenshots, logs, and referrers. A leaked token should not be enough to confirm pickup.

**Do this instead:** Store an HMAC/SHA-256 hash, require producer auth, expire tokens, and consume them atomically.

### Anti-Pattern 5: Refund and Transfer Math in UI

**What people do:** Calculate 24-hour cutoffs, 20% penalties, refunds, and producer compensation in React components.

**Why it is wrong:** Users can bypass UI, time zones drift, and dashboards become unreconcilable.

**Do this instead:** Compute policy decisions in one RPC and store the amounts with a policy version.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Stripe PaymentIntents | Server action creates platform PaymentIntent, client confirms with Payment Element, webhook finalizes. | Use `transfer_group`; do not set `transfer_data.destination` for delayed producer payout. |
| Stripe Webhooks | Route handler with raw body signature verification and event idempotency. | Process payment, refund, dispute, and transfer reconciliation events. |
| Stripe Refunds | Server action/outbox creates refunds from settlement rows. | Refund by PaymentIntent where possible; partial refunds use integer minor-unit amount. |
| Stripe Connect Transfers | Create Transfer to producer only after settlement says producer is payable. | Use `source_transaction` with the stored charge id to avoid available-balance timing failures. |
| Supabase Postgres/RLS | RPCs for transactions; RLS and route filters for access control. | Use `security definer` only when necessary and set `search_path`. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| UI -> server actions | Direct server action calls | UI validates for ergonomics; actions/RPCs enforce for security. |
| Server actions -> Stripe | Stripe SDK | Every create/update money call uses a deterministic idempotency key. |
| Server actions -> DB | `supabase.rpc(...)` | No multi-table direct insert sequences for reservation/payment state. |
| Stripe -> webhook route | HTTPS POST | Webhook route is unauthenticated by user session but authenticated by Stripe signature. |
| Webhook route -> DB | Admin client plus RPC | Store event first, then process idempotently. |
| Dashboard pages -> API/factories | Internal route reads plus factories | Use pagination and no-store for private data. |

## Suggested Build Order and Migration Sequence

1. **Correct schema foundations.**
   - Add pickup window columns and minor-unit amount columns.
   - Add `reservation_payment_intents`, `stripe_events`, `reservation_pickup_tokens`, `reservation_settlements`, `reservation_refunds`, `reservation_transfers`, and `reservation_ledger_entries`.
   - Add unique constraints and indexes for every idempotency boundary.
   - Replace conflicting reservation/order status constraints and triggers in one migration.
   - Regenerate `types/supabase.ts`.

2. **Add RPC domain core.**
   - Implement `create_reservation_checkout`, `record_payment_intent_created`, `finalize_reservation_payment`, `mark_reservation_payment_failed`, `confirm_reservation_pickup`, `settle_reservation_policy`, `record_refund_result`, and `record_transfer_result`.
   - Use row locks, explicit assertions, and deterministic ledger idempotency keys.

3. **Replace checkout creation.**
   - Replace `create-reservation-payment-intent.ts` with `create-reservation-checkout.ts`.
   - Create the platform PaymentIntent with `transfer_group` and metadata.
   - Remove payment debug logs and stop storing or logging client secrets.

4. **Add webhook finalization.**
   - Add `app/api/stripe/webhook/route.ts`.
   - Process `payment_intent.succeeded`, `payment_intent.payment_failed`, `payment_intent.processing`, `charge.refunded`, and `charge.dispute.created`.
   - Convert `/api/payment-success` into display-only redirect/status handling.

5. **Update client payment flow.**
   - Payment modal confirms only.
   - After confirmation, show pending/success based on reservation status read endpoint.
   - Remove `createReservation(...)` from the client payment modal.

6. **Build QR pickup confirmation.**
   - Generate QR tokens only after payment finalization.
   - Add client QR display and producer scanner/confirmation UI.
   - Confirm pickup through producer-authenticated server action/RPC.

7. **Build cancellation and no-show policy.**
   - Add client cancellation action.
   - Add producer/admin no-show marking after pickup window plus grace period.
   - Record policy version, refund amount, penalty amount, producer compensation, and platform retained amount.

8. **Build producer transfer flow.**
   - Create pending transfer rows from pickup/no-show settlements.
   - Create Stripe Transfers with `source_transaction`, `transfer_group`, metadata, and idempotency key.
   - Add retry/admin review path for transfer failures because Stripe does not automatically retry failed transfer requests.

9. **Consolidate dashboards and remove legacy paths.**
   - Replace raw reservation JSON dashboard output with typed rows/cards.
   - Paginate reservation reads.
   - Remove or quarantine legacy `create-reservation.ts` and direct payment-success order writes.

## Sources

- Local required context: `.planning/PROJECT.md`, `.planning/codebase/ARCHITECTURE.md`, `.planning/codebase/STRUCTURE.md`, `.planning/codebase/CONVENTIONS.md`, `.planning/codebase/CONCERNS.md`.
- Local implementation reviewed: `actions/create-reservation-payment-intent.ts`, `actions/create-reservation.ts`, `app/api/payment-success/route.ts`, `app/api/users/current/reservations/route.ts`, `features/stripe-payment/stripe-payment-modal.tsx`, `features/reservation-button/*`, `supabase/migrations/20250713000000_create_orders_reservations.sql`, `supabase/migrations/20250714000000_update_reservations_orders_workflow.sql`, `supabase/migrations/20250714000001_remove_reservation_columns.sql`.
- Stripe separate charges and transfers: https://docs.stripe.com/connect/separate-charges-and-transfers
- Stripe Payment Intents: https://docs.stripe.com/payments/payment-intents
- Stripe webhook signature/raw-body requirements: https://docs.stripe.com/webhooks
- Stripe idempotent requests: https://docs.stripe.com/api/idempotent_requests
- Stripe transfers: https://docs.stripe.com/api/transfers/create
- Stripe refunds and Connect refund behavior: https://docs.stripe.com/refunds
- Stripe manual capture authorization windows: https://docs.stripe.com/payments/place-a-hold-on-a-payment-method
- Next.js App Router route handlers and webhooks: https://nextjs.org/docs/app/api-reference/file-conventions/route
- Supabase database functions and `security definer` guidance: https://supabase.com/docs/guides/database/functions
- Supabase RLS and service-key behavior: https://supabase.com/docs/guides/database/postgres/row-level-security

---
*Architecture research for: Kiosq reservation pickup payments*
*Researched: 2026-04-29*
