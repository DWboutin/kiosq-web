# Feature Research

**Domain:** Brownfield local marketplace reservation, online payment, and in-person pickup confirmation
**Researched:** 2026-04-29
**Confidence:** HIGH for common pickup/payment patterns; MEDIUM for exact cancellation/no-show policy impact until Kiosq validates operations and legal language.

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Reservation eligibility on product detail | Clients need to know whether the selected variant can be reserved, at which kiosq, and for what pickup window before paying. | MEDIUM | Reuse existing product, kiosq, schedule, and reservation settings. Block checkout when the producer has no connected Stripe account, unpublished product, closed schedule, or missing pickup location. |
| Quantity, pickup location, and pickup window selection | Online pickup flows let customers choose pickup context before purchase; producers need operationally meaningful order details. | MEDIUM | Current modal supports quantity and kiosq only. Add explicit date/window derived from schedules before payment. |
| Clear cancellation/no-show policy disclosure before payment | Policy acceptance prevents surprise penalties and reduces later disputes. | LOW | Show the 24-hour free-cancel cutoff and 20% late-cancel/no-show obligation in the checkout confirmation step. Store policy version, accepted timestamp, cutoff timestamp, and penalty rate. |
| Server-owned payment finalization | Stripe recommends handling post-payment events server-side because client callbacks can be missed and async payment methods complete later. | HIGH | Treat webhook/idempotent backend finalization as table stakes, not polish. The success page should display state, not create orders. |
| One payment session per reservation/order | Stripe recommends one PaymentIntent per order/customer session to avoid double-charge behavior and preserve attempt history. | MEDIUM | Add a unique internal checkout/session ID and unique Stripe PaymentIntent constraint. Do not create separate records from both client confirm and return URL. |
| Paid-reserved status model | Clients and producers both need to distinguish pending payment, paid/reserved, ready, picked up, canceled, no-show, refund/penalty, and payout state. | HIGH | Current reservation/order statuses do not cleanly represent payment, pickup, refund, and producer payout separately. Requirements should define a canonical state machine before implementation. |
| Client receipt and QR pickup credential | A paid reservation needs a receipt and a pickup proof the producer can scan or manually verify. | MEDIUM | Generate a hard-to-guess, expiring, single-use QR token after payment succeeds. The QR should identify the reservation, not expose payment secrets or raw IDs directly. |
| Producer web scanner and manual lookup fallback | Pickup cannot depend on a native app or perfect QR scanning. Staff need camera scanning plus search/manual code entry. | MEDIUM | Use permission-gated browser camera scanning from the producer dashboard. Include invalid, expired, already used, wrong producer/kiosq, and already canceled states. |
| Pickup confirmation as fulfillment completion | Shopify and Square pickup flows explicitly move orders to picked up/completed states after handoff. Kiosq additionally uses this as the producer payout trigger. | HIGH | Producer scan is sufficient in v1. Confirmation must atomically mark pickup confirmed, consume the QR token, and enqueue/create the producer transfer once. |
| Producer delayed payout ledger | With separate charges and transfers, Kiosq must know how much to transfer after pickup and how refunds/penalties affect that amount. | HIGH | Track gross amount, platform fee, Stripe fees if available, producer payable, transferred amount, refund amount, penalty amount, and Stripe transfer IDs in minor units. |
| Cancellation before cutoff | Clients expect self-serve cancellation when policy allows it. Producers need inventory/slot release. | MEDIUM | More than 24 hours before reservation date: cancel without 20% penalty, refund according to the stored ledger, release/restore reserved quantity or slot. |
| Late cancellation/no-show handling | Producers need compensation for prepared or reserved inventory. Clients need consistent policy enforcement. | HIGH | Within 24 hours or no pickup: retain/charge 20% per project policy, refund the remainder when applicable, and record producer compensation separately from platform fees. |
| No-show marking workflow | Producers need a way to mark not picked up after the pickup window closes. | MEDIUM | Gate by pickup window end/max time. Require a short confirmation step and record actor/time/reason because this changes money outcomes. |
| Client dashboard: active and history views | Clients need to see reservation status, QR, pickup details, cancellation availability, receipts, refunds, and no-show outcomes. | MEDIUM | Replace current raw JSON dashboard with paginated cards/table. Split active reservations from history. |
| Producer dashboard: queue and history views | Producers need to prepare, scan, confirm, cancel, mark no-show, and reconcile payout status. | HIGH | Use filters for new/paid, ready, pickup today, confirmed, canceled, no-show, payout pending/transferred. Include customer name/order code only as needed for handoff. |
| Activity history/audit trail | Square-style order activity logs are standard for understanding payment, fulfillment, item changes, and refunds. | MEDIUM | Store client-visible and producer/admin-visible events separately if sensitive payment details are present. |
| Transactional status notifications | Pickup systems notify customers when orders are ready/picked up/canceled. | MEDIUM | For MVP, at minimum support on-screen confirmation and email-ready event hooks. Email/SMS delivery can be phased, but the event model should exist now. |
| Bilingual policy and status copy | The app is bilingual; payment/policy language must be clear in both French and English. | LOW | Use stable status keys and translated display labels. Do not hard-code policy copy in components. |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| "Paid now, producer paid after pickup" trust model | Clients know payment is recorded; producers know a real paid order exists; Kiosq can delay the transfer until handoff. | HIGH | Phrase as marketplace delayed transfer/payout, not legal escrow. This is the core differentiator for Kiosq's local producer model. |
| QR pickup confirmation directly tied to payout | Most pickup flows use QR/order lookup only for fulfillment. Kiosq can use confirmation as the business event that releases producer payout. | HIGH | Requires idempotent transfer creation and clear dashboard payout states. |
| Automatic 24-hour/20% policy calculation | Removes producer judgment calls and gives clients predictable consequences. | MEDIUM | Store cutoff and penalty at reservation creation so future policy changes do not rewrite older orders. |
| Producer-first pickup queue for market days | Local producers need a "today at this kiosq" operational view, not a generic ecommerce order table. | MEDIUM | Prioritize pickup date/time, customer initials/name, items, QR scan, and exception actions over ecommerce-style shipping fields. |
| Bilingual local-market reservation receipts | A polished bilingual reservation receipt can build trust in a local marketplace where pickup happens in person. | LOW | Include producer, kiosq address, pickup instructions, QR, policy summary, and support path. |
| Lightweight admin review flags | Rare exceptions can be flagged without building a dispute center. | MEDIUM | Use statuses/events like `admin_review_required` for payment or policy anomalies. Full mediation tooling stays out of v1. |
| No-show prevention reminders | Reminder emails/SMS and policy reminders reduce no-shows once the core loop is working. | MEDIUM | Add after webhook/status foundations. Acuity treats reminders and policy acknowledgement as common no-show reduction tools. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Legal escrow framing | Sounds reassuring to clients and producers. | Stripe states escrow has a precise legal meaning and does not support escrow accounts. Product/legal exposure is not worth the wording. | Say "online payment with producer payout after pickup confirmation" and keep ledger/payout language precise. |
| Manual capture as the default pickup-payment model | It sounds like a natural way to hold money until pickup. | Stripe card authorization windows are usually days, while pickup windows can be later. Expired authorizations would cancel payment. | Charge up front on the platform and delay producer transfer until pickup confirmation. |
| Full dispute-resolution operations center | Seems useful for every edge case. | It creates large workflow, staffing, legal, and data requirements before volume proves the need. | Add a simple admin-review flag, reason field, and support contact path. |
| Dual client and producer pickup confirmation in v1 | Feels more balanced. | It slows handoff and adds ambiguous states when one party forgets to confirm. | Use producer scan as v1 confirmation; add admin review for disputes. |
| Multi-producer cart settlement in first milestone | Improves shopping convenience. | It multiplies payment splitting, cancellation, QR, pickup, and payout complexity. | Preserve one-producer-per-reservation until the single-producer flow is stable. |
| Native mobile scanner app | Feels professional for QR pickup. | It expands platform, release, auth, and camera-permission work. | Use the producer web dashboard scanner and manual lookup fallback. |
| Fully configurable cancellation policies per producer | Producers may want custom windows/fees. | Custom policy math makes checkout, refunds, support, and translations much harder. | Launch with the project-wide 24-hour/20% policy. Revisit configurability after observing real producer needs. |
| QR-only pickup with no search/manual fallback | QR scanning looks clean. | Broken cameras, low light, damaged phones, and network issues can block pickup. | Provide manual order code/name lookup with the same authorization and audit trail. |
| Client-side payment success route as source of truth | It is fast to implement. | It is fragile for redirects, retries, async payment methods, and duplicate order writes. | Webhook-backed finalization plus idempotent database writes. |
| Editing paid reservations without recalculating money | Producers and clients may request quick changes. | Item/time changes after payment affect refunds, penalties, payout, tax/fees, and audit history. | Defer paid-order change flows; support cancel/rebook or admin review first. |

