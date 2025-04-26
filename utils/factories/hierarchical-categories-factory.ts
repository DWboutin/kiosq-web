import { FormattedProductCategory } from "./product-categories-factory";

export type HierarchicalItem<T extends object> = T & {
  children?: HierarchicalItem<T>[];
  depth?: number;
};

export type HierarchicalProductCategory = HierarchicalItem<FormattedProductCategory>;

/**
 * Transforms a flat array of items with parent-child relationships into a hierarchical structure
 * @param items The flat array of items with parentId references
 * @param options Configuration options
 * @returns A hierarchical structure with parent-child relationships
 */
export const createHierarchy = <T extends { id: string; parentId: string | null }>(
  items: T[],
  options: {
    initialDepth?: number;
  } = {}
): HierarchicalItem<T>[] => {
  const { initialDepth = 0 } = options;

  // Create a map to easily find items by ID
  const itemMap = new Map<string, HierarchicalItem<T>>();

  // First pass: convert all items to hierarchical format
  items.forEach((item) => {
    itemMap.set(item.id, { ...item, children: [], depth: initialDepth });
  });

  // Second pass: populate children arrays
  const result: HierarchicalItem<T>[] = [];
  items.forEach((item) => {
    const hierarchicalItem = itemMap.get(item.id);
    if (hierarchicalItem) {
      // If this item has a parent, add it to the parent's children
      if (item.parentId && itemMap.has(item.parentId)) {
        const parentItem = itemMap.get(item.parentId);
        if (parentItem && parentItem.children) {
          hierarchicalItem.depth = (parentItem.depth || initialDepth) + 1;
          parentItem.children.push(hierarchicalItem);
        }
      } else {
        // If no parent, it's a root item
        result.push(hierarchicalItem);
      }
    }
  });

  return result;
};

/**
 * Flattens a hierarchical structure into a flat array, respecting the expanded state
 * @param items The hierarchical items to flatten
 * @param expandedRows Record of which rows are expanded
 * @param result Accumulator for the recursive function
 * @returns A flat array of items, with children included only when their parent is expanded
 */
export const getFlattenedData = <T extends { id: string }>(
  items: HierarchicalItem<T>[],
  expandedRows: Record<string, boolean>,
  result: HierarchicalItem<T>[] = []
): HierarchicalItem<T>[] => {
  items.forEach((item) => {
    result.push(item);
    if (expandedRows[item.id] && item.children?.length) {
      getFlattenedData(item.children, expandedRows, result);
    }
  });
  return result;
};

/**
 * Creates a hierarchical structure from a flat array of product categories
 */
export const formatCategoriesWithChildren = (
  categories: FormattedProductCategory[]
): HierarchicalProductCategory[] => {
  return createHierarchy(categories);
};
