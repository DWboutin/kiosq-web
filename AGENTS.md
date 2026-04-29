<!-- GSD:project-start source:PROJECT.md -->
## Project

**Kiosq Reservation Pickup Payments**

Kiosq is a bilingual marketplace where local producers manage products, kiosqs, schedules, reservations, and Stripe-connected payments. This project turns the existing reservation foundation into a reliable online product reservation flow: the client reserves and pays online, then picks up the order in person while the producer scans a QR code in the site to confirm the handoff.

The payment model is escrow-like without presenting Kiosq as a legal escrow service: Kiosq records and charges the PaymentIntent on the platform, tracks the producer payout obligation internally, and transfers the producer share only after pickup confirmation.

**Core Value:** Clients can reserve and pay for products online, and producers only receive the order funds after a verified in-person QR pickup confirmation.

### Constraints

- **Tech stack**: Use the existing Next.js App Router, TypeScript, Supabase, Stripe, next-intl, TanStack Query, and component patterns already documented in `.planning/codebase/`.
- **Payment architecture**: Use Stripe Connect separate charges and transfers for delayed producer payout; avoid relying on manual capture for pickup windows that may exceed card authorization validity.
- **Money safety**: Store all payment amounts in minor units consistently; centralize amount calculations, penalty calculations, transfer amounts, refunds, and Stripe metadata.
- **Verification**: Payment finalization must be server-owned and idempotent; QR scan confirmation must not create duplicate transfers or duplicate orders.
- **Security**: Remove sensitive payment logging, avoid exposing client secrets beyond the client confirmation flow, and treat QR pickup tokens as single-use, expiring, hard-to-guess credentials.
- **Authorization**: Client and producer dashboards must enforce ownership at the route/query layer, not rely only on broad RLS behavior.
- **UX**: The first usable slice must complete the core reservation-payment-pickup loop before expanding dashboard polish and secondary history management.
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages
- TypeScript 5.8.3 - Application source, server actions, API routes, React components, utilities, and generated database types in `app/`, `actions/`, `features/`, `components/`, `utils/`, `hooks/`, `stores/`, and `types/supabase.ts`; configured by `tsconfig.json` and declared in `package.json`.
- TSX / React JSX - Client and server component templates in `app/`, `features/`, and `components/`; React 19.1.0 is resolved in `package-lock.json`.
- SQL and PL/pgSQL - Supabase schema migrations, RLS policies, triggers, RPC functions, and seed data in `supabase/migrations/*.sql` and `supabase/seed.sql`.
- JavaScript ESM - Tooling configuration in `eslint.config.mjs` and `postcss.config.mjs`.
- CSS / Tailwind CSS - Global styling and design tokens in `app/globals.css`, with Tailwind scanning configured in `tailwind.config.ts`.
- JSON - Package metadata in `package.json`, lockfile data in `package-lock.json`, shadcn/ui settings in `components.json`, and locale messages in `messages/en.json` and `messages/fr.json`.
## Runtime
- Node.js runtime for Next.js 15.2.4. The repo has no `.nvmrc`, `.node-version`, or `package.json` `engines` pin; the resolved Next.js package in `package-lock.json` declares support for Node `^18.18.0 || ^19.8.0 || >=20.0.0`.
- Browser runtime for React client components, Mapbox GL rendering, geolocation, local storage, and session storage; examples include `components/ui/map-view.tsx`, `utils/get-geolocation.ts`, `stores/user-store.ts`, and `stores/data-table-visibility-store.ts`.
- Supabase local runtime is configured in `supabase/config.toml`: API on port `54321`, Postgres major version `15`, Studio on `54323`, storage enabled, auth enabled, realtime enabled, analytics enabled, and edge runtime enabled with Deno major version `1`.
- npm - `package-lock.json` is present with lockfile version 3.
- No `packageManager` field is declared in `package.json`.
- Other managers are mentioned only by the stock Next.js `README.md`; the committed lockfile establishes npm as the repo package manager.
## Frameworks
- Next.js 15.2.4 - App Router web framework for pages, layouts, middleware, server actions, and route handlers in `app/`, `middleware.ts`, and `actions/`.
- React 19.1.0 / React DOM 19.1.0 - UI runtime for TSX components in `components/`, `features/`, and `app/`.
- Supabase - Auth, Postgres, storage, migrations, generated types, and server/client SDK access through `@supabase/supabase-js` 2.49.4, `@supabase/ssr` 0.6.1, `supabase/config.toml`, `utils/supabase/server.ts`, `utils/supabase/client.ts`, `utils/supabase/admin.ts`, and `utils/supabase/middleware.ts`.
- next-intl 4.0.2 - Locale routing and message loading through `i18n/request.ts`, `i18n/routing.ts`, `i18n/navigation.ts`, `middleware.ts`, `messages/en.json`, and `messages/fr.json`.
- Tailwind CSS 4.1.3 with `@tailwindcss/postcss` 4.x - Utility styling through `app/globals.css`, `tailwind.config.ts`, and `postcss.config.mjs`.
- shadcn/ui plus Radix UI primitives - Component system configured by `components.json`, implemented under `components/ui/`, with Lucide icons from `lucide-react` 0.487.0.
- Not detected - No `jest.config.*`, `vitest.config.*`, `playwright.config.*`, `cypress.config.*`, `*.test.*`, or `*.spec.*` files were found.
- No test command is declared in `package.json`.
- Next.js CLI - `npm run dev`, `npm run build`, and `npm run start` in `package.json`.
- TypeScript compiler 5.8.3 - Strict type checking configured in `tsconfig.json`; `noEmit` is enabled and path alias `@/*` maps to `./*`.
- ESLint 9.24.0 with `eslint-config-next` 15.2.4 - Flat config in `eslint.config.mjs`; `react-hooks/exhaustive-deps` is disabled.
- Supabase CLI 2.20.12 - Database and type-generation scripts in `package.json`, with Supabase project/local stack configuration in `supabase/config.toml`.
- PostCSS - Tailwind CSS PostCSS plugin configured in `postcss.config.mjs`.
- GSD workflow skills - Local planning and execution skill definitions live under `.codex/skills/*/SKILL.md`; the codebase mapping workflow is defined in `.codex/skills/gsd-map-codebase/SKILL.md` and templates are under `.codex/get-shit-done/templates/codebase/`.
## Key Dependencies
- `next` 15.2.4 - Core application framework; routes live in `app/`, middleware in `middleware.ts`, config in `next.config.ts`.
- `react` 19.1.0 and `react-dom` 19.1.0 - Component runtime for `components/`, `features/`, and route UI in `app/`.
- `@supabase/supabase-js` 2.49.4 and `@supabase/ssr` 0.6.1 - Database, auth, storage, and cookie-backed sessions through `utils/supabase/*.ts`.
- `stripe` 18.3.0, `@stripe/react-stripe-js` 3.7.0, and `@stripe/stripe-js` 7.5.0 - Stripe Connect onboarding and card payment flows in `actions/get-stripe-connect-link.ts`, `actions/create-reservation-payment-intent.ts`, `app/api/stripe/connect/callback/route.ts`, `features/stripe-payment/stripe-payment-provider.tsx`, and `features/stripe-payment/stripe-payment-modal.tsx`.
- `next-intl` 4.0.2 - Internationalized routing and translations in `i18n/`, `middleware.ts`, and `messages/`.
- `@tanstack/react-query` 5.72.2 - Client data fetching and cache state in `features/providers/react-query-provider.tsx`, `hooks/use-*.ts`, and `features/*/hooks/*.ts`.
- `zustand` 5.0.3 with `immer` 10.1.1 - Client state stores in `stores/user-store.ts`, `stores/data-table-visibility-store.ts`, and `stores/categories-store.ts`.
- `mapbox-gl` 3.13.0 - Interactive map rendering in `components/ui/map-view.tsx`.
- `react-hook-form` 7.55.0, `@hookform/resolvers` 5.0.1, and `zod` 3.24.2 - Form validation patterns in `features/*/utils/*validation-schema.ts` and form hooks under `features/*/hooks/`.
- `supabase` 2.20.12 - CLI dependency for `npm run update-types`, `npm run db:push`, `npm run db:reset`, `npm run db:disable-trigger`, and `npm run db:enable-trigger` in `package.json`.
- `tailwindcss` 4.1.3, `@tailwindcss/postcss` 4.x, `tailwind-merge` 3.2.0, `clsx` 2.1.1, and `class-variance-authority` 0.7.1 - Styling and component variant infrastructure in `components/ui/` and `lib/utils.ts`.
- Radix UI packages - Accessible UI primitives for dialogs, dropdowns, selects, tabs, accordions, switches, checkboxes, tooltips, labels, sliders, and radio groups in `components/ui/`.
- `sonner` 2.0.3 - Toast notifications mounted in `app/[locale]/layout.tsx` through `components/ui/sonner.tsx`.
## Configuration
- Runtime environment variables are referenced in code, not stored in committed configuration values: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SERVICE_ROLE`, `STRIPE_SECRET_API_KEY`, `NEXT_PUBLIC_STRIPE_PUBLIC_API_KEY`, `NEXT_PUBLIC_STRIPE_CONNECT_CLIENT_ID`, `NEXT_PUBLIC_BASE_URL`, `NEXT_PUBLIC_CURRENT_ORIGIN`, `VERCEL_URL`, and `NODE_ENV`.
- Supabase local configuration references optional or disabled service variables in `supabase/config.toml`: `OPENAI_API_KEY` for Supabase Studio AI, `SENDGRID_API_KEY` in commented SMTP config, `SUPABASE_AUTH_SMS_TWILIO_AUTH_TOKEN` for disabled Twilio SMS auth, `SUPABASE_AUTH_EXTERNAL_APPLE_SECRET` for disabled Apple OAuth, and `S3_HOST`, `S3_REGION`, `S3_ACCESS_KEY`, `S3_SECRET_KEY` for experimental OrioleDB/S3 settings.
- `.env.local` and `.env.local.backup` are present and were not read; `.gitignore` ignores `.env*`.
- Supabase image URLs are accepted by Next Image through `next.config.ts`, which derives the remote hostname from `NEXT_PUBLIC_SUPABASE_URL`.
- `package.json` - npm scripts and dependency declarations.
- `package-lock.json` - exact dependency versions and package engine metadata.
- `next.config.ts` - Next.js config, `next-intl` plugin, and Supabase remote image host.
- `tsconfig.json` - strict TypeScript config and `@/*` path alias.
- `eslint.config.mjs` - ESLint flat config using Next.js core web vitals and TypeScript rules.
- `tailwind.config.ts` - Tailwind content globs for `pages/`, `components/`, and `app/`.
- `postcss.config.mjs` - Tailwind CSS PostCSS plugin.
- `components.json` - shadcn/ui style, RSC, TSX, Tailwind, alias, and Lucide icon settings.
- `supabase/config.toml` - local Supabase stack, auth, storage, realtime, analytics, and database settings.
## Platform Requirements
- Node.js compatible with Next.js 15.2.4 (`^18.18.0 || ^19.8.0 || >=20.0.0` from `package-lock.json`).
- npm with `package-lock.json`; install with `npm install` and run the app with `npm run dev` from `package.json`.
- Supabase CLI for database workflows in `package.json`; local Supabase settings in `supabase/config.toml` require a local Supabase stack when using `supabase start`, `npm run db:reset`, or related scripts.
- Environment variables belong in local env files such as `.env.local`; file contents are not committed because `.gitignore` ignores `.env*`.
- Next.js deployment target is not locked by repo config. `README.md` contains the stock Vercel deployment guidance, `.gitignore` ignores `.vercel`, and `utils/get-base-url.ts` supports `VERCEL_URL`, so Vercel is the supported path in code but no `vercel.json` or CI deployment workflow is committed.
- Supabase hosted project is required for production database, auth, storage, and generated URL configuration; app code reads Supabase connection details from `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SERVICE_ROLE`.
- Stripe account configuration is required for production payments and Connect onboarding through `STRIPE_SECRET_API_KEY`, `NEXT_PUBLIC_STRIPE_PUBLIC_API_KEY`, and `NEXT_PUBLIC_STRIPE_CONNECT_CLIENT_ID`.
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Naming Patterns
- Use kebab-case for app-authored TypeScript and TSX files: `actions/create-product.ts`, `features/product-form-drawer/hooks/use-product-form.ts`, `components/ui/card-admin-product.tsx`, `utils/requests/get-product-categories.ts`.
- Use Next.js reserved filenames in the App Router: `app/[locale]/layout.tsx`, `app/[locale]/(main)/page.tsx`, `app/api/profiles/[profileId]/products/route.ts`.
- Use feature folders in kebab-case with `components/`, `hooks/`, and `utils/` subfolders when a feature needs them: `features/kiosq-form-drawer/components/kiosq-form.tsx`, `features/kiosq-form-drawer/hooks/use-kiosq-form.ts`, `features/kiosq-form-drawer/utils/kiosq-form-validation-schema.ts`.
- Use `use-*.ts` filenames for reusable hooks: `hooks/use-product-categories.ts`, `hooks/use-current-user-profile-id-products.ts`, `features/location-manager/hooks/use-location-manager-modal.ts`.
- Use `*-factory.ts` filenames for runtime data-shape mappers, not class factories: `utils/factories/authenticated-user-product-factory.ts`, `utils/factories/product-factory.ts`.
- Use `*-validation-schema.ts` filenames for Zod schemas: `features/product-form-drawer/utils/product-form-validation-schema.ts`, `features/location-manager/utils/location-manager-validation-schema.ts`.
- No test file naming convention is established; no `*.test.*`, `*.spec.*`, `tests/`, or `__tests__/` files are detected in the repo.
- Use camelCase for functions and exported function values: `createProduct` in `actions/create-product.ts`, `getProductCategories` in `utils/requests/get-product-categories.ts`, `sortDataHierarchically` in `utils/data-table-utils.ts`.
- Use `useX` for hooks and keep the exported hook name aligned with the file name: `useProductForm` in `features/product-form-drawer/hooks/use-product-form.ts`, `useProductCategories` in `hooks/use-product-categories.ts`.
- Use `handleX` for UI event handlers and action callbacks: `handleRequestLocation` in `hooks/use-geolocation.ts`, `handleFormSubmit` returned from `features/kiosq-form-drawer/hooks/use-kiosq-form.ts`.
- Use domain-specific action names for server actions, usually verb + resource: `createKiosq` in `actions/create-kiosq.ts`, `updateProduct` in `actions/update-product.ts`, `deleteProductCategory` in `actions/delete-product-category.ts`.
- Use `domainFactory` and plural `domainFactories` for data mapping helpers: `authenticatedUserProductFactory` in `utils/factories/authenticated-user-product-factory.ts`, `productsFactory` in `utils/factories/product-factory.ts`.
- Async functions do not use a special prefix; async behavior is expressed by `async` and return types, as in `fetchServerAuthenticated` in `utils/fetch-server-authenticated.ts`.
- Use camelCase for local variables and derived values: `defaultValues`, `validationSchema`, `drawerRef`, and `filteredNameTranslations` in `features/product-form-drawer/hooks/use-product-form.ts`.
- Use UPPER_SNAKE_CASE for cross-module constants: `PRODUCT_CATEGORIES`, `CATEGORIES_ORDER`, `UNITS`, `LOCALES`, and `SLUG_REGEX` in `utils/constants.ts`.
- Use lower camelCase for module-local defaults and helpers: `productDefaultValues` and `fillProductFormValues` in `features/product-form-drawer/hooks/use-product-form.ts`.
- Preserve database column names in payloads sent to Supabase: `name_translations`, `profile_id`, and `checklist_translations` in `actions/create-product.ts`.
- Use descriptive booleans with `is`, `has`, or `can` prefixes: `isSubmitting` in `features/product-form-drawer/hooks/use-product-form.ts`, `hasNextPage` in `app/api/profiles/[profileId]/products/route.ts`, `canRetryLocation` in `hooks/use-geolocation.ts`.
- Use PascalCase for type aliases and interfaces: `ProductFormValues` in `features/product-form-drawer/utils/product-form-validation-schema.ts`, `UserStore` in `stores/user-store.ts`, `DataTableProps` in `components/ui/data-table.tsx`.
- Prefer type aliases for object models and composed shapes: `AuthenticatedUserProductWithVariantsAndPrices` in `utils/factories/authenticated-user-product-factory.ts`, `RawReservationWithOrdersAndRelations` in `types/app.ts`.
- Interfaces are used for component props and public hook contracts when the shape is intended to be extended or read as a contract: `ProductCategoriesSelectors` in `hooks/use-product-categories.ts`, `DataTableProps` in `components/ui/data-table.tsx`.
- No custom enum naming convention is present; database enum values are exposed through generated Supabase types in `types/supabase.ts` and aliases in `types/app.ts`.
## Code Style
- No Prettier, Biome, or formatter config file is present; formatting is convention-driven by existing files such as `features/product-form-drawer/hooks/use-product-form.ts` and `actions/create-product.ts`.
- Use 2-space indentation in TypeScript and TSX files, matching `app/[locale]/layout.tsx`, `components/ui/data-table.tsx`, and `stores/user-store.ts`.
- Use double quotes for strings and imports in app-authored code: `actions/create-product.ts`, `features/kiosq-form-drawer/hooks/use-kiosq-form.ts`, `utils/constants.ts`.
- Use semicolons in app-authored code: `actions/delete-product-category.ts`, `hooks/use-product-categories.ts`, `utils/cache-keys.ts`.
- Match local style in generated or shadcn-originated UI files; `components/ui/button.tsx` and `lib/utils.ts` omit semicolons and include shadcn-style formatting.
- Keep JSX props multiline when elements have several props, as in `features/product-form-drawer/components/product-form.tsx` and `components/ui/data-table.tsx`.
- ESLint uses the flat config in `eslint.config.mjs`.
- The configured rule set extends `next/core-web-vitals` and `next/typescript` from `eslint-config-next`.
- `react-hooks/exhaustive-deps` is disabled in `eslint.config.mjs`; hook dependency arrays still appear intentionally maintained in files like `features/product-category-form-drawer/hooks/use-product-category-form.ts`.
- The available lint script is `npm run lint` from `package.json`.
- No formatter script is configured in `package.json`.
## Import Organization
- Preserve the surrounding import grouping when editing existing files; `components/ui/data-table.tsx` groups TanStack imports, UI imports, state hooks, icons, and local helpers by practical dependency clusters.
- Do not introduce barrel-file imports unless a barrel already exists for the target API; direct imports such as `@/features/product-form-drawer/utils/product-form-validation-schema` are common.
- Keep generated CSS imports near layout-level framework imports, as in `app/[locale]/layout.tsx`.
- `@/*` maps to the repository root through `tsconfig.json`.
- shadcn aliases in `components.json` map `@/components`, `@/components/ui`, `@/lib`, `@/hooks`, and `@/lib/utils`.
- Internal imports should use aliases like `@/actions/create-product`, `@/types/app`, and `@/utils/supabase/server`.
## Error Handling
- Server actions throw Supabase errors and explicit invariant errors after each database/auth step, as in `actions/create-product.ts` and `actions/create-kiosq.ts`.
- Server actions that wrap multiple operations use `try/catch`, log, and throw a user-safe error when appropriate, as in `actions/delete-product-category.ts` and `actions/update-profile-banner-image.ts`.
- API routes return `NextResponse.json({ error }, { status })` for validation and persistence failures, as in `app/api/profiles/[profileId]/products/route.ts` and `app/api/categories/route.ts`.
- Client request helpers catch fetch failures, log contextual messages, and throw generic request errors, as in `utils/requests/get-product-categories.ts` and `utils/requests/get-authenticated-user-profile-id-products.ts`.
- Client form hooks surface mutation failures through `toast.error(...)` in React Query `onError` callbacks, as in `features/product-form-drawer/hooks/use-product-form.ts` and `features/kiosq-form-drawer/hooks/use-kiosq-form.ts`.
- Context hooks throw immediately when used outside their provider: `useLocationManagerContext` in `features/location-manager/location-manager-provider.tsx`, `useStripePayment` in `features/stripe-payment/stripe-payment-provider.tsx`.
- No custom `Error` subclasses or `Result<T, E>` helpers are detected.
- Throw `Error` for application invariants such as missing users or profiles: `actions/create-product.ts`, `features/location-manager/location-manager-provider.tsx`.
- Return response errors at route boundaries instead of throwing through the request lifecycle: `app/api/profiles/[profileId]/reservation-settings/route.ts`.
- Use field-level `setError` for form validation conflicts that the UI can repair, as in `features/product-category-form-drawer/hooks/use-product-category-form.ts`.
## Logging
- Logging uses the built-in `console` API; no logger package is configured in `package.json`.
- Error-level logging appears in actions, API routes, request helpers, stores, and client flows: `actions/delete-product-variant.ts`, `app/api/profiles/[profileId]/products/route.ts`, `stores/user-store.ts`.
- Use `console.error` with a short contextual message at server/API/request boundaries: `utils/requests/get-product-categories.ts`, `app/api/kiosqs/[profileId]/route.ts`.
- Use `console.warn` for recoverable cleanup failures, as in `actions/update-profile-banner-image.ts`.
- Avoid adding new `console.log` debug statements; existing debug logs are present in `features/stripe-payment/stripe-payment-provider.tsx`, `features/stripe-payment/stripe-payment-modal.tsx`, `utils/requests/get-related-products.ts`, and `actions/update-schedule.ts`.
- Do not log secrets or environment values; env files such as `.env.local` and `.env.local.backup` are present but not read.
## Comments
- Comments are sparse; add comments for non-obvious behavior, cache semantics, layout calculations, or external API constraints.
- Keep comments focused on why a branch exists, not what each line does, matching `utils/cache-keys.ts`, `components/ui/data-table.tsx`, and `features/dashboard-breadcrumb/hooks/use-dashboard-breadcrumb-paths.ts`.
- Avoid broad TODO/FIXME comments; no `TODO`, `FIXME`, `HACK`, or `XXX` comments are detected in `app/`, `actions/`, `components/`, `features/`, `hooks/`, `utils/`, `stores/`, or `types/`.
- JSDoc is used selectively for shared utility contracts, such as `CacheKeyConfig` and `cacheKeys` in `utils/cache-keys.ts`.
- JSDoc is not required for internal React components or server actions; most files rely on type names and local structure, as in `features/product-form-drawer/hooks/use-product-form.ts`.
- Not detected in application source.
## Function Design
- Keep small UI wrappers and hooks focused around one responsibility, as in `hooks/use-product-categories.ts`, `utils/invalidators-hooks/use-products-invalidator.ts`, and `actions/revalidators/product-revalidator.ts`.
- Extract complex form logic into a hook and keep JSX in a sibling component, following `features/product-form-drawer/hooks/use-product-form.ts` plus `features/product-form-drawer/components/product-form.tsx`.
- Large shared components exist, such as `components/ui/data-table.tsx` and `features/schedule-form-drawer/components/schedule-form.tsx`; prefer extracting helpers when adding substantial behavior.
- Use a single object parameter for operations with multiple inputs: `updateProduct` in `actions/update-product.ts`, `deleteProductVariant` in `actions/delete-product-variant.ts`, `useProductsInvalidator` in `utils/invalidators-hooks/use-products-invalidator.ts`.
- Use positional parameters for simple hooks and helpers with one or two values: `useKiosqsByProfileId(profileId)` in `hooks/use-kiosqs-by-profile-id.ts`, `slugify(text)` in `utils/slugify.ts`.
- Use defaulted object props for optional hook configuration, as in `useProductForm({ editMode = false, productId } = {})` in `features/product-form-drawer/hooks/use-product-form.ts`.
- Custom hooks return `{ selectors, actions }` when they expose state plus commands: `hooks/use-geolocation.ts`, `hooks/use-current-user-profile-id-products.ts`, `features/product-category-form-drawer/hooks/use-product-category-form.ts`.
- Server actions return persisted domain data when callers need follow-up invalidation or UI state: `actions/create-product.ts`, `actions/create-kiosq.ts`.
- Request helpers return factory-normalized objects rather than raw API payloads, as in `utils/requests/get-product-categories.ts`.
- Factories map snake_case/database shapes to camelCase UI models, as in `utils/factories/authenticated-user-product-factory.ts`.
## Module Design
- Prefer named exports for reusable components, hooks, actions, utilities, stores, and factories: `ProductForm` in `features/product-form-drawer/components/product-form.tsx`, `useUserStore` in `stores/user-store.ts`, `cacheKeys` in `utils/cache-keys.ts`.
- Use default exports only where the framework requires or strongly expects them: route pages/layouts like `app/[locale]/(main)/page.tsx`, `app/[locale]/layout.tsx`, and next-intl setup in `i18n/request.ts`.
- Keep server-only modules explicit with `"use server";` in files such as `actions/create-product.ts` and `utils/supabase/admin.ts`.
- Keep client-only interactive modules explicit with `"use client";` in files such as `components/ui/data-table.tsx` and `features/location-manager/location-manager-provider.tsx`.
- Barrel files are not a dominant pattern; direct imports from concrete files are standard in `features/product-form-drawer/hooks/use-product-form.ts`, `hooks/use-product-categories.ts`, and `app/[locale]/layout.tsx`.
- Add new exports from the implementation file itself unless a local index module already exists for that area.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## System Overview
```text
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
- Use route groups for product marketplace, auth, and dashboard shells (`app/[locale]/(main)/layout.tsx`, `app/[locale]/auth/layout.tsx`, `app/[locale]/dashboard/layout.tsx`).
- Use server components and route-local async helpers for initial dashboard data fetches (`app/[locale]/dashboard/products/page.tsx`, `app/[locale]/dashboard/your-kiosqs/page.tsx`).
- Use API routes as the read-oriented service boundary and server actions as the mutation boundary (`app/api/products/[productId]/route.ts`, `actions/create-product.ts`).
- Use factories for application DTO normalization instead of exposing raw Supabase row names to UI code (`utils/factories/product-factory.ts`, `utils/factories/authenticated-user-product-factory.ts`).
- Use shared cache metadata for Next.js cache tags and TanStack Query keys (`utils/cache-keys.ts`, `actions/revalidators/product-revalidator.ts`, `utils/invalidators-hooks/use-products-invalidator.ts`).
- Use feature directories for interactive workflows with colocated hooks, schemas, and subcomponents (`features/product-form-drawer/`, `features/schedule-form-drawer/`, `features/location-manager/`).
## Layers
- Purpose: Authenticate dashboard access and localize non-API requests.
- Location: `middleware.ts`, `utils/supabase/middleware.ts`, `i18n/create-pathnames-mappings.ts`.
- Contains: Supabase session refresh, unauthenticated redirects, next-intl middleware configuration.
- Depends on: `@supabase/ssr`, `next-intl/middleware`, `AppConfig` from `app-config.ts`.
- Used by: Every matched page request except `app/api/`, `_next`, `_vercel`, and static assets.
- Purpose: Define layouts, pages, metadata, loading states, and server-rendered data needs.
- Location: `app/[locale]/`, `app/[locale]/(main)/`, `app/[locale]/dashboard/`, `app/[locale]/auth/`.
- Contains: `page.tsx`, `layout.tsx`, `loading.tsx`, route groups, dynamic segments.
- Depends on: `utils/requests/`, `fetchServerAuthenticated`, `components/sections/`, `features/`, `next-intl/server`.
- Used by: Browser navigation through Next.js App Router.
- Purpose: Serve JSON data for server components and React Query hooks.
- Location: `app/api/`.
- Contains: `route.ts` files with `GET` or `POST` handlers.
- Depends on: `utils/supabase/server.ts`, `utils/factories/`, `NextResponse`.
- Used by: `utils/requests/`, dashboard page-local fetch helpers, and client hooks.
- Purpose: Execute mutations, uploads, Stripe integration calls, and explicit cache revalidation.
- Location: `actions/`, `actions/revalidators/`.
- Contains: `"use server"` functions for products, kiosqs, schedules, profiles, reservations, Stripe Connect, and session cleanup.
- Depends on: `utils/supabase/server.ts`, `utils/upload-image.ts`, `next/cache`, Stripe SDK.
- Used by: Feature hooks and client components in `features/`.
- Purpose: Centralize fetch calls for reusable domain reads.
- Location: `utils/requests/`.
- Contains: `get-*.ts` functions that call internal API routes and throw request-level errors.
- Depends on: `utils/cache-keys.ts`, `utils/get-base-url.ts`.
- Used by: Server pages, React Query hooks, and feature components.
- Purpose: Normalize Supabase row shapes, relationship payloads, JSONB translation fields, and generated database types.
- Location: `utils/factories/`, `types/app.ts`, `types/supabase.ts`.
- Contains: DTO types and `*Factory` mapping functions.
- Depends on: Generated Supabase types from `types/supabase.ts`.
- Used by: API routes, request helpers, hooks, components, and form logic.
- Purpose: Own domain-specific UI flows and interaction state.
- Location: `features/`.
- Contains: Feature root components, `components/`, `hooks/`, and `utils/*validation-schema.ts`.
- Depends on: `components/ui/`, `actions/`, `hooks/`, `utils/factories/`, `react-hook-form`, `zod`, React Query.
- Used by: Pages in `app/[locale]/`, sections in `components/sections/`, and client-page orchestrators.
- Purpose: Provide reusable UI primitives, icons, skeletons, sections, and dashboard client-page wrappers.
- Location: `components/ui/`, `components/sections/`, `components/skeletons/`, `components/client-pages/`.
- Contains: Radix/shadcn wrappers, cards, tables, drawers, form utilities, headers, skeleton states.
- Depends on: `lib/utils.ts`, `stores/`, `features/`, `next-intl`.
- Used by: App routes and feature modules.
- Purpose: Coordinate browser state, React Query data, persisted preferences, contexts, and cache invalidation.
- Location: `hooks/`, `stores/`, `features/providers/react-query-provider.tsx`, feature provider files.
- Contains: `useQuery` hooks, Zustand stores, React contexts, invalidator hooks.
- Depends on: `@tanstack/react-query`, `zustand`, browser storage, request helpers.
- Used by: Client pages and interactive features.
- Purpose: Store domain data, auth sessions, images, geolocation indexes, reservations, and payment records.
- Location: `supabase/migrations/`, `utils/supabase/`, `utils/upload-image.ts`.
- Contains: Postgres schema, RLS policies, triggers, storage policies, Supabase SSR clients, PostGIS RPC functions.
- Depends on: Supabase Auth, Postgres, Storage, PostGIS, environment variables.
- Used by: API routes, server actions, middleware, and generated types.
- Purpose: Guide GSD planning/execution workflows and codebase intelligence.
- Location: `.codex/skills/`, `.codex/agents/`, `.planning/codebase/`.
- Contains: GSD skill instructions, mapper/planner/executor agents, and generated architecture/structure docs.
- Depends on: Local agent runtime, not Next.js runtime.
- Used by: GSD commands and future implementation agents.
## Data Flow
### Public Product Detail Path
### Authenticated Dashboard Read Path
### Product Mutation Path
### Reservation and Payment Path
### Geolocation Vendor Discovery Path
- Supabase auth state is stored in cookies and refreshed by `utils/supabase/middleware.ts`.
- Server-rendered data uses Next.js cache tags from `utils/cache-keys.ts` and revalidators in `actions/revalidators/`.
- Client data uses TanStack Query from `features/providers/react-query-provider.tsx` and hooks in `hooks/`.
- Browser-persisted UI state uses Zustand stores in `stores/user-store.ts` and `stores/data-table-visibility-store.ts`.
- Feature-local state uses React contexts in `features/location-manager/location-manager-provider.tsx`, `features/product-details/product-details-provider.tsx`, and `features/reservation-button/reservation-button.tsx`.
## Key Abstractions
- Purpose: API boundary for JSON reads and callbacks.
- Examples: `app/api/products/[productId]/route.ts`, `app/api/users/current/route.ts`, `app/api/profiles/check-slug/route.ts`.
- Pattern: Export `GET` or `POST`, create Supabase server client, validate/authenticate, query, map, return `NextResponse.json`.
- Purpose: Mutation boundary callable from client components and hooks.
- Examples: `actions/create-product.ts`, `actions/update-vendor-profile.ts`, `actions/create-reservation.ts`.
- Pattern: `"use server"` module, `createClient()`, perform Supabase writes, throw on failure, call a revalidator when cache state changes.
- Purpose: Reusable fetch facade for internal API routes.
- Examples: `utils/requests/get-product-by-id.ts`, `utils/requests/get-product-categories.ts`, `utils/requests/get-vendor-profile-from-slug.ts`.
- Pattern: Build URL with `getBaseUrl()` for server-safe absolute fetches, attach cache metadata from `cacheKeys`, return typed DTOs.
- Purpose: Translate database rows into stable UI/domain data shapes.
- Examples: `utils/factories/product-factory.ts`, `utils/factories/authenticated-user-profiles-factory.ts`, `utils/factories/profiles-with-kiosqs-factory.ts`.
- Pattern: Export a DTO type, a singular factory, and sometimes a plural factory.
- Purpose: Keep Next.js tags and React Query keys aligned.
- Examples: `utils/cache-keys.ts`, `actions/revalidators/product-revalidator.ts`, `utils/invalidators-hooks/use-products-invalidator.ts`.
- Pattern: Each domain key exposes `tag`, `revalidate`, and `queryKey`.
- Purpose: Encapsulate feature form state, mutations, selectors, and actions.
- Examples: `features/product-form-drawer/hooks/use-product-form.ts`, `features/categories-table/hooks/use-categories-table.ts`, `features/location-manager/hooks/use-location-manager-modal.ts`.
- Pattern: Return `{ selectors, actions }` and keep UI components declarative.
- Purpose: Share workflow-local state across nested client components.
- Examples: `features/location-manager/location-manager-provider.tsx`, `features/product-details/product-details-provider.tsx`, `features/stripe-payment/stripe-payment-provider.tsx`.
- Pattern: `createContext`, exported `use*Context` hook, provider mounted near the feature root.
- Purpose: Provide typed access to Supabase tables/enums and app-level type aliases.
- Examples: `types/supabase.ts`, `types/app.ts`.
- Pattern: Generated `Database` type feeds aliases such as `RawProduct`, `RawProfile`, `Locales`, and `UserData`.
## Entry Points
- Location: `middleware.ts`
- Triggers: Next.js middleware for matched non-API paths.
- Responsibilities: Call Supabase session update, short-circuit redirects, run next-intl path routing.
- Location: `app/[locale]/layout.tsx`
- Triggers: Every localized app route.
- Responsibilities: Validate locale, load messages, mount global providers, import `app/globals.css`.
- Location: `app/[locale]/(main)/page.tsx`
- Triggers: Localized home page route.
- Responsibilities: Fetch authenticated user data, show onboarding when needed, render closest vendors.
- Location: `app/[locale]/dashboard/page.tsx`, `app/[locale]/dashboard/layout.tsx`
- Triggers: Authenticated dashboard routes under `/[locale]/dashboard`.
- Responsibilities: Render dashboard shell and management pages for products, kiosqs, schedules, reservations, settings, and admin categories.
- Location: `app/[locale]/auth/sign-in/page.tsx`, `app/[locale]/auth/verify-otp/page.tsx`
- Triggers: Sign-in and OTP verification routes.
- Responsibilities: Render Supabase OTP authentication features.
- Location: `app/api/**/route.ts`
- Triggers: Internal fetches, React Query hooks, Stripe redirects, and slug checks.
- Responsibilities: Read data, validate params, enforce auth, return JSON or redirects.
- Location: `actions/*.ts`
- Triggers: Client form submissions, buttons, Stripe flow, onboarding, image upload flows.
- Responsibilities: Mutate Supabase and external services, then revalidate cache.
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
### Split Locale Configuration
### Raw Route Logic Used as Business Logic
## Error Handling
- Route handlers use `try/catch`, `console.error`, and `NextResponse.json` status codes in `app/api/products/[productId]/route.ts`, `app/api/categories/route.ts`, and `app/api/users/current/route.ts`.
- Server actions throw Supabase and domain errors directly in `actions/create-product.ts` and wrap unknown failures in `actions/update-product.ts`.
- Request helpers log and rethrow generic request failures in `utils/requests/get-product-by-id.ts` and `utils/requests/get-vendor-profile-from-slug.ts`.
- Client mutations show success/error toasts through feature hooks such as `features/product-form-drawer/hooks/use-product-form.ts`.
- Auth and Stripe callback failures redirect through `utils/supabase/middleware.ts`, `app/api/stripe/connect/callback/route.ts`, and `app/api/payment-success/route.ts`.
## Cross-Cutting Concerns
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
