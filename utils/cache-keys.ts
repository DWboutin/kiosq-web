type CacheKeyConfig = {
  /** Cache tag for Next.js revalidation */
  tag: string;
  /** Number of seconds to revalidate the cache */
  revalidate: number;
  /** Query key for TanStack React Query */
  queryKey: readonly unknown[];
};

/**
 * Define cache keys for the application
 *
 * Usage:
 * - Next.js: `{ next: { tags: [cacheKeys.productCategories.list.tag] } }`
 * - React Query: `useQuery({ queryKey: cacheKeys.productCategories.list.queryKey })`
 */
export const cacheKeys = {
  productCategories: {
    list: {
      revalidate: 86400, // 1 day
      tag: "product-categories",
      queryKey: ["productCategories", "list"] as const,
    } satisfies CacheKeyConfig,
    listByLocale: (locale: string): CacheKeyConfig => ({
      revalidate: 86400, // 1 day
      tag: `product-categories-${locale}`,
      queryKey: ["productCategories", "list", locale] as const,
    }),
    detail: (id: string | number): CacheKeyConfig => ({
      revalidate: 86400, // 1 day
      tag: `product-category-${id}`,
      queryKey: ["productCategories", "detail", id] as const,
    }),
  },
  currentUserProfiles: {
    list: {
      revalidate: 86400, // 1 day
      tag: "current-user-profiles",
      queryKey: ["currentUserProfiles", "list"] as const,
    } satisfies CacheKeyConfig,
  },
  currentUserProfileIdProducts: {
    list: (profileId: string): CacheKeyConfig => ({
      revalidate: 86400, // 1 day
      tag: `current-user-profile-id-products-${profileId}`,
      queryKey: ["currentUserProfileIdProducts", "list", profileId] as const,
    }),
  },
  currentUserProductById: (productId: string): CacheKeyConfig => ({
    revalidate: 86400, // 1 day
    tag: `current-user-product-by-id-${productId}`,
    queryKey: ["currentUserProductById", productId] as const,
  }),
  currentUserProfileIdKiosqs: {
    list: (profileId: string): CacheKeyConfig => ({
      revalidate: 86400, // 1 day
      tag: `current-user-profile-id-kiosqs-${profileId}`,
      queryKey: ["currentUserProfileIdKiosqs", "list", profileId] as const,
    }),
  },
  currentUserKiosqById: (kiosqId: string): CacheKeyConfig => ({
    revalidate: 86400, // 1 day
    tag: `current-user-kiosq-by-id-${kiosqId}`,
    queryKey: ["currentUserKiosqById", kiosqId] as const,
  }),
  currentUserSchedules: {
    list: (profileId: string): CacheKeyConfig => ({
      revalidate: 86400, // 1 day
      tag: `current-user-schedules-${profileId}`,
      queryKey: ["currentUserSchedules", "list", profileId] as const,
    }),
  },
  closestVendorProfiles: {
    all: {
      revalidate: 86400, // 1 day
      tag: "closest-vendor-profiles",
      queryKey: ["closestVendorProfiles"] as const,
    } satisfies CacheKeyConfig,
    list: (latitude: number, longitude: number): CacheKeyConfig => ({
      revalidate: 86400, // 1 day
      tag: `closest-vendor-profiles-${latitude}-${longitude}`,
      queryKey: ["closestVendorProfiles", "list", latitude, longitude] as const,
    }),
  },
};

export const getAllTagsForDomain = (domain: keyof typeof cacheKeys): string[] => {
  const result: string[] = [];
  const domainKeys = cacheKeys[domain];

  Object.values(domainKeys).forEach((value) => {
    if (typeof value === "function") {
      return;
    }

    if ("tag" in value) {
      result.push(value.tag);
    }
  });

  return result;
};
