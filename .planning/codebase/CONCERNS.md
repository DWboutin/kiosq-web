# Codebase Concerns

**Analysis Date:** 2026-04-29

## Tech Debt

**Reservation/payment workflow spans unrelated surfaces:**
- Issue: PaymentIntent creation, Stripe confirmation, reservation insertion, order insertion, and payment-return handling are split across a server action, client modal, another server action, and a public route.
- Files: `actions/create-reservation-payment-intent.ts`, `features/stripe-payment/stripe-payment-modal.tsx`, `actions/create-reservation.ts`, `app/api/payment-success/route.ts`
- Why: The reservation feature is implemented as incremental app code around Stripe Elements instead of a single backend-owned workflow.
- Impact: Duplicate orders, orphaned reservations, inconsistent payment totals, and missing Stripe idempotency are easy to introduce.
- Fix approach: Move payment finalization to a single server-owned path backed by Stripe webhooks and an idempotent database function/RPC that writes `reservations`, `orders`, and `order_items` atomically.

**Multi-step writes without database transactions:**
- Issue: Related rows are inserted, updated, or deleted through several Supabase calls with no rollback when a later operation fails.
- Files: `actions/create-product.ts`, `actions/create-product-variant.ts`, `actions/update-product-variant.ts`, `actions/delete-product-variant.ts`, `actions/create-reservation.ts`
- Why: Supabase client calls are used directly in server actions instead of transactional Postgres functions.
- Impact: Products can exist without variants/prices, orders can exist without order items, and image cleanup can diverge from database rows.
- Fix approach: Use Postgres RPC functions for multi-table mutations and keep server actions as validation/orchestration wrappers.

**Authenticated dashboard data uses internal API fetches and cache tags:**
- Issue: Server components call `/api/users/current/**` through `fetchServerAuthenticated` while forwarding cookies and preserving `next.revalidate` caching.
- Files: `utils/fetch-server-authenticated.ts`, `utils/cache-keys.ts`, `app/[locale]/dashboard/products/page.tsx`, `app/[locale]/dashboard/your-kiosqs/page.tsx`, `app/[locale]/dashboard/schedules/page.tsx`, `app/[locale]/dashboard/reservations/page.tsx`
- Why: One cache-key abstraction is shared across public catalog data and private dashboard data.
- Impact: Private dashboard data has 24-hour staleness and relies on framework cache behavior around cookie-bearing fetches.
- Fix approach: Use direct server-side Supabase queries or `cache: "no-store"` for `/api/users/current/**`; reserve `next.revalidate` tags for public catalog data.

**Authorization is split between route code and RLS:**
- Issue: Some "current user" routes authenticate the caller but do not constrain the queried record to the caller in SQL.
- Files: `app/api/users/current/kiosq/[kiosqId]/route.ts`, `app/api/users/current/profiles/[profileId]/kiosqs/route.ts`, `app/api/users/current/profiles/[profileId]/schedules/route.ts`, `supabase/migrations/20250701000001_update_kiosqs_status_and_rls.sql`, `supabase/migrations/20250702000000_create_schedules_table.sql`
- Why: Route handlers rely on table RLS policies for ownership filtering.
- Impact: Broad public RLS policies on `kiosqs` and `schedules` make authenticated "current user" endpoints behave like public lookup endpoints.
- Fix approach: Add owner joins/filters in every `/api/users/current/**` route and narrow public RLS to published, non-deleted records only.

**Broad generated-data and type casts hide contract drift:**
- Issue: Application code frequently casts Supabase responses through `unknown` to app types.
- Files: `actions/create-reservation.ts`, `actions/create-product-variant.ts`, `actions/update-product-variant.ts`, `app/api/profiles/vendors/closests/route.ts`, `utils/data-table-utils.ts`, `types/supabase.ts`
- Why: Nested Supabase select shapes are not modeled with precise TypeScript types.
- Impact: Schema changes can compile while runtime factories break on missing arrays, null relationships, or renamed columns.
- Fix approach: Define explicit response types per query/factory and regenerate `types/supabase.ts` after migration changes.

## Known Bugs

