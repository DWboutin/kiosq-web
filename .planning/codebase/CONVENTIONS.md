# Coding Conventions

**Analysis Date:** 2026-04-29

## Naming Patterns

**Files:**
- Use kebab-case for app-authored TypeScript and TSX files: `actions/create-product.ts`, `features/product-form-drawer/hooks/use-product-form.ts`, `components/ui/card-admin-product.tsx`, `utils/requests/get-product-categories.ts`.
- Use Next.js reserved filenames in the App Router: `app/[locale]/layout.tsx`, `app/[locale]/(main)/page.tsx`, `app/api/profiles/[profileId]/products/route.ts`.
- Use feature folders in kebab-case with `components/`, `hooks/`, and `utils/` subfolders when a feature needs them: `features/kiosq-form-drawer/components/kiosq-form.tsx`, `features/kiosq-form-drawer/hooks/use-kiosq-form.ts`, `features/kiosq-form-drawer/utils/kiosq-form-validation-schema.ts`.
- Use `use-*.ts` filenames for reusable hooks: `hooks/use-product-categories.ts`, `hooks/use-current-user-profile-id-products.ts`, `features/location-manager/hooks/use-location-manager-modal.ts`.
- Use `*-factory.ts` filenames for runtime data-shape mappers, not class factories: `utils/factories/authenticated-user-product-factory.ts`, `utils/factories/product-factory.ts`.
- Use `*-validation-schema.ts` filenames for Zod schemas: `features/product-form-drawer/utils/product-form-validation-schema.ts`, `features/location-manager/utils/location-manager-validation-schema.ts`.
- No test file naming convention is established; no `*.test.*`, `*.spec.*`, `tests/`, or `__tests__/` files are detected in the repo.

**Functions:**
- Use camelCase for functions and exported function values: `createProduct` in `actions/create-product.ts`, `getProductCategories` in `utils/requests/get-product-categories.ts`, `sortDataHierarchically` in `utils/data-table-utils.ts`.
- Use `useX` for hooks and keep the exported hook name aligned with the file name: `useProductForm` in `features/product-form-drawer/hooks/use-product-form.ts`, `useProductCategories` in `hooks/use-product-categories.ts`.
- Use `handleX` for UI event handlers and action callbacks: `handleRequestLocation` in `hooks/use-geolocation.ts`, `handleFormSubmit` returned from `features/kiosq-form-drawer/hooks/use-kiosq-form.ts`.
- Use domain-specific action names for server actions, usually verb + resource: `createKiosq` in `actions/create-kiosq.ts`, `updateProduct` in `actions/update-product.ts`, `deleteProductCategory` in `actions/delete-product-category.ts`.
- Use `domainFactory` and plural `domainFactories` for data mapping helpers: `authenticatedUserProductFactory` in `utils/factories/authenticated-user-product-factory.ts`, `productsFactory` in `utils/factories/product-factory.ts`.
- Async functions do not use a special prefix; async behavior is expressed by `async` and return types, as in `fetchServerAuthenticated` in `utils/fetch-server-authenticated.ts`.

**Variables:**
- Use camelCase for local variables and derived values: `defaultValues`, `validationSchema`, `drawerRef`, and `filteredNameTranslations` in `features/product-form-drawer/hooks/use-product-form.ts`.
- Use UPPER_SNAKE_CASE for cross-module constants: `PRODUCT_CATEGORIES`, `CATEGORIES_ORDER`, `UNITS`, `LOCALES`, and `SLUG_REGEX` in `utils/constants.ts`.
- Use lower camelCase for module-local defaults and helpers: `productDefaultValues` and `fillProductFormValues` in `features/product-form-drawer/hooks/use-product-form.ts`.
- Preserve database column names in payloads sent to Supabase: `name_translations`, `profile_id`, and `checklist_translations` in `actions/create-product.ts`.
- Use descriptive booleans with `is`, `has`, or `can` prefixes: `isSubmitting` in `features/product-form-drawer/hooks/use-product-form.ts`, `hasNextPage` in `app/api/profiles/[profileId]/products/route.ts`, `canRetryLocation` in `hooks/use-geolocation.ts`.

**Types:**
- Use PascalCase for type aliases and interfaces: `ProductFormValues` in `features/product-form-drawer/utils/product-form-validation-schema.ts`, `UserStore` in `stores/user-store.ts`, `DataTableProps` in `components/ui/data-table.tsx`.
- Prefer type aliases for object models and composed shapes: `AuthenticatedUserProductWithVariantsAndPrices` in `utils/factories/authenticated-user-product-factory.ts`, `RawReservationWithOrdersAndRelations` in `types/app.ts`.
- Interfaces are used for component props and public hook contracts when the shape is intended to be extended or read as a contract: `ProductCategoriesSelectors` in `hooks/use-product-categories.ts`, `DataTableProps` in `components/ui/data-table.tsx`.
- No custom enum naming convention is present; database enum values are exposed through generated Supabase types in `types/supabase.ts` and aliases in `types/app.ts`.

## Code Style