## Feature Dependencies

```text
Reservation eligibility and pickup window
    -> requires product, variant, kiosq, schedule, and reservation settings
    -> enables checkout confirmation

Checkout confirmation with policy acceptance
    -> requires pricing in minor units and policy snapshot
    -> enables PaymentIntent creation

PaymentIntent creation
    -> requires idempotency key, transfer_group, metadata IDs, and Stripe account eligibility
    -> enables webhook finalization

Webhook finalization
    -> requires unique payment/order constraints and atomic reservation/order/item writes
    -> enables client receipt, QR token generation, and dashboards

QR token generation
    -> requires paid-reserved reservation
    -> enables producer scan confirmation

Producer scan confirmation
    -> requires producer authorization, valid token, pickup window checks, and idempotent state transition
    -> enables producer transfer/payout ledger update

Cancellation/no-show policy
    -> requires policy snapshot, pickup cutoff, refund/penalty calculation, and payment ledger
    -> affects client dashboard, producer dashboard, and payout transfer amount

Activity history
    -> records checkout, payment, cancellation, scan, no-show, refund, and transfer events
    -> powers client/producer history views and admin review

Full dispute tooling
    -> conflicts with MVP scope
```

### Dependency Notes

- **Status model before dashboards:** Requirements should define canonical payment, reservation, fulfillment, refund, and payout states before building dashboard UI. Otherwise the UI will bake in the current incomplete status split.
- **Webhook finalization before QR:** QR generation must happen only after payment succeeds and the reservation/order exists, or a client could receive pickup proof for an unpaid/failed reservation.
- **Policy snapshot before payment:** Store the cancellation cutoff, penalty rate, and accepted policy version at checkout so refunds and no-show decisions are deterministic later.
- **Pickup confirmation before transfer:** Producer payout must depend on an idempotent pickup-confirmed transition; scanning the same QR twice must not create duplicate transfers.
- **Manual fallback shares the same backend path as QR:** Search/manual code confirmation must call the same endpoint as QR scan so audit and payout behavior remain identical.