**Reservation modal confirm bypasses form validation:**
- Symptoms: The modal confirm button can create a PaymentIntent even when the nested reservation form has validation errors or no `kiosqId`.
- Files: `components/ui/modal.tsx`, `features/reservation-button/components/reservation-button-modal.tsx`, `features/reservation-button/components/reservation-button-modal-form.tsx`
- Trigger: Open a reservation modal, leave kiosk unselected, then click the modal confirm action.
- Workaround: Not detected.
- Root cause: `ReservationButtonModalForm` owns the `react-hook-form` state, while `Modal` executes the confirm `action` from a footer button outside that form.
- Blocked by: Not applicable.

**Payment success can create inconsistent or duplicate orders:**
- Symptoms: Orders can be inserted by `actions/create-reservation.ts` after client-side `confirmPayment`, and also by `app/api/payment-success/route.ts` when Stripe redirects back.
- Files: `features/stripe-payment/stripe-payment-modal.tsx`, `actions/create-reservation.ts`, `app/api/payment-success/route.ts`, `supabase/migrations/20250713000000_create_orders_reservations.sql`
- Trigger: Payment methods that redirect to `/api/payment-success`, page refreshes of the return URL, or manual hits with a succeeded `payment_intent`.
- Workaround: Not detected.
- Root cause: No unique constraint/idempotency around `orders.stripe_payment_intent_id`; payment-return logic is separate from reservation creation.
- Blocked by: Stripe webhook/idempotency implementation.

**Order amount units differ between creation paths:**
- Symptoms: `actions/create-reservation.ts` stores `orders.total_amount` in cents, while `app/api/payment-success/route.ts` stores `paymentIntent.amount / 100`.
- Files: `actions/create-reservation.ts`, `app/api/payment-success/route.ts`, `supabase/migrations/20250713000000_create_orders_reservations.sql`
- Trigger: Compare orders created by the client-confirmation path with orders created by the payment-return route.
- Workaround: Not detected.
- Root cause: No shared money representation helper or database constraint around currency/minor units.
- Blocked by: Payment workflow consolidation.

**Dashboard schedules page crashes for users without a vendor profile:**
- Symptoms: The page dereferences `vendorProfiles[0].id` even when `vendorProfiles` is empty.
- Files: `app/[locale]/dashboard/schedules/page.tsx`
- Trigger: Authenticated user without a vendor profile opens the schedules dashboard page.
- Workaround: Create a vendor profile first.
- Root cause: The CTA and client component props are not guarded the same way the `schedules` fetch is guarded.
- Blocked by: Not applicable.

**Schedule Sunday open-time constraint checks the wrong column:**
- Symptoms: Invalid Sunday open times can pass or fail based on `sunday_close_time`.
- Files: `supabase/migrations/20250702000002_update_schedule_time_format.sql`
- Trigger: Insert or update a schedule where `sunday_open_time` has invalid minutes and `sunday_close_time` has valid minutes.
- Workaround: Application form validation may prevent common invalid values.
- Root cause: `sunday_open_time_format` uses `sunday_close_time % 100 < 60`.
- Blocked by: Corrective migration.

**DataTable selection callback runs during render:**
- Symptoms: Parent state updates from `onSelectionChange` can fire while `DataTableComponent` renders.
- Files: `components/ui/data-table.tsx`
- Trigger: Select at least one row in a table that passes `onSelectionChange`.
- Workaround: Not detected.
- Root cause: `onSelectionChange(selectedRows)` runs in the component body instead of an effect keyed by `rowSelection`.
- Blocked by: Not applicable.

**Reservations dashboard renders raw JSON payloads:**
- Symptoms: The dashboard displays full reservation objects in `<pre>` blocks and logs the same data to the console.
- Files: `app/[locale]/dashboard/reservations/page.tsx`, `components/client-pages/dashboard-profile-reservations/dashboard-profile-reservations.tsx`, `utils/factories/authenticated-user-reservations-factory.ts`
- Trigger: Open the reservations dashboard with reservation data.
- Workaround: Not detected.
- Root cause: The reservations client page is a raw data renderer rather than a finished table/card UI.
- Blocked by: Reservation dashboard UI implementation.