**Formatting:**
- No Prettier, Biome, or formatter config file is present; formatting is convention-driven by existing files such as `features/product-form-drawer/hooks/use-product-form.ts` and `actions/create-product.ts`.
- Use 2-space indentation in TypeScript and TSX files, matching `app/[locale]/layout.tsx`, `components/ui/data-table.tsx`, and `stores/user-store.ts`.
- Use double quotes for strings and imports in app-authored code: `actions/create-product.ts`, `features/kiosq-form-drawer/hooks/use-kiosq-form.ts`, `utils/constants.ts`.
- Use semicolons in app-authored code: `actions/delete-product-category.ts`, `hooks/use-product-categories.ts`, `utils/cache-keys.ts`.
- Match local style in generated or shadcn-originated UI files; `components/ui/button.tsx` and `lib/utils.ts` omit semicolons and include shadcn-style formatting.
- Keep JSX props multiline when elements have several props, as in `features/product-form-drawer/components/product-form.tsx` and `components/ui/data-table.tsx`.

**Linting:**
- ESLint uses the flat config in `eslint.config.mjs`.
- The configured rule set extends `next/core-web-vitals` and `next/typescript` from `eslint-config-next`.
- `react-hooks/exhaustive-deps` is disabled in `eslint.config.mjs`; hook dependency arrays still appear intentionally maintained in files like `features/product-category-form-drawer/hooks/use-product-category-form.ts`.
- The available lint script is `npm run lint` from `package.json`.
- No formatter script is configured in `package.json`.

## Import Organization

**Order:**
1. Put `"use client";` or `"use server";` as the first statement when required by the module, as in `components/ui/data-table.tsx` and `actions/create-product.ts`.
2. Use `@/` aliases for internal modules instead of relative traversal: `@/utils/cache-keys` in `hooks/use-product-categories.ts`, `@/components/ui/input` in `features/product-form-drawer/components/product-form.tsx`.
3. Keep framework and external imports close to their dependent internal imports; there is no enforced blank-line-separated sorter in files like `features/product-form-drawer/hooks/use-product-form.ts` and `app/[locale]/layout.tsx`.
4. Use relative imports only for same-folder code when the local file already uses that pattern; most repo code uses the root alias from `tsconfig.json`.
5. Use `import type` where the file already groups type-only imports that way, such as `import type { Metadata } from "next"` in `app/[locale]/layout.tsx`.

**Grouping:**
- Preserve the surrounding import grouping when editing existing files; `components/ui/data-table.tsx` groups TanStack imports, UI imports, state hooks, icons, and local helpers by practical dependency clusters.
- Do not introduce barrel-file imports unless a barrel already exists for the target API; direct imports such as `@/features/product-form-drawer/utils/product-form-validation-schema` are common.
- Keep generated CSS imports near layout-level framework imports, as in `app/[locale]/layout.tsx`.

**Path Aliases:**
- `@/*` maps to the repository root through `tsconfig.json`.
- shadcn aliases in `components.json` map `@/components`, `@/components/ui`, `@/lib`, `@/hooks`, and `@/lib/utils`.
- Internal imports should use aliases like `@/actions/create-product`, `@/types/app`, and `@/utils/supabase/server`.

## Error Handling

**Patterns:**
- Server actions throw Supabase errors and explicit invariant errors after each database/auth step, as in `actions/create-product.ts` and `actions/create-kiosq.ts`.
- Server actions that wrap multiple operations use `try/catch`, log, and throw a user-safe error when appropriate, as in `actions/delete-product-category.ts` and `actions/update-profile-banner-image.ts`.
- API routes return `NextResponse.json({ error }, { status })` for validation and persistence failures, as in `app/api/profiles/[profileId]/products/route.ts` and `app/api/categories/route.ts`.
- Client request helpers catch fetch failures, log contextual messages, and throw generic request errors, as in `utils/requests/get-product-categories.ts` and `utils/requests/get-authenticated-user-profile-id-products.ts`.
- Client form hooks surface mutation failures through `toast.error(...)` in React Query `onError` callbacks, as in `features/product-form-drawer/hooks/use-product-form.ts` and `features/kiosq-form-drawer/hooks/use-kiosq-form.ts`.
- Context hooks throw immediately when used outside their provider: `useLocationManagerContext` in `features/location-manager/location-manager-provider.tsx`, `useStripePayment` in `features/stripe-payment/stripe-payment-provider.tsx`.

**Error Types:**
- No custom `Error` subclasses or `Result<T, E>` helpers are detected.
- Throw `Error` for application invariants such as missing users or profiles: `actions/create-product.ts`, `features/location-manager/location-manager-provider.tsx`.
- Return response errors at route boundaries instead of throwing through the request lifecycle: `app/api/profiles/[profileId]/reservation-settings/route.ts`.
- Use field-level `setError` for form validation conflicts that the UI can repair, as in `features/product-category-form-drawer/hooks/use-product-category-form.ts`.

## Logging

