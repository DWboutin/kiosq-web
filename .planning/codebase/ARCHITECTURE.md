<!-- refreshed: 2026-04-29 -->
# Architecture

**Analysis Date:** 2026-04-29

## System Overview

```text
┌─────────────────────────────────────────────────────────────┐
│              Next.js App Router + Middleware                 │
│              `middleware.ts`, `app/[locale]/layout.tsx`      │
├──────────────────┬──────────────────┬───────────────────────┤
│ Public Routes    │ Dashboard Routes │ Auth/Payment Routes    │
│ `app/[locale]/   │ `app/[locale]/   │ `app/[locale]/auth`,   │
│ (main)`          │ dashboard`       │ `app/api/payment-*`    │
└────────┬─────────┴────────┬─────────┴──────────┬────────────┘
         │                  │                    │
         ▼                  ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│            Feature, Client Page, and UI Composition          │
│ `features/`, `components/client-pages/`, `components/ui/`    │
└─────────────────────────────────────────────────────────────┘
         │                  │
         ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│      Server Actions, API Routes, Request Helpers, Factories  │
│ `actions/`, `app/api/`, `utils/requests/`, `utils/factories/`│
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│       Supabase Auth, Postgres, Storage, PostGIS, Stripe      │
│ `utils/supabase/`, `supabase/migrations/`, `actions/*stripe*`│
└─────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| Middleware | Refresh Supabase session, redirect unauthenticated dashboard traffic, then run locale routing. | `middleware.ts`, `utils/supabase/middleware.ts` |
| Locale root shell | Validate `[locale]`, load messages, mount app-wide client providers and toast UI. | `app/[locale]/layout.tsx`, `i18n/request.ts` |
| Public marketplace routes | Render home, vendor, product, schedule, and company pages with server-side data fetches. | `app/[locale]/(main)/page.tsx`, `app/[locale]/(main)/vendors/[slug]/page.tsx`, `app/[locale]/(main)/products/[slug]/[productId]/page.tsx` |
| Dashboard routes | Render authenticated vendor/admin management pages and hydrate client page components with fetched data. | `app/[locale]/dashboard/products/page.tsx`, `app/[locale]/dashboard/your-kiosqs/page.tsx`, `app/[locale]/dashboard/schedules/page.tsx` |
| API route handlers | Query Supabase, enforce route-level auth checks, return JSON DTOs. | `app/api/users/current/profiles/[profileId]/products/route.ts`, `app/api/products/[productId]/route.ts`, `app/api/profiles/vendors/closests/route.ts` |
| Server actions | Execute authenticated mutations and integration work from client features. | `actions/create-product.ts`, `actions/update-product.ts`, `actions/create-reservation-payment-intent.ts`, `actions/create-reservation.ts` |
| Request helpers | Wrap fetch calls to internal API routes and attach cache tags/revalidation metadata. | `utils/requests/get-product-by-id.ts`, `utils/requests/get-vendor-profile-from-slug.ts`, `utils/requests/get-authenticated-user-profile-id-products.ts` |
| Factories | Convert Supabase row shapes into application DTOs with camelCase properties and translation objects. | `utils/factories/product-factory.ts`, `utils/factories/authenticated-user-profiles-factory.ts`, `utils/factories/kiosqs-factory.ts` |
| Client feature modules | Own form flows, modals, domain-specific UI, hooks, and validation schemas. | `features/product-form-drawer/`, `features/reservation-button/`, `features/location-manager/`, `features/create-profile-wizard/` |
| Shared UI | Provide reusable primitives, shadcn/Radix wrappers, icons, skeletons, and page sections. | `components/ui/button.tsx`, `components/ui/side-form-drawer.tsx`, `components/sections/header.tsx` |
| Client state | Store persisted browser state and cache invalidation helpers. | `stores/user-store.ts`, `stores/data-table-visibility-store.ts`, `utils/invalidators-hooks/use-products-invalidator.ts` |
| Database schema | Define Supabase tables, RLS policies, triggers, storage policies, and PostGIS functions. | `supabase/migrations/`, `types/supabase.ts` |
| GSD workflow support | Provide planning/agent skills and generated codebase maps for implementation workflows; not application runtime code. | `.codex/skills/`, `.codex/agents/`, `.planning/codebase/` |

## Pattern Overview

**Overall:** Full-stack Next.js App Router monolith with feature-sliced client UI and Supabase-backed API/action data access (`app/`, `features/`, `app/api/`, `actions/`, `utils/supabase/`).

**Key Characteristics:**
- Use route groups for product marketplace, auth, and dashboard shells (`app/[locale]/(main)/layout.tsx`, `app/[locale]/auth/layout.tsx`, `app/[locale]/dashboard/layout.tsx`).
- Use server components and route-local async helpers for initial dashboard data fetches (`app/[locale]/dashboard/products/page.tsx`, `app/[locale]/dashboard/your-kiosqs/page.tsx`).
- Use API routes as the read-oriented service boundary and server actions as the mutation boundary (`app/api/products/[productId]/route.ts`, `actions/create-product.ts`).
- Use factories for application DTO normalization instead of exposing raw Supabase row names to UI code (`utils/factories/product-factory.ts`, `utils/factories/authenticated-user-product-factory.ts`).
- Use shared cache metadata for Next.js cache tags and TanStack Query keys (`utils/cache-keys.ts`, `actions/revalidators/product-revalidator.ts`, `utils/invalidators-hooks/use-products-invalidator.ts`).
- Use feature directories for interactive workflows with colocated hooks, schemas, and subcomponents (`features/product-form-drawer/`, `features/schedule-form-drawer/`, `features/location-manager/`).

## Layers

**Middleware and Routing Layer:**
- Purpose: Authenticate dashboard access and localize non-API requests.
- Location: `middleware.ts`, `utils/supabase/middleware.ts`, `i18n/create-pathnames-mappings.ts`.
- Contains: Supabase session refresh, unauthenticated redirects, next-intl middleware configuration.
- Depends on: `@supabase/ssr`, `next-intl/middleware`, `AppConfig` from `app-config.ts`.
- Used by: Every matched page request except `app/api/`, `_next`, `_vercel`, and static assets.

**App Route Layer:**
- Purpose: Define layouts, pages, metadata, loading states, and server-rendered data needs.
- Location: `app/[locale]/`, `app/[locale]/(main)/`, `app/[locale]/dashboard/`, `app/[locale]/auth/`.
- Contains: `page.tsx`, `layout.tsx`, `loading.tsx`, route groups, dynamic segments.
- Depends on: `utils/requests/`, `fetchServerAuthenticated`, `components/sections/`, `features/`, `next-intl/server`.
- Used by: Browser navigation through Next.js App Router.

**API Route Layer:**
- Purpose: Serve JSON data for server components and React Query hooks.
- Location: `app/api/`.
- Contains: `route.ts` files with `GET` or `POST` handlers.
- Depends on: `utils/supabase/server.ts`, `utils/factories/`, `NextResponse`.
- Used by: `utils/requests/`, dashboard page-local fetch helpers, and client hooks.

**Server Action Layer:**
- Purpose: Execute mutations, uploads, Stripe integration calls, and explicit cache revalidation.
- Location: `actions/`, `actions/revalidators/`.
- Contains: `"use server"` functions for products, kiosqs, schedules, profiles, reservations, Stripe Connect, and session cleanup.
- Depends on: `utils/supabase/server.ts`, `utils/upload-image.ts`, `next/cache`, Stripe SDK.
- Used by: Feature hooks and client components in `features/`.

**Request Helper Layer:**
- Purpose: Centralize fetch calls for reusable domain reads.
- Location: `utils/requests/`.
- Contains: `get-*.ts` functions that call internal API routes and throw request-level errors.
- Depends on: `utils/cache-keys.ts`, `utils/get-base-url.ts`.
- Used by: Server pages, React Query hooks, and feature components.

**Factory and Type Layer:**
- Purpose: Normalize Supabase row shapes, relationship payloads, JSONB translation fields, and generated database types.
- Location: `utils/factories/`, `types/app.ts`, `types/supabase.ts`.
- Contains: DTO types and `*Factory` mapping functions.
- Depends on: Generated Supabase types from `types/supabase.ts`.
- Used by: API routes, request helpers, hooks, components, and form logic.

**Feature Layer:**
- Purpose: Own domain-specific UI flows and interaction state.
- Location: `features/`.
- Contains: Feature root components, `components/`, `hooks/`, and `utils/*validation-schema.ts`.
- Depends on: `components/ui/`, `actions/`, `hooks/`, `utils/factories/`, `react-hook-form`, `zod`, React Query.
- Used by: Pages in `app/[locale]/`, sections in `components/sections/`, and client-page orchestrators.

**Shared Presentation Layer:**
- Purpose: Provide reusable UI primitives, icons, skeletons, sections, and dashboard client-page wrappers.
- Location: `components/ui/`, `components/sections/`, `components/skeletons/`, `components/client-pages/`.
- Contains: Radix/shadcn wrappers, cards, tables, drawers, form utilities, headers, skeleton states.
- Depends on: `lib/utils.ts`, `stores/`, `features/`, `next-intl`.
- Used by: App routes and feature modules.

**Client State and Cache Layer:**
- Purpose: Coordinate browser state, React Query data, persisted preferences, contexts, and cache invalidation.
- Location: `hooks/`, `stores/`, `features/providers/react-query-provider.tsx`, feature provider files.
- Contains: `useQuery` hooks, Zustand stores, React contexts, invalidator hooks.
- Depends on: `@tanstack/react-query`, `zustand`, browser storage, request helpers.
- Used by: Client pages and interactive features.

**Data and Infrastructure Layer:**
- Purpose: Store domain data, auth sessions, images, geolocation indexes, reservations, and payment records.
- Location: `supabase/migrations/`, `utils/supabase/`, `utils/upload-image.ts`.
- Contains: Postgres schema, RLS policies, triggers, storage policies, Supabase SSR clients, PostGIS RPC functions.
- Depends on: Supabase Auth, Postgres, Storage, PostGIS, environment variables.
- Used by: API routes, server actions, middleware, and generated types.

**Planning Workflow Layer:**
- Purpose: Guide GSD planning/execution workflows and codebase intelligence.
- Location: `.codex/skills/`, `.codex/agents/`, `.planning/codebase/`.
- Contains: GSD skill instructions, mapper/planner/executor agents, and generated architecture/structure docs.
- Depends on: Local agent runtime, not Next.js runtime.
- Used by: GSD commands and future implementation agents.

## Data Flow

### Public Product Detail Path

1. `middleware.ts:13` refreshes the Supabase session with `updateSession` and then applies next-intl routing.
2. `app/[locale]/layout.tsx:41` validates the locale and `app/[locale]/layout.tsx:52` mounts `NextIntlClientProvider`.
3. `app/[locale]/(main)/products/[slug]/[productId]/page.tsx:11` reads the dynamic `productId` route param.
4. `utils/requests/get-product-by-id.ts:11` fetches `/api/products/${productId}` with cache metadata from `utils/cache-keys.ts`.
5. `app/api/products/[productId]/route.ts:12` creates a Supabase server client and queries published product data.
6. `utils/factories/product-factory.ts:58` maps Supabase data into `ProductWithVariantsPricesAndProfile`.
7. `features/product-details/product-details-provider.tsx:31` initializes selected variant state and `features/product-details/product-details.tsx` renders the product UI.

### Authenticated Dashboard Read Path

1. `utils/supabase/middleware.ts:34` redirects unauthenticated `/dashboard` requests to `/auth/sign-in`.
2. `app/[locale]/dashboard/layout.tsx:12` renders the dashboard header and `app/[locale]/dashboard/layout.tsx:17` renders `DashboardMenu`.
3. `app/[locale]/dashboard/products/page.tsx:55` runs the server page and `app/[locale]/dashboard/products/page.tsx:57` fetches user profiles.
4. `utils/fetch-server-authenticated.ts:7` forwards request cookies to internal API fetches.
5. `app/api/users/current/profiles/[profileId]/products/route.ts:15` verifies Supabase auth and `app/api/users/current/profiles/[profileId]/products/route.ts:21` queries profile products.
6. `utils/factories/authenticated-user-profile-id-products-factory.ts:7` maps rows for dashboard use.
7. `components/client-pages/dashboard-profile-products/dashboard-profile-products.tsx:21` hydrates React Query with server data through `useCurrentUserProfileIdProducts`.

### Product Mutation Path

1. `features/product-form-drawer/product-form-drawer.tsx:18` opens a reusable side drawer for create/edit product flows.
2. `features/product-form-drawer/hooks/use-product-form.ts:72` creates the locale-aware Zod schema and `features/product-form-drawer/hooks/use-product-form.ts:89` initializes React Hook Form.
3. `features/product-form-drawer/hooks/use-product-form.ts:102` runs a React Query mutation against `actions/create-product.ts` or `actions/update-product.ts`.
4. `actions/create-product.ts:11` creates the Supabase server client, `actions/create-product.ts:36` inserts product rows, and `actions/create-product.ts:61` inserts the default variant.
5. `actions/revalidators/product-revalidator.ts:13` revalidates Next.js tags for product detail, vendor products, and current-user products.
6. `utils/invalidators-hooks/use-products-invalidator.ts:14` invalidates browser-side React Query keys after a successful mutation.

### Reservation and Payment Path

1. `features/reservation-button/reservation-button.tsx:39` renders the reservation entry point from product details.
2. `features/reservation-button/components/reservation-button-modal.tsx:31` requests a Stripe PaymentIntent through `actions/create-reservation-payment-intent.ts`.
3. `actions/create-reservation-payment-intent.ts:62` creates the connected-account PaymentIntent through Stripe.
4. `features/stripe-payment/stripe-payment-provider.tsx:31` mounts Stripe Elements with the returned client secret.
5. `features/stripe-payment/stripe-payment-modal.tsx:47` confirms payment and `features/stripe-payment/stripe-payment-modal.tsx:68` calls `actions/create-reservation.ts`.
6. `actions/create-reservation.ts:63` inserts the reservation, `actions/create-reservation.ts:81` inserts the order, and `actions/create-reservation.ts:102` inserts the order item.
7. `app/api/payment-success/route.ts:23` also handles redirect-based PaymentIntent confirmation and writes order data for redirect payment flows.

### Geolocation Vendor Discovery Path

1. `features/location-manager/location-manager-provider.tsx:45` mounts a client context around the app.
2. `hooks/use-geolocation.ts:31` requests browser geolocation through `utils/get-geolocation.ts`.
3. `utils/requests/get-city-from-coord.ts:5` reverse-geocodes coordinates through Nominatim.
4. `hooks/use-closest-vendor-profiles.ts` requests closest vendors with coordinates from the location context.
5. `app/api/profiles/vendors/closests/route.ts:40` calls the Supabase `get_nearby_profiles` PostGIS RPC when coordinates exist.
6. `supabase/migrations/20250703000001_add_postgis_geolocation.sql:53` defines the `get_nearby_profiles` database function.

**State Management:**
- Supabase auth state is stored in cookies and refreshed by `utils/supabase/middleware.ts`.
- Server-rendered data uses Next.js cache tags from `utils/cache-keys.ts` and revalidators in `actions/revalidators/`.
- Client data uses TanStack Query from `features/providers/react-query-provider.tsx` and hooks in `hooks/`.
- Browser-persisted UI state uses Zustand stores in `stores/user-store.ts` and `stores/data-table-visibility-store.ts`.
- Feature-local state uses React contexts in `features/location-manager/location-manager-provider.tsx`, `features/product-details/product-details-provider.tsx`, and `features/reservation-button/reservation-button.tsx`.

## Key Abstractions

**Route Handler:**
- Purpose: API boundary for JSON reads and callbacks.
- Examples: `app/api/products/[productId]/route.ts`, `app/api/users/current/route.ts`, `app/api/profiles/check-slug/route.ts`.
- Pattern: Export `GET` or `POST`, create Supabase server client, validate/authenticate, query, map, return `NextResponse.json`.

**Server Action:**
- Purpose: Mutation boundary callable from client components and hooks.
- Examples: `actions/create-product.ts`, `actions/update-vendor-profile.ts`, `actions/create-reservation.ts`.
- Pattern: `"use server"` module, `createClient()`, perform Supabase writes, throw on failure, call a revalidator when cache state changes.

**Request Helper:**
- Purpose: Reusable fetch facade for internal API routes.
- Examples: `utils/requests/get-product-by-id.ts`, `utils/requests/get-product-categories.ts`, `utils/requests/get-vendor-profile-from-slug.ts`.
- Pattern: Build URL with `getBaseUrl()` for server-safe absolute fetches, attach cache metadata from `cacheKeys`, return typed DTOs.

**Factory:**
- Purpose: Translate database rows into stable UI/domain data shapes.
- Examples: `utils/factories/product-factory.ts`, `utils/factories/authenticated-user-profiles-factory.ts`, `utils/factories/profiles-with-kiosqs-factory.ts`.
- Pattern: Export a DTO type, a singular factory, and sometimes a plural factory.

**Cache Key Config:**
- Purpose: Keep Next.js tags and React Query keys aligned.
- Examples: `utils/cache-keys.ts`, `actions/revalidators/product-revalidator.ts`, `utils/invalidators-hooks/use-products-invalidator.ts`.
- Pattern: Each domain key exposes `tag`, `revalidate`, and `queryKey`.

**Feature Hook:**
- Purpose: Encapsulate feature form state, mutations, selectors, and actions.
- Examples: `features/product-form-drawer/hooks/use-product-form.ts`, `features/categories-table/hooks/use-categories-table.ts`, `features/location-manager/hooks/use-location-manager-modal.ts`.
- Pattern: Return `{ selectors, actions }` and keep UI components declarative.

**Provider Context:**
- Purpose: Share workflow-local state across nested client components.
- Examples: `features/location-manager/location-manager-provider.tsx`, `features/product-details/product-details-provider.tsx`, `features/stripe-payment/stripe-payment-provider.tsx`.
- Pattern: `createContext`, exported `use*Context` hook, provider mounted near the feature root.

**Generated Database Type:**
- Purpose: Provide typed access to Supabase tables/enums and app-level type aliases.
- Examples: `types/supabase.ts`, `types/app.ts`.
- Pattern: Generated `Database` type feeds aliases such as `RawProduct`, `RawProfile`, `Locales`, and `UserData`.

## Entry Points

**Middleware Entry:**
- Location: `middleware.ts`
- Triggers: Next.js middleware for matched non-API paths.
- Responsibilities: Call Supabase session update, short-circuit redirects, run next-intl path routing.

**Root App Entry:**
- Location: `app/[locale]/layout.tsx`
- Triggers: Every localized app route.
- Responsibilities: Validate locale, load messages, mount global providers, import `app/globals.css`.

**Public Marketplace Entry:**
- Location: `app/[locale]/(main)/page.tsx`
- Triggers: Localized home page route.
- Responsibilities: Fetch authenticated user data, show onboarding when needed, render closest vendors.

**Dashboard Entry:**
- Location: `app/[locale]/dashboard/page.tsx`, `app/[locale]/dashboard/layout.tsx`
- Triggers: Authenticated dashboard routes under `/[locale]/dashboard`.
- Responsibilities: Render dashboard shell and management pages for products, kiosqs, schedules, reservations, settings, and admin categories.

**Auth Entry:**
- Location: `app/[locale]/auth/sign-in/page.tsx`, `app/[locale]/auth/verify-otp/page.tsx`
- Triggers: Sign-in and OTP verification routes.
- Responsibilities: Render Supabase OTP authentication features.

**API Entry:**
- Location: `app/api/**/route.ts`
- Triggers: Internal fetches, React Query hooks, Stripe redirects, and slug checks.
- Responsibilities: Read data, validate params, enforce auth, return JSON or redirects.

**Server Action Entry:**
- Location: `actions/*.ts`
- Triggers: Client form submissions, buttons, Stripe flow, onboarding, image upload flows.
- Responsibilities: Mutate Supabase and external services, then revalidate cache.

**Database Entry:**
- Location: `supabase/migrations/*.sql`, `supabase/seed.sql`
- Triggers: Supabase CLI migration/reset commands from `package.json`.
- Responsibilities: Define schema, policies, triggers, functions, seed data, storage buckets.

## Architectural Constraints

- **Runtime:** Use the Next.js server/client component split shown by `"use client"` in `features/*` and `"use server"` in `actions/*`.
- **Threading:** Use the standard Next.js request/event loop model; no worker-thread layer appears in `app/`, `actions/`, or `utils/`.
- **Server-only clients:** Use `utils/supabase/server.ts` in server components, route handlers, and server actions; use `utils/supabase/client.ts` in browser-only auth helpers.
- **Service role access:** Keep `utils/supabase/admin.ts` server-only because it uses `SERVICE_ROLE`.
- **Global state:** `i18n/create-pathnames-mappings.ts` keeps a module-level pathname cache, `features/stripe-payment/stripe-payment-provider.tsx` keeps a module-level `stripePromise`, and `stores/*.ts` define persistent Zustand stores.
- **Route params:** Next.js route params are typed as `Promise<...>` in pages and handlers such as `app/[locale]/dashboard/products/[productId]/page.tsx` and `app/api/products/[productId]/route.ts`.
- **Circular imports:** Not detected by import review across `app/`, `actions/`, `features/`, `components/`, `hooks/`, `stores/`, `utils/`, and `i18n/`.
- **Locale sources:** `app-config.ts` and `i18n/routing.ts` both define locales/default locale; keep changes synchronized until locale configuration is centralized.
- **Secrets:** Environment values are referenced in `next.config.ts`, `utils/supabase/*.ts`, and Stripe actions; `.env*` files are present and ignored by `.gitignore`.

## Anti-Patterns

### Page-Local Fetch Duplication

**What happens:** Dashboard pages define local `getUserProfiles` and related fetch helpers directly in page files such as `app/[locale]/dashboard/products/page.tsx`, `app/[locale]/dashboard/your-kiosqs/page.tsx`, and `app/[locale]/dashboard/schedules/page.tsx`.
**Why it's wrong:** Shared request logic, cache tags, and error behavior can diverge from reusable helpers in `utils/requests/`.
**Do this instead:** Add or reuse request helpers in `utils/requests/` and keep the page focused on composition, as shown by `utils/requests/get-product-by-id.ts` and `utils/requests/get-vendor-profile-from-slug.ts`.

### Split Locale Configuration

**What happens:** `app-config.ts` sets `defaultLocale: "fr"` while `i18n/routing.ts` sets `defaultLocale: "en"`.
**Why it's wrong:** Middleware, type aliases, and request message loading can make different fallback decisions for the same route.
**Do this instead:** Treat one locale module as the source of truth and derive the other configuration from it in `app-config.ts`, `i18n/routing.ts`, and `middleware.ts`.

### Raw Route Logic Used as Business Logic

**What happens:** API handlers query Supabase and contain domain decisions directly, for example `app/api/profiles/vendors/closests/route.ts` and `app/api/profiles/check-slug/route.ts`.
**Why it's wrong:** Logic reused by server actions or multiple routes must be copied instead of imported.
**Do this instead:** Extract shared domain operations into `utils/` modules and keep handlers as request/response adapters, matching the factory split in `utils/factories/product-factory.ts`.

## Error Handling

**Strategy:** API routes catch errors and return JSON status responses; request helpers throw typed/generic `Error`; server actions throw and let client hooks show toasts or set error state.

**Patterns:**
- Route handlers use `try/catch`, `console.error`, and `NextResponse.json` status codes in `app/api/products/[productId]/route.ts`, `app/api/categories/route.ts`, and `app/api/users/current/route.ts`.
- Server actions throw Supabase and domain errors directly in `actions/create-product.ts` and wrap unknown failures in `actions/update-product.ts`.
- Request helpers log and rethrow generic request failures in `utils/requests/get-product-by-id.ts` and `utils/requests/get-vendor-profile-from-slug.ts`.
- Client mutations show success/error toasts through feature hooks such as `features/product-form-drawer/hooks/use-product-form.ts`.
- Auth and Stripe callback failures redirect through `utils/supabase/middleware.ts`, `app/api/stripe/connect/callback/route.ts`, and `app/api/payment-success/route.ts`.

## Cross-Cutting Concerns

**Logging:** Use `console.error` and `console.log` in API routes, server actions, and payment/geolocation helpers such as `app/api/payment-success/route.ts`, `actions/create-reservation-payment-intent.ts`, and `utils/geocoding.ts`.

**Validation:** Use Zod for forms in `features/*/utils/*validation-schema.ts`; use manual route validation in `app/api/profiles/[profileId]/products/route.ts` and `app/api/profiles/check-slug/route.ts`; use database constraints/RLS in `supabase/migrations/`.

**Authentication:** Use Supabase SSR clients in `utils/supabase/server.ts`, browser auth helpers in `utils/supabase/client.ts`, middleware redirects in `utils/supabase/middleware.ts`, and route-level `supabase.auth.getUser()` in `app/api/users/current/route.ts`.

**Caching:** Use `utils/cache-keys.ts` for Next.js tags and React Query keys; use `actions/revalidators/` for server-side invalidation; use `utils/invalidators-hooks/` for browser invalidation.

**Internationalization:** Use `next-intl` routing/messages through `i18n/request.ts`, `i18n/navigation.ts`, `messages/en.json`, `messages/fr.json`, and translation-aware DTO fields in `types/app.ts`.

**Payments:** Use Stripe server SDK in `actions/create-reservation-payment-intent.ts`, Stripe Connect callback handling in `app/api/stripe/connect/callback/route.ts`, and Stripe Elements in `features/stripe-payment/`.

**Images and Storage:** Use Next image remote patterns in `next.config.ts`, Supabase Storage upload helper in `utils/upload-image.ts`, storage policy migrations in `supabase/migrations/20250511000000_create_profile_images_bucket.sql`, and static assets in `public/`.

**Geolocation:** Use browser geolocation in `utils/get-geolocation.ts`, Nominatim reverse geocoding in `utils/requests/get-city-from-coord.ts`, and PostGIS RPC functions in `supabase/migrations/20250703000001_add_postgis_geolocation.sql`.

---

*Architecture analysis: 2026-04-29*