## Security Considerations

**Stripe client secrets and payment metadata are logged:**
- Risk: PaymentIntent client secrets, Stripe metadata, purchase data, and reservation details can appear in browser/server logs.
- Files: `actions/create-reservation-payment-intent.ts`, `features/stripe-payment/stripe-payment-provider.tsx`, `features/stripe-payment/stripe-payment-modal.tsx`, `app/api/payment-success/route.ts`
- Current mitigation: Not detected.
- Recommendations: Remove all payment `console.log` calls, log only redacted identifiers, and add a lint rule or review check for sensitive payment logging.

**Stripe return route is not a verified webhook:**
- Risk: A public GET route finalizes order records based on a `payment_intent` query parameter and a Stripe retrieve call, with no webhook signature verification and no idempotency key.
- Files: `app/api/payment-success/route.ts`, `features/stripe-payment/stripe-payment-modal.tsx`, `roadmap/reservation-backend.md`
- Current mitigation: The route checks `paymentIntent.status === "succeeded"`.
- Recommendations: Treat `/api/payment-success` as display-only and finalize payments in a Stripe webhook route with signature verification, event idempotency, and transaction-backed writes.

**User-generated map popup HTML is interpolated with `setHTML`:**
- Risk: Vendor or kiosk names/descriptions can inject HTML into Mapbox popups.
- Files: `components/ui/map-view.tsx`, `app/api/profiles/vendors/closests/route.ts`, `utils/factories/closests-vendor-profiles-factory.ts`
- Current mitigation: Not detected in `createPopupHTML`.
- Recommendations: Use DOM APIs/React-rendered popup content or escape all interpolated fields before passing content to `mapboxgl.Popup().setHTML`.

**Public RLS exposes more kiosk and schedule data than public APIs intend:**
- Risk: The anon Supabase key can read all non-deleted `kiosqs` and all `schedules`, including records that application APIs filter differently.
- Files: `supabase/migrations/20250701000001_update_kiosqs_status_and_rls.sql`, `supabase/migrations/20250702000000_create_schedules_table.sql`, `app/api/kiosqs/[profileId]/route.ts`, `app/api/profiles/vendors/closests/route.ts`
- Current mitigation: Public API routes apply published/active filters in application code.
- Recommendations: Align RLS with public visibility rules; make draft/private kiosk and schedule data owner/admin-only.

**Admin routes have no server-side role guard:**
- Risk: Non-admin authenticated users can load admin pages and category management UI; mutations rely on database/RPC failure.
- Files: `app/[locale]/dashboard/admin/layout.tsx`, `app/[locale]/dashboard/admin/categories/page.tsx`, `components/sections/dashboard-admin-tabs.tsx`, `utils/dashboard-navigation.tsx`
- Current mitigation: Dashboard navigation filters admin links by role in `utils/filter-links-from-role.ts`; category RLS requires admin in `supabase/migrations/20250418000006_category_admin_policies.sql`.
- Recommendations: Add server-side admin checks in the admin layout or middleware and return a 404/redirect before rendering admin UI.

**Service-role Supabase client is available to app actions:**
- Risk: A server action that imports the admin client can bypass RLS if it performs direct table operations.
- Files: `utils/supabase/admin.ts`, `actions/delete-product-category.ts`
- Current mitigation: `actions/delete-product-category.ts` calls `delete_category` RPC, which checks `auth.uid()` for admin role.
- Recommendations: Keep service-role usage isolated to narrowly named server-only modules, add `import "server-only"`, and prefer user-scoped clients for RPCs that depend on `auth.uid()`.

**Stripe Connect OAuth state is deterministic:**
- Risk: The CSRF state value is `Buffer.from(user.id).toString("base64")`, making it predictable for a given user.
- Files: `actions/get-stripe-connect-link.ts`, `app/api/stripe/connect/callback/route.ts`
- Current mitigation: State is stored in an `httpOnly`, `sameSite: "lax"` cookie and compared on callback.
- Recommendations: Generate a cryptographically random nonce, bind it to the user/session server-side, and expire it after one use.

## Performance Bottlenecks

