import { useCategoriesStore } from "@/stores/categories-store";
import { useState } from "react";
import {
  formatCategoriesWithChildren,
  getFlattenedData,
  HierarchicalProductCategory,
} from "@/utils/factories/hierarchical-categories-factory";
import { useMemo } from "react";

export interface CategoriesTableSelectors {
  flattenedData: HierarchicalProductCategory[];
  expandedRows: Record<string, boolean>;
}

export interface CategoriesTableActions {
  handleRowClick: (row: HierarchicalProductCategory) => void;
  toggleExpand: (id: string) => void;
}

export interface CategoriesTableHook {
  selectors: CategoriesTableSelectors;
  actions: CategoriesTableActions;
}

export function useCategoriesTable({
  data,
}: {
  data: HierarchicalProductCategory[];
}): CategoriesTableHook {
  const selectCategory = useCategoriesStore((state) => state.selectCategory);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const hierarchicalData = useMemo(() => formatCategoriesWithChildren(data), [data]);
  const flattenedData = useMemo(
    () => getFlattenedData(hierarchicalData, expandedRows),
    [hierarchicalData, expandedRows]
  );

  const handleRowClick = (row: HierarchicalProductCategory) => {
    selectCategory(row);
  };

  const toggleExpand = (id: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return {
    selectors: {
      expandedRows,
      flattenedData,
    },
    actions: {
      handleRowClick,
      toggleExpand,
    },
  };
}
