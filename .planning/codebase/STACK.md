# Technology Stack

**Analysis Date:** 2026-04-29

## Languages

**Primary:**
- TypeScript 5.8.3 - Application source, server actions, API routes, React components, utilities, and generated database types in `app/`, `actions/`, `features/`, `components/`, `utils/`, `hooks/`, `stores/`, and `types/supabase.ts`; configured by `tsconfig.json` and declared in `package.json`.
- TSX / React JSX - Client and server component templates in `app/`, `features/`, and `components/`; React 19.1.0 is resolved in `package-lock.json`.

**Secondary:**
- SQL and PL/pgSQL - Supabase schema migrations, RLS policies, triggers, RPC functions, and seed data in `supabase/migrations/*.sql` and `supabase/seed.sql`.
- JavaScript ESM - Tooling configuration in `eslint.config.mjs` and `postcss.config.mjs`.
- CSS / Tailwind CSS - Global styling and design tokens in `app/globals.css`, with Tailwind scanning configured in `tailwind.config.ts`.
- JSON - Package metadata in `package.json`, lockfile data in `package-lock.json`, shadcn/ui settings in `components.json`, and locale messages in `messages/en.json` and `messages/fr.json`.

## Runtime

**Environment:**
- Node.js runtime for Next.js 15.2.4. The repo has no `.nvmrc`, `.node-version`, or `package.json` `engines` pin; the resolved Next.js package in `package-lock.json` declares support for Node `^18.18.0 || ^19.8.0 || >=20.0.0`.
- Browser runtime for React client components, Mapbox GL rendering, geolocation, local storage, and session storage; examples include `components/ui/map-view.tsx`, `utils/get-geolocation.ts`, `stores/user-store.ts`, and `stores/data-table-visibility-store.ts`.
- Supabase local runtime is configured in `supabase/config.toml`: API on port `54321`, Postgres major version `15`, Studio on `54323`, storage enabled, auth enabled, realtime enabled, analytics enabled, and edge runtime enabled with Deno major version `1`.

**Package Manager:**
- npm - `package-lock.json` is present with lockfile version 3.
- No `packageManager` field is declared in `package.json`.
- Other managers are mentioned only by the stock Next.js `README.md`; the committed lockfile establishes npm as the repo package manager.

## Frameworks

**Core:**
- Next.js 15.2.4 - App Router web framework for pages, layouts, middleware, server actions, and route handlers in `app/`, `middleware.ts`, and `actions/`.
- React 19.1.0 / React DOM 19.1.0 - UI runtime for TSX components in `components/`, `features/`, and `app/`.
- Supabase - Auth, Postgres, storage, migrations, generated types, and server/client SDK access through `@supabase/supabase-js` 2.49.4, `@supabase/ssr` 0.6.1, `supabase/config.toml`, `utils/supabase/server.ts`, `utils/supabase/client.ts`, `utils/supabase/admin.ts`, and `utils/supabase/middleware.ts`.
- next-intl 4.0.2 - Locale routing and message loading through `i18n/request.ts`, `i18n/routing.ts`, `i18n/navigation.ts`, `middleware.ts`, `messages/en.json`, and `messages/fr.json`.
- Tailwind CSS 4.1.3 with `@tailwindcss/postcss` 4.x - Utility styling through `app/globals.css`, `tailwind.config.ts`, and `postcss.config.mjs`.
- shadcn/ui plus Radix UI primitives - Component system configured by `components.json`, implemented under `components/ui/`, with Lucide icons from `lucide-react` 0.487.0.

**Testing:**
- Not detected - No `jest.config.*`, `vitest.config.*`, `playwright.config.*`, `cypress.config.*`, `*.test.*`, or `*.spec.*` files were found.
- No test command is declared in `package.json`.

**Build/Dev:**
- Next.js CLI - `npm run dev`, `npm run build`, and `npm run start` in `package.json`.
- TypeScript compiler 5.8.3 - Strict type checking configured in `tsconfig.json`; `noEmit` is enabled and path alias `@/*` maps to `./*`.
- ESLint 9.24.0 with `eslint-config-next` 15.2.4 - Flat config in `eslint.config.mjs`; `react-hooks/exhaustive-deps` is disabled.
- Supabase CLI 2.20.12 - Database and type-generation scripts in `package.json`, with Supabase project/local stack configuration in `supabase/config.toml`.
- PostCSS - Tailwind CSS PostCSS plugin configured in `postcss.config.mjs`.
- GSD workflow skills - Local planning and execution skill definitions live under `.codex/skills/*/SKILL.md`; the codebase mapping workflow is defined in `.codex/skills/gsd-map-codebase/SKILL.md` and templates are under `.codex/get-shit-done/templates/codebase/`.

## Key Dependencies

