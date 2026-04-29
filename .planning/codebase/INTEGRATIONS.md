# External Integrations

**Analysis Date:** 2026-04-29

## APIs & External Services

**Payment Processing:**
- Stripe - Connect onboarding for vendor accounts and card payments for reservations.
  - SDK/Client: `stripe` 18.3.0 in `actions/create-reservation-payment-intent.ts` and `app/api/payment-success/route.ts`; `@stripe/stripe-js` 7.5.0 and `@stripe/react-stripe-js` 3.7.0 in `features/stripe-payment/stripe-payment-provider.tsx` and `features/stripe-payment/stripe-payment-modal.tsx`.
  - Auth: `STRIPE_SECRET_API_KEY`, `NEXT_PUBLIC_STRIPE_PUBLIC_API_KEY`, and `NEXT_PUBLIC_STRIPE_CONNECT_CLIENT_ID`.
  - Endpoints used: Stripe Connect OAuth authorize URL built in `actions/get-stripe-connect-link.ts`; Stripe Connect OAuth token exchange at `https://connect.stripe.com/oauth/token` in `app/api/stripe/connect/callback/route.ts`; PaymentIntent create/retrieve through the Stripe SDK in `actions/create-reservation-payment-intent.ts` and `app/api/payment-success/route.ts`; `stripe.confirmPayment` in `features/stripe-payment/stripe-payment-modal.tsx`.

**Email/SMS:**
- Supabase Auth email OTP - Passwordless email sign-in and OTP verification.
  - SDK/Client: `@supabase/ssr` and `@supabase/supabase-js` through `utils/supabase/client.ts`, `stores/user-store.ts`, `features/sign-in/hooks/use-sign-in-email-form.ts`, and `features/verify-otp-form/hooks/use-verify-otp-form.ts`.
  - Auth: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
  - Local email testing: Inbucket is enabled in `supabase/config.toml` on port `54324`.
- Supabase SMS/Twilio - Not active in app code.
  - SDK/Client: Supabase local auth config only in `supabase/config.toml`.
  - Auth: `SUPABASE_AUTH_SMS_TWILIO_AUTH_TOKEN` is referenced by disabled Twilio SMS config in `supabase/config.toml`.
  - Status: `[auth.sms]` signup is disabled and `[auth.sms.twilio]` is disabled in `supabase/config.toml`.

**Maps & Geocoding:**
- Mapbox - Map tile/style rendering for vendor and user locations.
  - SDK/Client: `mapbox-gl` 3.13.0 in `components/ui/map-view.tsx`.
  - Auth: A public Mapbox access token is assigned in `components/ui/map-view.tsx`; no `MAPBOX_*` environment variable is used.
  - Endpoints used: Mapbox GL style `mapbox://styles/mapbox/streets-v12` in `components/ui/map-view.tsx`.
- OpenStreetMap Nominatim - Address geocoding and reverse geocoding.
  - Integration method: REST API via `fetch` in `utils/geocoding.ts` and `utils/requests/get-city-from-coord.ts`.
  - Auth: No API key; both callers set a `User-Agent` header.
  - Endpoints used: `https://nominatim.openstreetmap.org/search` in `utils/geocoding.ts` and `https://nominatim.openstreetmap.org/reverse` in `utils/requests/get-city-from-coord.ts`.
- Browser Geolocation API - User coordinate collection.
  - Integration method: `navigator.geolocation.getCurrentPosition` in `utils/get-geolocation.ts`, wrapped by `hooks/use-geolocation.ts`.
  - Auth: Browser permission prompt, no server credential.

