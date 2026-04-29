# Testing Patterns

**Analysis Date:** 2026-04-29

## Test Framework

**Runner:**
- Not detected. `package.json` does not define `test`, `test:watch`, `test:coverage`, `test:e2e`, or equivalent scripts.
- Not detected. `package.json` and `package-lock.json` do not include Jest, Vitest, Testing Library, Playwright, Cypress, Mocha, `nyc`, or `c8`.
- Not detected. No `jest.config.*`, `vitest.config.*`, `playwright.config.*`, `cypress.config.*`, `.nycrc`, or coverage config file exists at the repo root.

**Assertion Library:**
- Not detected. No current assertion API is established for files under `app/`, `actions/`, `components/`, `features/`, `hooks/`, `utils/`, `stores/`, or `types/`.
- Do not assume Jest or Vitest globals are available in this codebase until a runner is added to `package.json`.

**Run Commands:**
```bash
# No automated test command is configured in `package.json`.
npm run lint                         # Configured quality check from `package.json`
npm run build                        # Configured production build from `package.json`
```

## Test File Organization

**Location:**
- Not detected. No `*.test.*`, `*.spec.*`, or `*.e2e.*` files are present in the repository.
- Not detected. No `tests/`, `test/`, `__tests__/`, `e2e/`, `cypress/`, or `coverage/` directories are present outside `node_modules/`.
- Production code currently has no adjacent tests for representative modules such as `actions/create-product.ts`, `features/product-form-drawer/hooks/use-product-form.ts`, `components/ui/data-table.tsx`, `utils/requests/get-product-categories.ts`, or `utils/factories/authenticated-user-product-factory.ts`.

**Naming:**
- Not detected. No project-specific unit, integration, component, or E2E test filename pattern exists.
- Do not infer a test suffix from GSD templates in `.codex/get-shit-done/templates/codebase/testing.md`; application source contains no matching test files.

**Structure:**
```text
Not detected.

Current production layout with no adjacent test files:
actions/create-product.ts
features/product-form-drawer/hooks/use-product-form.ts
features/product-form-drawer/components/product-form.tsx
app/api/profiles/[profileId]/products/route.ts
utils/factories/authenticated-user-product-factory.ts
```

## Test Structure

**Suite Organization:**
```typescript
// Not detected in current source.
// No describe/it/test/expect suite structure exists under `app/`, `actions/`,
// `components/`, `features/`, `hooks/`, `utils/`, `stores/`, or `types/`.
```

**Patterns:**
- Setup pattern: Not detected. No `beforeEach`, `afterEach`, `beforeAll`, or setup file exists.
- Teardown pattern: Not detected. No global teardown or per-test cleanup convention exists.
- Assertion pattern: Not detected. No assertion style is established.
- Manual verification is the effective current practice for behavior in form hooks like `features/kiosq-form-drawer/hooks/use-kiosq-form.ts`, API routes like `app/api/categories/route.ts`, and UI components like `features/location-manager/components/location-manager-modal.tsx`.

## Mocking

**Framework:**
- Not detected. No Jest `jest.mock`, Vitest `vi.mock`, Sinon, MSW, or fetch-mocking setup appears in application source or config.
- No mocking globals are available through `package.json`.

**Patterns:**
```typescript
// Not detected in current source.
// No module mocking, fetch mocking, timer mocking, or Supabase client mocking
// convention is present.
```

**What to Mock:**
- Not established. External boundaries that currently require manual care include Supabase clients in `utils/supabase/server.ts`, `utils/supabase/client.ts`, and `utils/supabase/admin.ts`.
- Not established. Network request helpers such as `utils/requests/get-product-categories.ts` and `utils/requests/get-authenticated-user-profile-id-products.ts` are untested and have no fetch-mock pattern.
- Not established. Browser APIs used by `utils/get-geolocation.ts`, `utils/local-storage.ts`, and `features/location-manager/hooks/use-location-manager-modal.ts` have no mock pattern.
- Not established. Stripe flows in `features/stripe-payment/stripe-payment-provider.tsx`, `features/stripe-payment/stripe-payment-modal.tsx`, and `actions/create-reservation-payment-intent.ts` have no mock pattern.