**Framework:**
- Logging uses the built-in `console` API; no logger package is configured in `package.json`.
- Error-level logging appears in actions, API routes, request helpers, stores, and client flows: `actions/delete-product-variant.ts`, `app/api/profiles/[profileId]/products/route.ts`, `stores/user-store.ts`.

**Patterns:**
- Use `console.error` with a short contextual message at server/API/request boundaries: `utils/requests/get-product-categories.ts`, `app/api/kiosqs/[profileId]/route.ts`.
- Use `console.warn` for recoverable cleanup failures, as in `actions/update-profile-banner-image.ts`.
- Avoid adding new `console.log` debug statements; existing debug logs are present in `features/stripe-payment/stripe-payment-provider.tsx`, `features/stripe-payment/stripe-payment-modal.tsx`, `utils/requests/get-related-products.ts`, and `actions/update-schedule.ts`.
- Do not log secrets or environment values; env files such as `.env.local` and `.env.local.backup` are present but not read.

## Comments

**When to Comment:**
- Comments are sparse; add comments for non-obvious behavior, cache semantics, layout calculations, or external API constraints.
- Keep comments focused on why a branch exists, not what each line does, matching `utils/cache-keys.ts`, `components/ui/data-table.tsx`, and `features/dashboard-breadcrumb/hooks/use-dashboard-breadcrumb-paths.ts`.
- Avoid broad TODO/FIXME comments; no `TODO`, `FIXME`, `HACK`, or `XXX` comments are detected in `app/`, `actions/`, `components/`, `features/`, `hooks/`, `utils/`, `stores/`, or `types/`.

**JSDoc/TSDoc:**
- JSDoc is used selectively for shared utility contracts, such as `CacheKeyConfig` and `cacheKeys` in `utils/cache-keys.ts`.
- JSDoc is not required for internal React components or server actions; most files rely on type names and local structure, as in `features/product-form-drawer/hooks/use-product-form.ts`.

**TODO Comments:**
- Not detected in application source.

## Function Design

**Size:**
- Keep small UI wrappers and hooks focused around one responsibility, as in `hooks/use-product-categories.ts`, `utils/invalidators-hooks/use-products-invalidator.ts`, and `actions/revalidators/product-revalidator.ts`.
- Extract complex form logic into a hook and keep JSX in a sibling component, following `features/product-form-drawer/hooks/use-product-form.ts` plus `features/product-form-drawer/components/product-form.tsx`.
- Large shared components exist, such as `components/ui/data-table.tsx` and `features/schedule-form-drawer/components/schedule-form.tsx`; prefer extracting helpers when adding substantial behavior.

**Parameters:**
- Use a single object parameter for operations with multiple inputs: `updateProduct` in `actions/update-product.ts`, `deleteProductVariant` in `actions/delete-product-variant.ts`, `useProductsInvalidator` in `utils/invalidators-hooks/use-products-invalidator.ts`.
- Use positional parameters for simple hooks and helpers with one or two values: `useKiosqsByProfileId(profileId)` in `hooks/use-kiosqs-by-profile-id.ts`, `slugify(text)` in `utils/slugify.ts`.
- Use defaulted object props for optional hook configuration, as in `useProductForm({ editMode = false, productId } = {})` in `features/product-form-drawer/hooks/use-product-form.ts`.

**Return Values:**
- Custom hooks return `{ selectors, actions }` when they expose state plus commands: `hooks/use-geolocation.ts`, `hooks/use-current-user-profile-id-products.ts`, `features/product-category-form-drawer/hooks/use-product-category-form.ts`.
- Server actions return persisted domain data when callers need follow-up invalidation or UI state: `actions/create-product.ts`, `actions/create-kiosq.ts`.
- Request helpers return factory-normalized objects rather than raw API payloads, as in `utils/requests/get-product-categories.ts`.
- Factories map snake_case/database shapes to camelCase UI models, as in `utils/factories/authenticated-user-product-factory.ts`.

## Module Design

**Exports:**
- Prefer named exports for reusable components, hooks, actions, utilities, stores, and factories: `ProductForm` in `features/product-form-drawer/components/product-form.tsx`, `useUserStore` in `stores/user-store.ts`, `cacheKeys` in `utils/cache-keys.ts`.
- Use default exports only where the framework requires or strongly expects them: route pages/layouts like `app/[locale]/(main)/page.tsx`, `app/[locale]/layout.tsx`, and next-intl setup in `i18n/request.ts`.
- Keep server-only modules explicit with `"use server";` in files such as `actions/create-product.ts` and `utils/supabase/admin.ts`.
- Keep client-only interactive modules explicit with `"use client";` in files such as `components/ui/data-table.tsx` and `features/location-manager/location-manager-provider.tsx`.

**Barrel Files:**
- Barrel files are not a dominant pattern; direct imports from concrete files are standard in `features/product-form-drawer/hooks/use-product-form.ts`, `hooks/use-product-categories.ts`, and `app/[locale]/layout.tsx`.
- Add new exports from the implementation file itself unless a local index module already exists for that area.

---

*Convention analysis: 2026-04-29*
*Update when patterns change*
