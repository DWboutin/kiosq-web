# Reservation/Order Feature: Frontend Roadmap

This file outlines the frontend steps (features, components, hooks) for implementing the reservation and order feature.

## 1. Add Features

- Create /features/reservation-form/: Form for creating reservations (select variant, quantity, time; integrate Stripe Elements for payment).
- Create /features/vendor-reservation-dashboard/: List pending reservations, buttons for accept/reject/change.
- Extend /features/product-details/ with 'Reserve' button, using hooks for state.

## 2. Add Components

- In /components/ui/: Add ReservationCard.tsx for displaying details (accessible, keyboard-nav).
- Add ConfirmationModal.tsx for vendor actions.

## 3. Add Hooks

- Create use-create-reservation.ts: Handle action calls, error handling.
- Create use-vendor-reservations.ts: Fetch and invalidate data with React Query.
- Prefer inferred TS types, functional components.

## 4. UI/UX Enhancements

- Ensure accessibility (ARIA labels, focus management).
- Add skeletons for loading states (extend existing in /components/skeletons/).
- Integrate with locale-dropdown for translations.

## Next Steps

- Test integration with backend and Stripe.