**What NOT to Mock:**
- Not established by tests. Pure mappers in `utils/factories/product-factory.ts`, `utils/factories/authenticated-user-product-factory.ts`, and `utils/factories/hierarchical-categories-factory.ts` have no current dependency on external service mocks.
- Not established by tests. Pure helpers such as `utils/slugify.ts`, `utils/filter-translations.ts`, and `utils/extract-translations.ts` do not need external service mocks.

## Fixtures and Factories

**Test Data:**
```typescript
// Not detected in current source.
// There are production data mappers under `utils/factories/`, but no test
// fixture builders or shared test data modules.
```

**Location:**
- Not detected. No `tests/fixtures/`, `test-utils/`, `__fixtures__/`, or factory helpers for tests exist.
- Runtime factory modules live in `utils/factories/` and convert Supabase/API shapes into app models; examples include `utils/factories/admin-product-categories-factory.ts`, `utils/factories/authenticated-user-reservations-factory.ts`, and `utils/factories/kiosqs-factory.ts`.
- Generated database types live in `types/supabase.ts` and define the current raw Supabase row shapes.

## Coverage

**Requirements:**
- No coverage target is configured.
- No CI coverage gate is present because no `.github/workflows/` directory is detected.
- No package-level coverage script is configured in `package.json`.

**Configuration:**
- Not detected. No coverage provider, include/exclude list, thresholds, or coverage output directory is configured.

**View Coverage:**
```bash
# Not available. No coverage command is configured in `package.json`.
```

## Test Types

**Unit Tests:**
- Not used currently. Pure helpers and factories under `utils/` are untested, including `utils/slugify.ts`, `utils/data-table-utils.ts`, `utils/factories/product-factory.ts`, and `utils/factories/authenticated-user-product-factory.ts`.
- Not used currently. Zod schema behavior in `features/product-form-drawer/utils/product-form-validation-schema.ts`, `features/kiosq-form-drawer/utils/kiosq-form-validation-schema.ts`, and `features/user-onboarding/utils/create-user-onboarding-schema.ts` is untested.

**Integration Tests:**
- Not used currently. Server actions under `actions/` have no automated coverage for Supabase success/failure paths, including `actions/create-product.ts`, `actions/update-kiosq.ts`, and `actions/delete-product-category.ts`.
- Not used currently. API routes under `app/api/` have no request/response tests, including `app/api/categories/route.ts`, `app/api/profiles/[profileId]/products/route.ts`, and `app/api/stripe/connect/callback/route.ts`.
- Not used currently. React Query hooks under `hooks/` and `utils/invalidators-hooks/` have no cache invalidation tests, including `hooks/use-product-categories.ts` and `utils/invalidators-hooks/use-products-invalidator.ts`.

**E2E Tests:**
- Not used currently. No Playwright, Cypress, or browser automation configuration exists.
- No automated user-flow coverage exists for onboarding in `features/user-onboarding/user-onboarding.tsx`, product management in `features/product-form-drawer/product-form-drawer.tsx`, or payment in `features/stripe-payment/stripe-payment-modal.tsx`.

## Common Patterns

**Async Testing:**
```typescript
// Not detected.
// Async behavior is implemented in production through React Query hooks,
// server actions, and API routes, but no async test pattern exists.
```

**Error Testing:**
```typescript
// Not detected.
// Error handling exists in production files such as `actions/delete-product-category.ts`
// and `app/api/profiles/[profileId]/products/route.ts`, but no rejection or thrown-error
// assertion pattern is established.
```

**Snapshot Testing:**
- Not used. No snapshot files or snapshot framework configuration are detected.

**Current Verification Practice:**
- Use `npm run lint` from `package.json` for lint/type-aware Next rules through `eslint.config.mjs`.
- Use `npm run build` from `package.json` to validate the production Next.js build when changing app behavior.
- For database-related changes, scripts such as `npm run db:push` and `npm run db:reset` exist in `package.json`, but they are operational Supabase commands, not automated tests.

---

*Testing analysis: 2026-04-29*
*Update when test patterns change*
