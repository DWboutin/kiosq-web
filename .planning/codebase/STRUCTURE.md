# Codebase Structure

**Analysis Date:** 2026-04-29

## Directory Layout

```
kiosq-web/
├── app/                  # Next.js App Router pages, layouts, API routes, global CSS
│   ├── [locale]/         # Localized public, auth, dashboard, payment pages
│   └── api/              # Route handlers for internal JSON APIs and callbacks
├── actions/              # Server actions and Next.js cache revalidators
├── components/           # Shared UI primitives, sections, skeletons, client page wrappers
├── features/             # Feature-sliced interactive UI flows with hooks/schemas/components
├── hooks/                # Reusable React Query and browser utility hooks
├── stores/               # Zustand stores for persisted client state
├── utils/                # Data requests, factories, Supabase clients, shared helpers
├── types/                # Generated Supabase types and application type aliases
├── i18n/                 # next-intl routing, navigation, request, pathname mapping
├── messages/             # Locale JSON messages
├── supabase/             # Database migrations, seed data, maintenance SQL scripts
├── public/               # Static images, logos, placeholders, SVG assets
├── lib/                  # shadcn utility helper
├── roadmap/              # Feature planning notes outside runtime code
├── .codex/               # Local GSD skills, agents, hooks, templates
├── .planning/            # GSD project artifacts and codebase maps
├── package.json          # npm scripts and dependencies
├── next.config.ts        # Next.js configuration
├── tsconfig.json         # TypeScript configuration and `@/*` alias
├── tailwind.config.ts    # Tailwind content configuration
├── components.json       # shadcn/ui configuration
└── eslint.config.mjs     # ESLint flat config
```

## Directory Purposes

**`app/`:**
- Purpose: Next.js App Router source for pages, layouts, loading states, API route handlers, and global styles.
- Contains: `page.tsx`, `layout.tsx`, `loading.tsx`, `route.ts`, `globals.css`.
- Key files: `app/[locale]/layout.tsx`, `app/[locale]/(main)/page.tsx`, `app/[locale]/dashboard/layout.tsx`, `app/api/products/[productId]/route.ts`.
- Subdirectories: `app/[locale]/` for localized UI routes, `app/api/` for server route handlers, `app/lib/` is empty.

**`app/[locale]/`:**
- Purpose: Localized application route tree.
- Contains: Route groups, authenticated dashboard pages, auth pages, payment result pages.
- Key files: `app/[locale]/layout.tsx`, `app/[locale]/payment-success/page.tsx`, `app/[locale]/payment-error/page.tsx`.
- Subdirectories: `app/[locale]/(main)/`, `app/[locale]/auth/`, `app/[locale]/dashboard/`.

**`app/[locale]/(main)/`:**
- Purpose: Public marketplace shell and routes.
- Contains: Home page, vendor profile pages, product detail pages.
- Key files: `app/[locale]/(main)/layout.tsx`, `app/[locale]/(main)/vendors/[slug]/layout.tsx`, `app/[locale]/(main)/products/[slug]/[productId]/page.tsx`.
- Subdirectories: `vendors/[slug]/` for vendor routes, `products/[slug]/[productId]/` for product detail routes.

**`app/[locale]/dashboard/`:**
- Purpose: Authenticated vendor/admin management UI.
- Contains: Dashboard shell, product/kiosq/store/schedule/reservation/settings/admin pages and loading states.
- Key files: `app/[locale]/dashboard/layout.tsx`, `app/[locale]/dashboard/products/page.tsx`, `app/[locale]/dashboard/your-store/page.tsx`, `app/[locale]/dashboard/admin/categories/page.tsx`.
- Subdirectories: `products/`, `your-kiosqs/`, `your-store/`, `schedules/`, `reservations/`, `settings/`, `admin/`.

**`app/api/`:**
- Purpose: Route handlers for internal API reads, validation endpoints, Stripe callbacks, and payment redirects.
- Contains: Nested `route.ts` files named by URL path.
- Key files: `app/api/users/current/route.ts`, `app/api/users/current/profiles/[profileId]/products/route.ts`, `app/api/profiles/vendors/closests/route.ts`, `app/api/stripe/connect/callback/route.ts`.
- Subdirectories: `users/current/`, `profiles/`, `products/`, `categories/`, `kiosqs/`, `stripe/connect/`, `payment-success/`.

**`actions/`:**
- Purpose: Server actions used by client features to mutate Supabase and external services.
- Contains: `*.ts` files with `"use server"` plus `actions/revalidators/`.
- Key files: `actions/create-product.ts`, `actions/update-product.ts`, `actions/create-kiosq.ts`, `actions/create-reservation.ts`, `actions/create-reservation-payment-intent.ts`.
- Subdirectories: `actions/revalidators/` contains cache invalidators such as `actions/revalidators/product-revalidator.ts`.

**`components/`:**
- Purpose: Shared presentation components that are reusable across pages and features.
- Contains: `components/ui/`, `components/sections/`, `components/client-pages/`, `components/skeletons/`.
- Key files: `components/ui/button.tsx`, `components/ui/data-table.tsx`, `components/sections/header.tsx`, `components/client-pages/dashboard-profile-products/dashboard-profile-products.tsx`.
- Subdirectories: `components/ui/icons/` for custom SVG icon components, `components/ui/form-utils/` for form inputs, `components/ui/kiosq-logo/` for logo assets/components.

**`features/`:**
- Purpose: Feature-sliced interactive workflows with colocated UI, hooks, validation, and feature-specific state.
- Contains: One directory per feature, often with `components/`, `hooks/`, and `utils/`.
- Key files: `features/product-form-drawer/product-form-drawer.tsx`, `features/reservation-button/reservation-button.tsx`, `features/location-manager/location-manager-provider.tsx`, `features/sign-in/sign-in.tsx`.
- Subdirectories: Use kebab-case feature names such as `product-form-drawer/`, `schedule-form-drawer/`, `create-profile-wizard/`, `stripe-payment/`.

**`hooks/`:**
- Purpose: Shared client hooks, mostly React Query wrappers over `utils/requests/`.
- Contains: `use-*.ts` files.
- Key files: `hooks/use-current-user-profile-id-products.ts`, `hooks/use-product-by-id.ts`, `hooks/use-geolocation.ts`, `hooks/use-current-user-profiles.ts`.
- Subdirectories: None.

**`stores/`:**
- Purpose: Zustand client stores for browser-persisted and cross-feature state.
- Contains: `*-store.ts` files.
- Key files: `stores/user-store.ts`, `stores/categories-store.ts`, `stores/data-table-visibility-store.ts`.
- Subdirectories: None.

**`utils/`:**
- Purpose: Shared non-UI helpers, data access wrappers, DTO factories, Supabase clients, cache keys, and local storage utilities.
- Contains: Root helper files plus `utils/requests/`, `utils/factories/`, `utils/supabase/`, `utils/invalidators-hooks/`, `utils/hooks/`.
- Key files: `utils/cache-keys.ts`, `utils/fetch-server-authenticated.ts`, `utils/get-base-url.ts`, `utils/upload-image.ts`.
- Subdirectories: `utils/requests/` for internal API fetchers, `utils/factories/` for DTO mapping, `utils/supabase/` for SSR/browser/admin clients.

**`types/`:**
- Purpose: TypeScript type definitions shared across the app.
- Contains: Generated Supabase database type and app-level type aliases.
- Key files: `types/supabase.ts`, `types/app.ts`.
- Subdirectories: None.

**`i18n/`:**
- Purpose: next-intl routing, navigation wrappers, request config, and localized pathname mapping.
- Contains: `*.ts` config/helper files.
- Key files: `i18n/routing.ts`, `i18n/navigation.ts`, `i18n/request.ts`, `i18n/create-pathnames-mappings.ts`.
- Subdirectories: None.

**`messages/`:**
- Purpose: Translation dictionaries for next-intl.
- Contains: Locale JSON files.
- Key files: `messages/en.json`, `messages/fr.json`.
- Subdirectories: None.

**`supabase/`:**
- Purpose: Supabase project configuration, database migrations, seed data, backups, and maintenance scripts.
- Contains: `supabase/config.toml`, `supabase/seed.sql`, `supabase/migrations/*.sql`, `supabase/scripts/*.sql`, `supabase/backups/*.sql`.
- Key files: `supabase/migrations/20250418000000_ecommerce_schema.sql`, `supabase/migrations/20250703000001_add_postgis_geolocation.sql`, `supabase/migrations/20250713000000_create_orders_reservations.sql`.
- Subdirectories: `supabase/migrations/`, `supabase/scripts/`, `supabase/backups/`.

**`public/`:**
- Purpose: Static assets served by Next.js.
- Contains: SVGs, PNG logos, placeholder images, auth/onboarding images.
- Key files: `public/logo/kiosq-logo.png`, `public/logo/kiosq-icon.png`, `public/images/auth-image.png`, `public/placeholders/1200x400.jpg`.
- Subdirectories: `public/images/`, `public/logo/`, `public/placeholders/`.

**`lib/`:**
- Purpose: shadcn utility namespace.
- Contains: `lib/utils.ts`.
- Key files: `lib/utils.ts`.
- Subdirectories: None.

**`roadmap/`:**
- Purpose: Markdown planning notes for reservation and payment work.
- Contains: `*.md` feature planning files.
- Key files: `roadmap/reservation-backend.md`, `roadmap/payment-feature.md`, `roadmap/reservation-integration.md`.
- Subdirectories: None.

**`.codex/`:**
- Purpose: Local GSD workflow assets and runtime hooks.
- Contains: `skills/`, `agents/`, `hooks/`, `get-shit-done/`.
- Key files: `.codex/skills/gsd-map-codebase/SKILL.md`, `.codex/agents/gsd-codebase-mapper.md`, `.codex/hooks/gsd-workflow-guard.js`.
- Subdirectories: `.codex/skills/` for command skills, `.codex/agents/` for agent definitions, `.codex/get-shit-done/templates/` for document templates.

**`.planning/`:**
- Purpose: GSD project artifacts generated for planning and execution.
- Contains: `codebase/` for mapped architecture and structure docs.
- Key files: `.planning/codebase/ARCHITECTURE.md`, `.planning/codebase/STRUCTURE.md`.
- Subdirectories: `.planning/codebase/`.

## Key File Locations

**Entry Points:**
- `middleware.ts`: Next.js middleware entry for auth refresh and locale routing.
- `app/[locale]/layout.tsx`: Root localized layout and app-wide providers.
- `app/[locale]/(main)/page.tsx`: Public home page.
- `app/[locale]/dashboard/layout.tsx`: Authenticated dashboard shell.
- `app/[locale]/auth/sign-in/page.tsx`: Sign-in route.
- `app/api/**/route.ts`: API route handlers and callbacks.
- `actions/*.ts`: Server action mutation entry points.

**Configuration:**
- `package.json`: npm scripts, runtime dependencies, Supabase CLI scripts.
- `package-lock.json`: npm dependency lockfile.
- `next.config.ts`: next-intl plugin and remote Supabase image pattern.
- `tsconfig.json`: strict TypeScript config and `@/*` path alias.
- `tailwind.config.ts`: Tailwind content globs for `app/` and `components/`.
- `postcss.config.mjs`: Tailwind PostCSS plugin config.
- `eslint.config.mjs`: Next.js ESLint config and local hook rule override.
- `components.json`: shadcn/ui aliases, style, Tailwind config path, and icon library.
- `app-config.ts`: Application locale config used by middleware and `types/app.ts`.
- `.gitignore`: Ignored generated files, dependencies, `.env*`, `.next/`, and TypeScript build info.

**Core Logic:**
- `app/api/`: JSON read endpoints and integration callbacks.
- `actions/`: Mutating server actions for products, kiosqs, schedules, categories, profiles, reservations, Stripe.
- `utils/requests/`: Fetch helpers for app/API data reads.
- `utils/factories/`: DTO mapping for products, profiles, kiosqs, schedules, categories, reservations.
- `utils/supabase/`: Supabase server, browser, middleware, and admin clients.
- `utils/cache-keys.ts`: Shared Next.js cache tags and React Query keys.
- `utils/upload-image.ts`: Supabase Storage upload helper.

**UI and Features:**
- `features/product-form-drawer/`: Product create/edit drawer workflow.
- `features/kiosq-form-drawer/`: Kiosq create/edit drawer workflow.
- `features/schedule-form-drawer/`: Schedule create/edit drawer workflow.
- `features/reservation-button/`: Product reservation modal workflow.
- `features/stripe-payment/`: Stripe Elements context/modal.
- `features/location-manager/`: User location context and modal.
- `components/ui/`: Shared UI primitives.
- `components/sections/`: Reusable page sections such as header, category links, dashboard headings.
- `components/client-pages/`: Client wrappers that hydrate server-fetched dashboard data.

**Data and State:**
- `types/supabase.ts`: Generated database schema types.
- `types/app.ts`: App-level aliases over generated Supabase types.
- `hooks/`: React Query domain hooks.
- `stores/`: Zustand stores.
- `utils/invalidators-hooks/`: Browser-side React Query invalidators.
- `actions/revalidators/`: Server-side Next.js revalidation helpers.

**Database and Storage:**
- `supabase/config.toml`: Supabase local/project config.
- `supabase/migrations/`: Ordered SQL migrations for schema, RLS, storage policies, PostGIS, reservations, orders.
- `supabase/seed.sql`: Seed data.
- `supabase/scripts/disable_trigger.sql`: Maintenance SQL script.
- `supabase/scripts/reenable_trigger.sql`: Maintenance SQL script.
- `supabase/backups/categories_rows_20250511_01.sql`: Category backup SQL.

**Documentation and Planning:**
- `README.md`: Default Next.js project README.
- `roadmap/*.md`: Reservation/payment roadmap notes.
- `.planning/codebase/ARCHITECTURE.md`: Architecture map.
- `.planning/codebase/STRUCTURE.md`: Directory structure map.
- `.codex/get-shit-done/templates/codebase/architecture.md`: Architecture document template.
- `.codex/get-shit-done/templates/codebase/structure.md`: Structure document template.

## Naming Conventions

**Files:**
- `page.tsx`, `layout.tsx`, `loading.tsx`: Next.js App Router files, for example `app/[locale]/dashboard/products/page.tsx`.
- `route.ts`: API route handler files, for example `app/api/products/[productId]/route.ts`.
- `kebab-case.tsx`: Component modules in `features/` and `components/`, for example `features/product-form-drawer/product-form-drawer.tsx`.
- `use-*.ts`: React hooks, for example `hooks/use-product-by-id.ts` and `features/product-form-drawer/hooks/use-product-form.ts`.
- `*-validation-schema.ts`: Zod form schemas, for example `features/kiosq-form-drawer/utils/kiosq-form-validation-schema.ts`.
- `get-*.ts`: Request helpers, for example `utils/requests/get-product-by-id.ts`.
- `*-factory.ts`: DTO factories, for example `utils/factories/product-factory.ts`.
- `*-store.ts`: Zustand stores, for example `stores/user-store.ts`.
- `*-revalidator.ts`: Server cache revalidators, for example `actions/revalidators/product-revalidator.ts`.
- `*.sql`: Supabase migrations and scripts in `supabase/migrations/` and `supabase/scripts/`.

**Directories:**
- `kebab-case`: Feature directories use kebab-case, for example `features/product-variant-modal-provider/`.
- Domain collections: `actions/`, `components/`, `features/`, `hooks/`, `stores/`, `utils/`, `types/`.
- Next.js dynamic segments: Bracketed route folders such as `app/[locale]/`, `app/api/products/[productId]/`, `app/[locale]/(main)/vendors/[slug]/`.
- Feature internals: Use `components/`, `hooks/`, and `utils/` inside feature directories when the code is feature-specific.

**Special Patterns:**
- `@/*`: Root-relative import alias configured in `tsconfig.json`.
- `components/ui/*`: shadcn/Radix primitives configured by `components.json`.
- `features/providers/*`: App-level client providers such as `features/providers/react-query-provider.tsx`.
- `actions/revalidators/*`: Server revalidation helpers called after mutations.
- `utils/invalidators-hooks/*`: Client React Query invalidation helpers called after mutations.
- `messages/{locale}.json`: next-intl locale dictionaries.

## Where to Add New Code

**New Public Page:**
- Primary code: `app/[locale]/(main)/<route>/page.tsx`.
- Layout code: `app/[locale]/(main)/<route>/layout.tsx` only when the route needs a route-specific shell.
- Data requests: `utils/requests/get-<domain>.ts`.
- API data source: `app/api/<domain>/route.ts` or `app/api/<domain>/[id]/route.ts`.
- DTO mapping: `utils/factories/<domain>-factory.ts`.

**New Dashboard Page:**
- Primary code: `app/[locale]/dashboard/<route>/page.tsx`.
- Loading state: `app/[locale]/dashboard/<route>/loading.tsx`.
- Client page wrapper: `components/client-pages/dashboard-<domain>/dashboard-<domain>.tsx`.
- Feature workflows: `features/<domain-feature>/`.
- Dashboard navigation: `utils/dashboard-navigation.tsx`.

**New API Route:**
- Definition: `app/api/<domain>/route.ts` for collection routes.
- Dynamic route: `app/api/<domain>/[id]/route.ts` for ID routes.
- Authenticated user route: `app/api/users/current/<domain>/route.ts` or `app/api/users/current/profiles/[profileId]/<domain>/route.ts`.
- Response mapping: `utils/factories/<domain>-factory.ts`.
- Shared fetch wrapper: `utils/requests/get-<domain>.ts`.

**New Server Mutation:**
- Action: `actions/<verb>-<domain>.ts`.
- Cache revalidation: `actions/revalidators/<domain>-revalidator.ts`.
- Client invalidation: `utils/invalidators-hooks/use-<domain>-invalidator.ts`.
- Form hook: `features/<domain-feature>/hooks/use-<domain-form>.ts`.
- Validation schema: `features/<domain-feature>/utils/<domain>-validation-schema.ts`.

**New Feature Module:**
- Implementation: `features/<feature-name>/<feature-name>.tsx`.
- Feature components: `features/<feature-name>/components/`.
- Feature hooks: `features/<feature-name>/hooks/`.
- Feature-only schemas/helpers: `features/<feature-name>/utils/`.
- Shared UI dependency: `components/ui/`.

**New Shared Component:**
- Primitive UI: `components/ui/<component>.tsx`.
- Page/region section: `components/sections/<section>.tsx`.
- Dashboard client wrapper: `components/client-pages/<page-name>/<page-name>.tsx`.
- Loading skeleton: `components/skeletons/<component>-skeleton.tsx`.
- Icon: `components/ui/icons/<name>-icon.tsx` unless `lucide-react` already provides the icon.

**New Data Model or Database Change:**
- Migration: `supabase/migrations/<timestamp>_<description>.sql`.
- Type refresh target: `types/supabase.ts` through `npm run update-types`.
- App aliases: `types/app.ts`.
- Factory: `utils/factories/<domain>-factory.ts`.
- API route: `app/api/<domain>/route.ts`.

**New Client Data Hook:**
- Hook: `hooks/use-<domain>.ts`.
- Request helper: `utils/requests/get-<domain>.ts`.
- Cache key: `utils/cache-keys.ts`.
- Invalidator: `utils/invalidators-hooks/use-<domain>-invalidator.ts` when mutations affect the data.

**New Integration:**
- Server action or route handler: `actions/<integration>-*.ts` or `app/api/<integration>/route.ts`.
- Client feature UI: `features/<integration>/`.
- Environment usage: reference environment variables from server-only files unless the variable is explicitly `NEXT_PUBLIC_*`.
- Database persistence: `supabase/migrations/` and matching factories/request helpers.

**Utilities:**
- Shared non-UI helpers: `utils/<helper>.ts`.
- Browser-only local storage helpers: `utils/local-storage.ts` or a new `utils/<domain>.ts`.
- Class name helper: `lib/utils.ts`.
- Type definitions: `types/app.ts`.

**GSD Workflow Artifacts:**
- Codebase maps: `.planning/codebase/`.
- Phase planning artifacts: `.planning/`.
- Skill or agent changes: `.codex/skills/` and `.codex/agents/`.
- Application code must not be added under `.codex/` or `.planning/`.

## Special Directories

**`.next/`:**
- Purpose: Next.js build/dev output.
- Generated: Yes.
- Committed: No, ignored by `.gitignore`.

**`node_modules/`:**
- Purpose: npm-installed dependencies.
- Generated: Yes.
- Committed: No, ignored by `.gitignore`.

**`.build/`:**
- Purpose: Local build/runtime scratch directory.
- Generated: Yes.
- Committed: Not indicated by `.gitignore`; contains no files in this scan.

**`tsconfig.tsbuildinfo`:**
- Purpose: TypeScript incremental build metadata.
- Generated: Yes.
- Committed: No, ignored by `.gitignore` via `*.tsbuildinfo`.

**`next-env.d.ts`:**
- Purpose: Next.js generated TypeScript declarations.
- Generated: Yes.
- Committed: No, ignored by `.gitignore`.

**`.env.local` and `.env.local.backup`:**
- Purpose: Local environment configuration and backup.
- Generated: No.
- Committed: No, ignored by `.gitignore`; contents must not be read or quoted.

**`types/supabase.ts`:**
- Purpose: Generated Supabase TypeScript schema.
- Generated: Yes through `npm run update-types`.
- Committed: Yes.

**`supabase/migrations/`:**
- Purpose: Versioned database schema, policies, functions, and storage changes.
- Generated: No.
- Committed: Yes.

**`supabase/.branches/` and `supabase/.temp/`:**
- Purpose: Supabase CLI local state.
- Generated: Yes.
- Committed: Not part of runtime source; avoid adding application logic here.

**`.codex/skills/` and `.codex/agents/`:**
- Purpose: Local GSD command skills and mapper/planner/executor agent definitions.
- Generated: Managed workflow assets.
- Committed: Yes.

**`.planning/codebase/`:**
- Purpose: Generated codebase intelligence consumed by GSD planning and execution.
- Generated: Yes.
- Committed: Project-dependent.

---

*Structure analysis: 2026-04-29*
