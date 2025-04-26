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
