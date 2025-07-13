# Reservation/Order Feature: Backend Roadmap

This file outlines the backend steps (actions, requests, utils) for implementing the reservation and order feature.

## 1. Add Server Actions

- Create `create-reservation.ts` in /actions/: Handle reservation creation, snapshot prices to order_items, create Stripe Payment Intent.
- Create `accept-reservation.ts`: Update status, capture payment, create linked order.
- Create `reject-reservation.ts` and `change-reservation.ts`: Update status, handle refunds/proposed_changes.
- Create `complete-order.ts`: Mark as 'completed', update inventory.
- Use functional programming: Pure functions for price calcs, infer TS types.

## 2. Add Requests and Invalidators

- In /utils/requests/: Add `get-user-reservations.ts`, `get-vendor-reservations.ts` for fetching with filters.
- In /utils/invalidators-hooks/: Add `use-reservations-invalidator.ts` to refresh caches post-updates.

## 3. Stripe Integration

- Add utils for Stripe API calls (e.g., createIntent, captureIntent) in /utils/stripe.ts.
- Handle webhooks in /app/api/stripe-webhook/route.ts for async events (e.g., payment success).

## 4. Validation and Security

- Use schemas (like in /features/utils/) for input validation.
- Ensure actions check auth and RLS via Supabase client.

## Next Steps

- Integrate with frontend features after backend is solid.