**Closest vendors endpoint accepts unbounded location parameters:**
- Problem: `radius` and `limit` query parameters are parsed without numeric validation or upper bounds.
- Files: `app/api/profiles/vendors/closests/route.ts`, `utils/requests/get-closests-vendor-profiles.ts`, `supabase/migrations/20250703000004_filter_published_kiosqs_only.sql`
- Measurement: Not measured.
- Cause: `parseInt`/`parseFloat` results are passed directly to PostGIS RPC and Supabase `.limit()`.
- Improvement path: Validate finite coordinates, clamp radius/limit, reject `NaN`, and add API-level rate limiting.

**Slug availability scans all profiles in application code:**
- Problem: Slug checks fetch every non-deleted profile's `slug_translations` and scan JSON in Node.
- Files: `app/api/profiles/check-slug/route.ts`, `features/vendor-profile-form-drawer/utils/vendor-profile-validation-schema.ts`, `supabase/migrations/20250626000000_add_unique_slug_constraint.sql`
- Measurement: Not measured.
- Cause: The API duplicates database uniqueness logic instead of querying an indexed function/operator for one candidate slug.
- Improvement path: Add a database RPC for slug availability or query JSONB with indexed predicates and a strict `limit(1)`.

**Reservations endpoint loads nested reservation graphs without pagination:**
- Problem: The route returns every matching reservation with nested orders, order items, kiosk, and profile data.
- Files: `app/api/users/current/reservations/route.ts`, `utils/factories/authenticated-user-reservations-factory.ts`, `hooks/use-current-user-profile-id-reservations.ts`
- Measurement: Not measured.
- Cause: No `limit`, cursor, date filter, or status filter is applied.
- Improvement path: Add pagination and status/date filters, select only fields used by the dashboard, and use a typed view/RPC for the joined shape.

**Geocoding is synchronous and uncached during kiosk writes:**
- Problem: Create/update kiosk actions block on OpenStreetMap Nominatim for every address write.
- Files: `actions/create-kiosq.ts`, `actions/update-kiosq.ts`, `utils/geocoding.ts`
- Measurement: Not measured.
- Cause: `geocodeAddressWithFallback` has one external provider, no timeout, no cache, and no queued retry.
- Improvement path: Cache geocoding results by normalized address, add timeout/retry limits, and consider an async background update for coordinates.

**Data table sorting is fully client-side for whole datasets:**
- Problem: `DataTable` sorts hierarchical rows in memory and renders all rows.
- Files: `components/ui/data-table.tsx`, `utils/data-table-utils.ts`, `features/categories-table/categories-table.tsx`
- Measurement: Not measured.
- Cause: TanStack Table is used without pagination/virtualization in `components/ui/data-table.tsx`.
- Improvement path: Add pagination or virtualization for admin tables and keep hierarchical sort logic covered by unit tests.

## Fragile Areas

**Payment and reservation state machine:**
- Why fragile: Payment status, reservation status, order status, and Stripe IDs are updated in several places with different assumptions.
- Files: `actions/create-reservation-payment-intent.ts`, `actions/create-reservation.ts`, `app/api/payment-success/route.ts`, `supabase/migrations/20250714000000_update_reservations_orders_workflow.sql`
- Common failures: Duplicate records, wrong total units, orders without reservations, and statuses that bypass the database transition triggers.
- Safe modification: Change payment/reservation behavior through one backend entry point and one migration-backed status model.
- Test coverage: No project test runner, no payment tests, and no route/action tests are detected in `package.json` or source files.

**Cache invalidation for private dashboard data:**
- Why fragile: Shared `cacheKeys` mix Next.js tags and React Query keys across public and private data, with several broad 24-hour revalidation windows.
- Files: `utils/cache-keys.ts`, `actions/revalidators/product-revalidator.ts`, `actions/revalidators/profile-revalidator.ts`, `actions/revalidators/kiosqs-revalidator.ts`, `utils/fetch-server-authenticated.ts`
- Common failures: Stale dashboard pages after mutations, stale reservation state after payment, and accidental private-data caching.
- Safe modification: Split public cache keys from private query keys and use `no-store` for authenticated server fetches.
- Test coverage: No cache invalidation tests are detected.