## MVP Definition

### Launch With (v1)

Minimum viable product - what's needed to validate the concept.

- [ ] Single-producer reservation checkout - select quantity, kiosq, pickup date/window, and confirm the visible 24-hour/20% policy before payment.
- [ ] Stripe PaymentIntent/payment session creation with one internal reservation checkout session and enough metadata to reconcile order, producer, policy, and transfer group.
- [ ] Webhook-owned payment finalization - create paid reservation/order/order items atomically and idempotently after payment success.
- [ ] Client paid reservation receipt - show pickup details, policy summary, status, and QR pickup credential.
- [ ] Client reservations dashboard - active/history list with QR, pickup details, cancel availability, payment/refund status, and no-show/late-cancel outcomes.
- [ ] Producer reservations dashboard - operational queue with status filters, item details, pickup date/kiosq, cancellation/no-show actions, and payout status.
- [ ] Producer web QR scanner plus manual lookup - validate QR/order code, show order details, handle invalid/expired/already-used states, and confirm handoff.
- [ ] Pickup confirmation triggers idempotent producer transfer - record transfer state and prevent duplicate transfers.
- [ ] Cancellation before cutoff - self-serve client cancellation more than 24 hours before reservation date, with full policy-compliant refund/ledger update.
- [ ] Late cancellation and no-show policy handling - calculate retained 20%, refund remainder when applicable, and record producer compensation.
- [ ] Activity history - record status, payment, cancellation, no-show, pickup, refund, and transfer events for both dashboards.
- [ ] Bilingual display strings for policy, statuses, receipts, errors, and dashboard actions.