**Critical:**
- `next` 15.2.4 - Core application framework; routes live in `app/`, middleware in `middleware.ts`, config in `next.config.ts`.
- `react` 19.1.0 and `react-dom` 19.1.0 - Component runtime for `components/`, `features/`, and route UI in `app/`.
- `@supabase/supabase-js` 2.49.4 and `@supabase/ssr` 0.6.1 - Database, auth, storage, and cookie-backed sessions through `utils/supabase/*.ts`.
- `stripe` 18.3.0, `@stripe/react-stripe-js` 3.7.0, and `@stripe/stripe-js` 7.5.0 - Stripe Connect onboarding and card payment flows in `actions/get-stripe-connect-link.ts`, `actions/create-reservation-payment-intent.ts`, `app/api/stripe/connect/callback/route.ts`, `features/stripe-payment/stripe-payment-provider.tsx`, and `features/stripe-payment/stripe-payment-modal.tsx`.
- `next-intl` 4.0.2 - Internationalized routing and translations in `i18n/`, `middleware.ts`, and `messages/`.
- `@tanstack/react-query` 5.72.2 - Client data fetching and cache state in `features/providers/react-query-provider.tsx`, `hooks/use-*.ts`, and `features/*/hooks/*.ts`.
- `zustand` 5.0.3 with `immer` 10.1.1 - Client state stores in `stores/user-store.ts`, `stores/data-table-visibility-store.ts`, and `stores/categories-store.ts`.
- `mapbox-gl` 3.13.0 - Interactive map rendering in `components/ui/map-view.tsx`.
- `react-hook-form` 7.55.0, `@hookform/resolvers` 5.0.1, and `zod` 3.24.2 - Form validation patterns in `features/*/utils/*validation-schema.ts` and form hooks under `features/*/hooks/`.

**Infrastructure:**
- `supabase` 2.20.12 - CLI dependency for `npm run update-types`, `npm run db:push`, `npm run db:reset`, `npm run db:disable-trigger`, and `npm run db:enable-trigger` in `package.json`.
- `tailwindcss` 4.1.3, `@tailwindcss/postcss` 4.x, `tailwind-merge` 3.2.0, `clsx` 2.1.1, and `class-variance-authority` 0.7.1 - Styling and component variant infrastructure in `components/ui/` and `lib/utils.ts`.
- Radix UI packages - Accessible UI primitives for dialogs, dropdowns, selects, tabs, accordions, switches, checkboxes, tooltips, labels, sliders, and radio groups in `components/ui/`.
- `sonner` 2.0.3 - Toast notifications mounted in `app/[locale]/layout.tsx` through `components/ui/sonner.tsx`.

## Configuration

**Environment:**
- Runtime environment variables are referenced in code, not stored in committed configuration values: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SERVICE_ROLE`, `STRIPE_SECRET_API_KEY`, `NEXT_PUBLIC_STRIPE_PUBLIC_API_KEY`, `NEXT_PUBLIC_STRIPE_CONNECT_CLIENT_ID`, `NEXT_PUBLIC_BASE_URL`, `NEXT_PUBLIC_CURRENT_ORIGIN`, `VERCEL_URL`, and `NODE_ENV`.
- Supabase local configuration references optional or disabled service variables in `supabase/config.toml`: `OPENAI_API_KEY` for Supabase Studio AI, `SENDGRID_API_KEY` in commented SMTP config, `SUPABASE_AUTH_SMS_TWILIO_AUTH_TOKEN` for disabled Twilio SMS auth, `SUPABASE_AUTH_EXTERNAL_APPLE_SECRET` for disabled Apple OAuth, and `S3_HOST`, `S3_REGION`, `S3_ACCESS_KEY`, `S3_SECRET_KEY` for experimental OrioleDB/S3 settings.
- `.env.local` and `.env.local.backup` are present and were not read; `.gitignore` ignores `.env*`.
- Supabase image URLs are accepted by Next Image through `next.config.ts`, which derives the remote hostname from `NEXT_PUBLIC_SUPABASE_URL`.

**Build:**
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

**Development:**
- Node.js compatible with Next.js 15.2.4 (`^18.18.0 || ^19.8.0 || >=20.0.0` from `package-lock.json`).
- npm with `package-lock.json`; install with `npm install` and run the app with `npm run dev` from `package.json`.
- Supabase CLI for database workflows in `package.json`; local Supabase settings in `supabase/config.toml` require a local Supabase stack when using `supabase start`, `npm run db:reset`, or related scripts.
- Environment variables belong in local env files such as `.env.local`; file contents are not committed because `.gitignore` ignores `.env*`.

**Production:**
- Next.js deployment target is not locked by repo config. `README.md` contains the stock Vercel deployment guidance, `.gitignore` ignores `.vercel`, and `utils/get-base-url.ts` supports `VERCEL_URL`, so Vercel is the supported path in code but no `vercel.json` or CI deployment workflow is committed.
- Supabase hosted project is required for production database, auth, storage, and generated URL configuration; app code reads Supabase connection details from `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SERVICE_ROLE`.
- Stripe account configuration is required for production payments and Connect onboarding through `STRIPE_SECRET_API_KEY`, `NEXT_PUBLIC_STRIPE_PUBLIC_API_KEY`, and `NEXT_PUBLIC_STRIPE_CONNECT_CLIENT_ID`.

---

*Stack analysis: 2026-04-29*
