import { SortingState } from "@tanstack/react-table";

export interface HierarchicalItem {
  id: string | number;
  parentId: string | number | null;
  [key: string]: unknown;
}

// Helper function to extract locale-specific value
export const getLocaleValue = (value: unknown, locale: string): unknown => {
  if (value && typeof value === "object" && value !== null && locale in value) {
    return (value as Record<string, unknown>)[locale];
  }
  return value;
};

// Function to check if data has hierarchical structure
export const isHierarchicalData = <T extends object>(data: T[]): boolean => {
  return data.some((item) => "parentId" in item);
};

// Function to sort data items according to current sorting state with locale support
export const sortItemsByCurrentSorting = <T extends object>(
  items: T[],
  sorting: SortingState,
  locale: string
): T[] => {
  return [...items].sort((a, b) => {
    for (const sort of sorting) {
      const { id, desc } = sort;

      const aValue = getLocaleValue(
        id in a ? (a as Record<string, unknown>)[id] : undefined,
        locale
      );
      const bValue = getLocaleValue(
        id in b ? (b as Record<string, unknown>)[id] : undefined,
        locale
      );

      // Only compare if values are different
      if (aValue !== bValue) {
        // Handle undefined/null values
        if (aValue === undefined || aValue === null) return desc ? -1 : 1;
        if (bValue === undefined || bValue === null) return desc ? 1 : -1;

        // Compare based on type
        const direction = desc ? -1 : 1;

        if (typeof aValue === "string" && typeof bValue === "string") {
          return aValue.localeCompare(bValue, locale) * direction;
        } else {
          return aValue < bValue ? -direction : direction;
        }
      }
    }
    return 0;
  });
};

// Main function to sort data hierarchically
export const sortDataHierarchically = <T extends object>(
  data: T[],
  sorting: SortingState,
  locale: string
): T[] => {
  // If no sorting defined or data is not hierarchical, return original data
  if (!sorting.length || !isHierarchicalData(data)) return data;

  // Use type assertion to treat data as hierarchical items
  const hierarchicalData = data as unknown as HierarchicalItem[];

  // Clone data to avoid mutations
  const dataClone = [...hierarchicalData];

  // First, separate parents and children
  const parents = dataClone.filter((item) => item.parentId === null);
  const childrenMap = dataClone
    .filter((item) => item.parentId !== null)
    .reduce((acc, item) => {
      const parentId = item.parentId as string | number;
      if (!acc[parentId]) {
        acc[parentId] = [];
      }
      acc[parentId].push(item);
      return acc;
    }, {} as Record<string | number, HierarchicalItem[]>);

  // Sort parents according to sorting state
  const sortedParents = sortItemsByCurrentSorting(parents, sorting, locale);

  // Build the final sorted array
  const result: HierarchicalItem[] = [];

  // Add each parent followed by its sorted children
  sortedParents.forEach((parent) => {
    result.push(parent);

    const children = childrenMap[parent.id] || [];
    if (children.length > 0) {
      const sortedChildren = sortItemsByCurrentSorting(children, sorting, locale);
      result.push(...sortedChildren);
    }
  });

  // Cast back to original type
  return result as unknown as T[];
};