**Storage path and RLS policy coupling:**
- Why fragile: Upload actions must produce paths that match storage RLS policies exactly.
- Files: `utils/upload-image.ts`, `actions/update-profile-image.ts`, `actions/update-profile-banner-image.ts`, `actions/create-user-vendor-profile.ts`, `actions/create-product-variant.ts`, `supabase/migrations/20250511000001_update_profile_images_paths.sql`, `supabase/migrations/20250517000000_update_product_tables.sql`
- Common failures: Upload succeeds in UI validation but fails storage RLS, old image cleanup misses files, or bucket policies diverge from path builders.
- Safe modification: Centralize bucket/path builders and cover them with tests against expected policy path formats.
- Test coverage: No storage upload tests are detected.

**Supabase migrations contain stateful schema rewrites and triggers:**
- Why fragile: Several migrations rename/drop columns, recreate tables, add triggers, and encode business workflow rules in PL/pgSQL.
- Files: `supabase/migrations/20250517000002_force_remove_deprecated_columns.sql`, `supabase/migrations/20250517000006_remove_product_prices_partitioning.sql`, `supabase/migrations/20250714000000_update_reservations_orders_workflow.sql`, `supabase/migrations/20250702000002_update_schedule_time_format.sql`
- Common failures: Local and remote schemas diverge, generated types become stale, or trigger behavior conflicts with app-level status updates.
- Safe modification: Run Supabase migration resets in a disposable database before schema changes and regenerate `types/supabase.ts`.
- Test coverage: No migration verification tests or schema drift checks are detected.

**Map rendering uses imperative DOM and a hard-coded token:**
- Why fragile: Mapbox setup, marker DOM, popup HTML, image fallbacks, and token configuration live in one component.
- Files: `components/ui/map-view.tsx`
- Common failures: Token rotation requires code changes, marker popup content is hard to sanitize, and locale changes do not reinitialize the map because `locale` is not in the initialization effect dependencies.
- Safe modification: Move the token to environment/config, escape or DOM-render popup content, and isolate marker creation helpers.
- Test coverage: No component or browser tests are detected.

**GSD workflow dependencies are local repo tooling:**
- Why fragile: Project workflow behavior comes from `.codex/skills/*/SKILL.md` and `.codex/get-shit-done/**`, and `git status --short` shows `.codex/` as untracked in this worktree.
- Files: `.codex/skills/gsd-map-codebase/SKILL.md`, `.codex/get-shit-done/templates/codebase/concerns.md`, `.planning/codebase/TESTING.md`
- Common failures: Teammates or future agents may not have the same local GSD command behavior.
- Safe modification: Decide whether `.codex/` is committed project tooling or machine-local tooling; document that decision in repo setup docs.
- Test coverage: Not applicable to app runtime.

## Scaling Limits

**Private dashboard list endpoints:**
- Current capacity: Not measured; endpoints return all matching rows for several dashboard views.
- Files: `app/api/users/current/reservations/route.ts`, `app/api/users/current/profiles/[profileId]/kiosqs/route.ts`, `app/api/users/current/profiles/[profileId]/schedules/route.ts`
- Limit: Large vendors accumulate unpaginated reservations, kiosqs, and schedules.
- Symptoms at limit: Slow dashboard SSR, large JSON payloads, and expensive client hydration.
- Scaling path: Add pagination, field-specific selects, and status/date filters to authenticated list endpoints.

**Geospatial search:**
- Current capacity: Not measured; default API limit is 50 and client helper default is 20.
- Files: `app/api/profiles/vendors/closests/route.ts`, `supabase/migrations/20250703000001_add_postgis_geolocation.sql`, `supabase/migrations/20250703000004_filter_published_kiosqs_only.sql`
- Limit: Unbounded `radius`/`limit` requests and high-cardinality coordinate query keys.
- Symptoms at limit: Slow PostGIS scans, inflated database CPU, and many near-duplicate client cache entries.
- Scaling path: Clamp query parameters, round coordinates for cache keys, and add database indexes/checks matched to the RPC query.