### Add After Validation (v1.x)

Features to add once core is working.

- [ ] Ready-for-pickup producer status - add if producers need prep tracking between paid and pickup-confirmed.
- [ ] Automated email reminders and ready/canceled/picked-up notifications - add after event model and templates exist.
- [ ] Producer no-show analytics - add when enough reservations exist to identify repeat problems.
- [ ] Admin review queue - add when exception volume proves manual review needs a real interface.
- [ ] Exportable reservation/payout reports - add after producers request reconciliation outside the dashboard.
- [ ] Bulk producer actions - add after producers have enough daily pickup volume to need batch preparation/status updates.
- [ ] Inventory reservation holds - add if overselling becomes visible after paid reservation launch.

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] Multi-producer cart and split settlement - defer until single-producer reservations, QR pickup, and payout ledger are stable.
- [ ] Configurable producer cancellation policies - defer until Kiosq has support/legal confidence and enough producer variance to justify it.
- [ ] Native mobile scanner app - defer because web scanning satisfies v1 and avoids app release overhead.
- [ ] Full dispute/mediation suite - defer until support volume and policy exceptions justify the operational investment.
- [ ] Saved payment method for later no-show charge - defer; v1 policy can work from up-front charge and partial refund/retention.
- [ ] Stripe funds segregation private preview - consider only if Kiosq gains access and needs stronger platform-balance separation.

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Reservation eligibility and pickup window selection | HIGH | MEDIUM | P1 |
| Checkout policy acceptance | HIGH | LOW | P1 |
| Server-owned payment finalization | HIGH | HIGH | P1 |
| Canonical paid-reserved status model | HIGH | HIGH | P1 |
| Client QR receipt | HIGH | MEDIUM | P1 |
| Producer QR scan confirmation | HIGH | MEDIUM | P1 |
| Delayed producer transfer after pickup | HIGH | HIGH | P1 |
| Client active/history dashboard | HIGH | MEDIUM | P1 |
| Producer queue/history dashboard | HIGH | HIGH | P1 |
| Cancellation before cutoff | HIGH | MEDIUM | P1 |
| Late-cancel/no-show penalty ledger | HIGH | HIGH | P1 |
| Activity history | MEDIUM | MEDIUM | P1 |
| Transactional email/reminder delivery | MEDIUM | MEDIUM | P2 |
| Ready-for-pickup prep status | MEDIUM | LOW | P2 |
| Admin review queue | MEDIUM | MEDIUM | P2 |
| Exportable payout/reservation reports | MEDIUM | LOW | P2 |
| Bulk producer actions | LOW | MEDIUM | P3 |
| Multi-producer cart | MEDIUM | HIGH | P3 |
| Native scanner app | LOW | HIGH | P3 |
| Full dispute center | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | Competitor A | Competitor B | Our Approach |
|---------|--------------|--------------|--------------|
| Pickup preparation and completion | Shopify POS supports preparing pickup orders, notifying customers, QR lookup on pickup slips, and marking picked up. | Square Order Manager uses statuses such as new, in progress, ready, completed/canceled, and picked up actions. | Kiosq should use paid/reserved, optional ready, pickup-confirmed, canceled, no-show, and payout status. Pickup confirmation is not just fulfillment; it releases producer payout. |
| Operational status history | Square exposes an activity log with order creation, payment, fulfillment updates, item changes, and refunds. | Shopify separates ready-for-pickup and picked-up fulfillment actions. | Kiosq should build an event history from day one because money, policy, and pickup all depend on auditable state transitions. |
| Cancellation and refund choices | Tock supports cancellation with no/full/partial refund and separate comp/refund flows. | Acuity emphasizes policy acknowledgment, payment at booking, and reminders to limit no-shows. | Kiosq should avoid ad hoc refund choices in MVP. Apply the stored 24-hour/20% policy automatically and flag exceptions for admin review. |
| QR validation | Ticket Tailor shows valid, already checked-in, and invalid QR states and supports manual search. | Shopify uses QR on pickup slips to find the order in POS. | Kiosq should issue a client QR pickup credential, consume it once on producer scan, and show explicit invalid/expired/already-used/wrong-producer states. |
| Marketplace delayed payout | Stripe Connect separate charges and transfers decouple the platform charge from later transfers to connected accounts. | Stripe docs note manual capture has authorization windows and that escrow has a precise legal definition Stripe does not support. | Kiosq should charge up front, track producer payable internally, and transfer after pickup confirmation without calling the product "escrow." |

