# Reservation/Order Feature: Integration Roadmap

This file outlines the integration, testing, and deployment steps for the reservation and order feature.

## 1. Vendor Stripe Connection

- Extend vendor-profile-form-drawer.tsx with 'Connect Stripe' button (OAuth redirect).
- Add callback route to store stripe_account_id in profiles.

## 2. Full Flow Integration

- Wire frontend forms to backend actions.
- Handle status transitions (e.g., pending to accepted creates order).
- Integrate notifications (e.g., via email or in-app) on updates.

## 3. Testing

- Unit tests for actions/hooks (functional style).
- E2E tests for flows (use Stripe test mode).
- Check dev server status before starting (per rules).

## 4. Deployment

- Push migration with approval.
- Deploy to Vercel/Supabase.
- Monitor for issues, ensure no Supabase resets.

## Edge Cases

- Handle payment failures, inventory shortages, status conflicts.
- Ensure multi-locale support with JSONB translations.