**Category and profile slug lookup:**
- Current capacity: Not measured; slug availability scans all profile slug JSON.
- Files: `app/api/profiles/check-slug/route.ts`, `supabase/migrations/20250626000000_add_unique_slug_constraint.sql`, `supabase/backups/categories_rows_20250511_01.sql`
- Limit: Profile count growth increases slug-check latency and response payload size.
- Symptoms at limit: Slow vendor profile editing and unnecessary database-to-Node data transfer.
- Scaling path: Replace application scan with an indexed database lookup and keep backup/seed data formatted as maintainable SQL.

## Dependencies at Risk

**Stripe payment lifecycle:**
- Risk: Payments depend on client-side confirmation and a return URL instead of signed webhook events.
- Files: `actions/create-reservation-payment-intent.ts`, `features/stripe-payment/stripe-payment-modal.tsx`, `app/api/payment-success/route.ts`, `roadmap/reservation-backend.md`
- Impact: Async payment methods, retries, and disputed/failed events can leave app state inconsistent.
- Migration plan: Add a Stripe webhook route, store processed event IDs, and make order creation idempotent by `stripe_payment_intent_id`.

**OpenStreetMap Nominatim geocoding:**
- Risk: The app relies on a public geocoding endpoint without local caching, timeout handling, or an alternate provider.
- Files: `utils/geocoding.ts`, `actions/create-kiosq.ts`, `actions/update-kiosq.ts`
- Impact: Kiosk creation/update can slow down or lose coordinates when the external service throttles or fails.
- Migration plan: Cache normalized address results and add a configurable provider abstraction for Mapbox/Google/fallback services.

**Mapbox token configuration:**
- Risk: A public Mapbox token is hard-coded in source.
- Files: `components/ui/map-view.tsx`
- Impact: Token rotation and environment-specific restrictions require code changes.
- Migration plan: Move the token to a `NEXT_PUBLIC_MAPBOX_TOKEN` environment variable and restrict the token to allowed domains in Mapbox.

**Local GSD skills/tooling:**
- Risk: The repo's planning workflow depends on `.codex/skills` and `.codex/get-shit-done` files that are not tracked in this worktree.
- Files: `.codex/skills/gsd-map-codebase/SKILL.md`, `.codex/skills/gsd-execute-phase/SKILL.md`, `.codex/get-shit-done/workflows/map-codebase.md`
- Impact: Codebase maps and phase execution behavior may differ by machine.
- Migration plan: Commit required workflow files or move them to documented developer setup outside the app repo.

## Missing Critical Features

**Automated tests and CI:**
- Problem: No test runner, test script, local test files, or CI workflow is detected.
- Files: `package.json`, `eslint.config.mjs`, `.planning/codebase/TESTING.md`
- Current workaround: `npm run lint` passes and manual review catches issues.
- Blocks: Safe refactors of payments, RLS-sensitive routes, factories, and dashboard workflows.
- Implementation complexity: Medium; start with Vitest for pure functions/actions and Playwright or component tests for payment/dashboard flows.

**Stripe webhook processing:**
- Problem: No `app/api/stripe/webhook/route.ts` or equivalent signed webhook endpoint exists.
- Files: `app/api/payment-success/route.ts`, `roadmap/reservation-backend.md`, `.planning/codebase/INTEGRATIONS.md`
- Current workaround: `/api/payment-success` retrieves a PaymentIntent and inserts records.
- Blocks: Reliable async payment handling, idempotency, refunds, capture/cancel flows, and dispute event handling.
- Implementation complexity: Medium to high due database idempotency and status migration requirements.

**Rate limiting and abuse controls:**
- Problem: Public endpoints do not enforce per-IP/user throttles.
- Files: `app/api/profiles/vendors/closests/route.ts`, `app/api/profiles/check-slug/route.ts`, `app/api/categories/route.ts`, `app/api/products/[productId]/related-products/route.ts`
- Current workaround: Supabase and hosting platform limits.
- Blocks: Protection against geospatial query abuse, slug-check scraping, and catalog endpoint scraping.
- Implementation complexity: Medium; add middleware or provider-native rate limiting.