## Sources

- Kiosq project context: `.planning/PROJECT.md` (HIGH) - core value, active requirements, out-of-scope decisions, and payment architecture direction.
- Kiosq codebase architecture: `.planning/codebase/ARCHITECTURE.md` (HIGH) - existing Next.js/Supabase/Stripe surfaces and reservation/payment path.
- Kiosq codebase concerns: `.planning/codebase/CONCERNS.md` (HIGH) - duplicate order, payment unit, webhook, raw dashboard, and authorization risks.
- Stripe Connect separate charges and transfers: https://docs.stripe.com/connect/marketplace/tasks/accept-payment/separate-charges-and-transfers (HIGH) - charge/transfer model, transfer groups, webhooks, and marketplace responsibility.
- Stripe manual capture/authorization holds: https://docs.stripe.com/payments/place-a-hold-on-a-payment-method (HIGH) - authorization expiry windows and why manual capture is not the default fit for longer pickup windows.
- Stripe webhooks for payment events: https://docs.stripe.com/webhooks/handling-payment-events (HIGH) - payment_intent.succeeded, disputes, signature verification, and offline payment event handling.
- Stripe PaymentIntents API: https://docs.stripe.com/api/payment_intents (HIGH) - one PaymentIntent per order/customer session and lifecycle tracking.
- Stripe idempotent requests: https://docs.stripe.com/api/idempotent_requests?lang=node (HIGH) - safe retries and idempotency-key behavior.
- Stripe metadata: https://docs.stripe.com/metadata (HIGH) - metadata limits, reconciliation use, webhook availability, and sensitive-data warning.
- Stripe legacy/manual transfers: https://docs.stripe.com/connect/legacy-transfers (HIGH) - escrow wording warning and manual transfer timing.
- Shopify POS pickup orders: https://help.shopify.com/en/manual/sell-in-person/shopify-pos/order-management/pickup-in-store-for-online-orders (MEDIUM) - prepare, notify, QR lookup, and mark picked up patterns.
- Square order fulfillment: https://squareup.com/help/us/en/article/6923-pickup-orders-on-square-point-of-sale (MEDIUM) - order status, payment status, pickup actions, and activity log expectations.
- Tock cancellation/refund reservations: https://tock.zendesk.com/hc/en-us/articles/360030920052-Cancelling-and-Refunding-a-Reservation (MEDIUM) - cancellation with no/full/partial refund and slot handling.
- Acuity limiting no-show appointments: https://help.acuityscheduling.com/hc/en-us/articles/16676924217101-Limiting-no-show-appointments (MEDIUM) - cancellation policy acknowledgement, booking payment, and reminders.
- Ticket Tailor QR check-in: https://help.tickettailor.com/en/articles/5151698-how-to-check-in-your-attendees-with-the-check-in-app-at-your-event (MEDIUM) - scan, already-used, invalid-code, live check-in, and manual search patterns.

---
*Feature research for: Kiosq reservation pickup payments*
*Researched: 2026-04-29*