**External APIs:**
- Supabase REST/PostgREST and Auth APIs - Data, auth, storage, and RPC calls through Supabase SDK clients.
  - Integration method: SDK clients in `utils/supabase/server.ts`, `utils/supabase/client.ts`, `utils/supabase/admin.ts`, and `utils/supabase/middleware.ts`.
  - Auth: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SERVICE_ROLE`.
  - RPC calls: `get_nearby_profiles` in `app/api/profiles/vendors/closests/route.ts`; `delete_category` in `actions/delete-product-category.ts`.
- Google Fonts via Next Font - Font definitions imported from `next/font/google` in `app/[locale]/layout.tsx`.
  - Integration method: Next.js font optimization at build/runtime boundary.
  - Auth: None.
- Supabase Studio AI - Local Supabase Studio configuration only.
  - Integration method: `openai_api_key = "env(OPENAI_API_KEY)"` in `supabase/config.toml`.
  - Auth: `OPENAI_API_KEY`.
  - Status: No application import or runtime call to OpenAI was detected.

## Data Storage

**Databases:**
- PostgreSQL on Supabase - Primary relational data store for users, profiles, products, categories, kiosqs, schedules, reservations, orders, and order items.
  - Connection: Supabase URL and keys via `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SERVICE_ROLE` in `utils/supabase/server.ts`, `utils/supabase/client.ts`, and `utils/supabase/admin.ts`.
  - Client: `@supabase/supabase-js` 2.49.4 and `@supabase/ssr` 0.6.1.
  - Migrations: SQL migrations in `supabase/migrations/*.sql`; seed data in `supabase/seed.sql`; generated TypeScript schema in `types/supabase.ts`.
  - Local config: `supabase/config.toml` exposes `public` and `graphql_public`, uses Postgres major version `15`, and caps API responses at `max_rows = 1000`.
  - Important tables: `users`, `profiles`, `categories`, `products`, `product_variants`, `product_prices`, `kiosqs`, `schedules`, `reservations`, `orders`, `order_items`, and `reservation_proposed_changes` across `supabase/migrations/20250418000000_ecommerce_schema.sql`, `supabase/migrations/20250517000000_update_product_tables.sql`, `supabase/migrations/20250701000000_create_kiosqs_table.sql`, `supabase/migrations/20250702000000_create_schedules_table.sql`, `supabase/migrations/20250713000000_create_orders_reservations.sql`, and `supabase/migrations/20250714000000_update_reservations_orders_workflow.sql`.
  - Spatial data: PostGIS extension, geography columns, spatial indexes, and RPC functions are defined in `supabase/migrations/20250703000001_add_postgis_geolocation.sql`.

**File Storage:**
- Supabase Storage - Public image storage for profile, product variant, and kiosq assets.
  - SDK/Client: Supabase storage client through `utils/upload-image.ts`, `actions/update-profile-image.ts`, `actions/update-profile-banner-image.ts`, `actions/update-product-variant.ts`, `actions/delete-product-variant.ts`, and `actions/delete-kiosq.ts`.
  - Auth: Supabase session/server credentials via `utils/supabase/server.ts`; admin/service role available via `utils/supabase/admin.ts`.
  - Buckets: `profile-images` in `supabase/migrations/20250511000000_create_profile_images_bucket.sql`; `product-variants-images` in `supabase/migrations/20250517000000_update_product_tables.sql`; `kiosqs-images` in `supabase/migrations/20250701000000_create_kiosqs_table.sql`.
  - Next Image access: Supabase remote image host is configured from `NEXT_PUBLIC_SUPABASE_URL` in `next.config.ts`.
  - Local storage limit: `file_size_limit = "50MiB"` in `supabase/config.toml`.

**Caching:**
- No external cache service detected. No Redis, Memcached, Upstash, or CDN SDK dependency is declared in `package.json`.
- Next.js fetch caching and cache tags are used in request utilities such as `utils/requests/get-product-categories.ts` and `utils/requests/get-vendor-profile-from-slug.ts`.
- HTTP/CDN cache headers are set manually in `app/api/categories/route.ts`, including `Cache-Control`, `CDN-Cache-Control`, and `Vercel-CDN-Cache-Control`.
- Client-side query caching uses TanStack Query in `features/providers/react-query-provider.tsx` and hooks under `hooks/`.

## Authentication & Identity

**Auth Provider:**
- Supabase Auth - Email OTP login, session refresh, and dashboard route protection.
  - Implementation: Browser client in `utils/supabase/client.ts`, server client in `utils/supabase/server.ts`, middleware client in `utils/supabase/middleware.ts`, and route protection in `middleware.ts`.
  - Token storage: Supabase auth cookies managed by `@supabase/ssr` in `utils/supabase/server.ts` and `utils/supabase/middleware.ts`.
  - Client state: `stores/user-store.ts` persists user/session state to `sessionStorage`.
  - Session management: `utils/supabase/middleware.ts` calls `supabase.auth.getUser()` and redirects unauthenticated `/dashboard` requests to `/auth/sign-in`.

**OAuth Integrations:**
- Stripe Connect OAuth - Vendor account connection flow, not app identity login.
  - Credentials: `NEXT_PUBLIC_STRIPE_CONNECT_CLIENT_ID` and `STRIPE_SECRET_API_KEY`.
  - Scopes: `read_write` in `actions/get-stripe-connect-link.ts`.
  - Callback: `/api/stripe/connect/callback` implemented in `app/api/stripe/connect/callback/route.ts`.
- Google, Apple, and Meta sign-in buttons - UI placeholders only.
  - Implementation: `features/sign-in/components/sign-in-social-buttons.tsx` and `features/basic-sign-in/basic-sign-in.tsx` render buttons/handlers, but no `signInWithOAuth` call or Supabase OAuth provider use is present.
  - Provider config: Supabase Apple external auth is disabled in `supabase/config.toml`; no active Google or Meta provider config is committed.

## Monitoring & Observability

**Error Tracking:**
- None detected. No Sentry, Datadog, LogRocket, Honeycomb, or OpenTelemetry dependency is declared in `package.json`, and no error tracking config file was found.

**Analytics:**
- No application analytics integration detected in app code.
- Supabase local analytics is enabled with Postgres backend in `supabase/config.toml`; this config belongs to the local Supabase stack, not product analytics instrumentation.

**Logs:**
- Application logging uses `console.log` and `console.error` in route handlers, server actions, and client features, including `actions/create-reservation-payment-intent.ts`, `app/api/payment-success/route.ts`, `features/stripe-payment/stripe-payment-provider.tsx`, and `utils/geocoding.ts`.
- Hosting log aggregation is not configured in the repo. If deployed on Vercel, stdout/stderr logs are provided by the platform; repo support for Vercel URL detection lives in `utils/get-base-url.ts`.

## CI/CD & Deployment

**Hosting:**
- Vercel-compatible Next.js hosting is supported in code but not configured with a committed deployment file.
  - Deployment: Not detected. No `vercel.json`, `.github/workflows/*`, Dockerfile, or compose deployment file was found.
  - Environment vars: `utils/get-base-url.ts` supports `NEXT_PUBLIC_CURRENT_ORIGIN` and `VERCEL_URL`; `.gitignore` ignores `.vercel`.
  - README: `README.md` contains the stock Next.js Vercel deployment guidance.

**CI Pipeline:**
- None detected. The repo has no `.github/` directory, CI workflow files, or test command in `package.json`.

## Environment Configuration

**Development:**
- Required app env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SERVICE_ROLE`, `STRIPE_SECRET_API_KEY`, `NEXT_PUBLIC_STRIPE_PUBLIC_API_KEY`, `NEXT_PUBLIC_STRIPE_CONNECT_CLIENT_ID`, and `NEXT_PUBLIC_BASE_URL`.
- Optional URL env vars: `NEXT_PUBLIC_CURRENT_ORIGIN` and `VERCEL_URL` in `utils/get-base-url.ts`.
- Supabase local env vars from `supabase/config.toml`: `OPENAI_API_KEY`, `SENDGRID_API_KEY`, `SUPABASE_AUTH_SMS_TWILIO_AUTH_TOKEN`, `SUPABASE_AUTH_EXTERNAL_APPLE_SECRET`, `S3_HOST`, `S3_REGION`, `S3_ACCESS_KEY`, and `S3_SECRET_KEY`.
- Secrets location: `.env.local` and `.env.local.backup` files are present and were not read; `.gitignore` ignores `.env*`.
- Mock/stub services: Supabase local Inbucket is enabled in `supabase/config.toml` for auth email testing; no Stripe mock server is committed.

**Staging:**
- Not detected. No staging-specific Supabase config, Stripe config, deployment config, or environment file template was found.

**Production:**
- Secrets management: Not committed. Production env vars must be provided by the hosting platform and external service dashboards.
- Data: Production requires a hosted Supabase project compatible with migrations in `supabase/migrations/*.sql` and generated types in `types/supabase.ts`.
- Payments: Production requires Stripe API keys and a Stripe Connect application configured for the callback route in `app/api/stripe/connect/callback/route.ts`.

## Webhooks & Callbacks

**Incoming:**
- Stripe Connect OAuth callback - `/api/stripe/connect/callback` in `app/api/stripe/connect/callback/route.ts`.
  - Verification: Compares `state` query parameter to the `stripe_connect_state` httpOnly cookie created by `actions/get-stripe-connect-link.ts`.
  - Events: OAuth success/error callback; successful exchange stores `stripe_user_id` as `profiles.stripe_account_id`.
- Stripe payment return URL - `/api/payment-success` in `app/api/payment-success/route.ts`.
  - Verification: Retrieves the PaymentIntent by `payment_intent` query parameter using the Stripe SDK and checks `paymentIntent.status === "succeeded"`.
  - Events: Stripe.js `confirmPayment` return target from `features/stripe-payment/stripe-payment-modal.tsx`; this route is a payment return handler, not a Stripe webhook.
- Stripe webhook endpoint - Not detected. `roadmap/reservation-backend.md` references a planned `/app/api/stripe-webhook/route.ts`, but no implemented webhook route exists under `app/api/`.

**Outgoing:**
- Stripe Connect OAuth authorize URL - Generated in `actions/get-stripe-connect-link.ts` with vendor metadata and redirect URI.
- Stripe Connect token exchange - POST to `https://connect.stripe.com/oauth/token` in `app/api/stripe/connect/callback/route.ts`.
- Stripe PaymentIntent operations - Create in `actions/create-reservation-payment-intent.ts`, confirm client-side in `features/stripe-payment/stripe-payment-modal.tsx`, retrieve in `app/api/payment-success/route.ts`.
- Supabase API/database/storage calls - SDK calls throughout `actions/`, `app/api/`, and `utils/`, including storage uploads/removals in `utils/upload-image.ts`, `actions/update-profile-image.ts`, `actions/update-profile-banner-image.ts`, `actions/update-product-variant.ts`, `actions/delete-product-variant.ts`, and `actions/delete-kiosq.ts`.
- OpenStreetMap Nominatim geocoding - Search in `utils/geocoding.ts` and reverse geocoding in `utils/requests/get-city-from-coord.ts`.
- Mapbox tile/style loading - Mapbox GL runtime in `components/ui/map-view.tsx`.

---

*Integration audit: 2026-04-29*