**Server-side role/ownership guards:**
- Problem: Several pages and route handlers rely on navigation filtering or RLS rather than explicit server-side authorization.
- Files: `app/[locale]/dashboard/admin/layout.tsx`, `app/api/users/current/kiosq/[kiosqId]/route.ts`, `app/api/users/current/profiles/[profileId]/kiosqs/route.ts`, `app/api/users/current/profiles/[profileId]/schedules/route.ts`
- Current workaround: RLS policies and client navigation filters.
- Blocks: Clear security boundaries and predictable error behavior.
- Implementation complexity: Low to medium; add reusable `requireUser`, `requireAdmin`, and `requireProfileOwner` helpers.

**Structured observability:**
- Problem: Application logging is plain `console.log`/`console.error` with sensitive payment fields in some paths.
- Files: `actions/create-reservation-payment-intent.ts`, `app/api/payment-success/route.ts`, `features/stripe-payment/stripe-payment-provider.tsx`, `utils/geocoding.ts`
- Current workaround: Console output.
- Blocks: Safe production debugging, alerting, and payment incident investigation.
- Implementation complexity: Low to medium; add redacted structured logs and error reporting.

## Test Coverage Gaps

**Payment and reservation flow:**
- What's not tested: PaymentIntent creation, modal validation, Stripe confirmation, payment return handling, duplicate prevention, and reservation/order/item persistence.
- Files: `actions/create-reservation-payment-intent.ts`, `features/stripe-payment/stripe-payment-modal.tsx`, `actions/create-reservation.ts`, `app/api/payment-success/route.ts`
- Risk: Payment regressions can create incorrect charges, duplicate orders, or lost reservations.
- Priority: High
- Difficulty to test: Requires Stripe test-mode mocks, route tests, and database fixtures.

**RLS-sensitive API routes:**
- What's not tested: Authenticated access, owner filtering, admin filtering, and public/draft visibility boundaries.
- Files: `app/api/users/current/kiosq/[kiosqId]/route.ts`, `app/api/users/current/profiles/[profileId]/kiosqs/route.ts`, `app/api/users/current/profiles/[profileId]/schedules/route.ts`, `app/[locale]/dashboard/admin/layout.tsx`
- Risk: Data that should be owner/admin-only can be exposed or stale authorization assumptions can persist.
- Priority: High
- Difficulty to test: Requires Supabase local test data and authenticated request helpers.

**Multi-table server actions:**
- What's not tested: Partial failure handling for product creation, variant creation, image upload, deletion, and reservation creation.
- Files: `actions/create-product.ts`, `actions/create-product-variant.ts`, `actions/update-product-variant.ts`, `actions/delete-product-variant.ts`, `actions/create-reservation.ts`
- Risk: Orphaned rows and inconsistent image/database state can ship silently.
- Priority: High
- Difficulty to test: Requires database transaction/RPC fixtures or integration tests.

**Cache and invalidation behavior:**
- What's not tested: Next tag revalidation, React Query invalidation, and private dashboard data freshness.
- Files: `utils/cache-keys.ts`, `utils/fetch-server-authenticated.ts`, `actions/revalidators/product-revalidator.ts`, `utils/invalidators-hooks/use-products-invalidator.ts`
- Risk: Users see stale or incorrect dashboard data after mutations.
- Priority: Medium
- Difficulty to test: Requires integration tests around server fetches and query client invalidation.

**Validation and form boundaries:**
- What's not tested: Zod schemas, modal submit behavior, slug uniqueness checks, schedule time validation, and image upload constraints.
- Files: `features/reservation-button/components/reservation-button-modal-form.tsx`, `components/ui/modal.tsx`, `features/vendor-profile-form-drawer/utils/vendor-profile-validation-schema.ts`, `features/schedule-form-drawer/utils/schedule-form-validation-schema.ts`, `components/ui/image-dropzone.tsx`
- Risk: Client validation can appear present while server actions still accept invalid states.
- Priority: Medium
- Difficulty to test: Requires component tests or focused hook tests with form interactions.

---

*Concerns audit: 2026-04-29*
*Update as issues are fixed or new ones discovered*
