"use client";

import { DataTable } from "@/components/ui/data-table";
import { FormattedProductCategory } from "@/utils/factories/product-categories-factory";
import { ColumnDef } from "@tanstack/react-table";
import { FC, useMemo, useState } from "react";
import { TranslationDisplay } from "@/components/ui/table-utils/translation-display";
import { useCategoriesStore } from "@/stores/categories-store";
import { Button } from "@/components/ui/button";
import { deleteProductCategory } from "@/actions/delete-product-category";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  HierarchicalProductCategory,
  formatCategoriesWithChildren,
  getFlattenedData,
} from "@/utils/factories/hierarchical-categories-factory";
import { LocaleFullDate } from "@/components/ui/locale-date";

type CategoriesTableProps = {
  data: FormattedProductCategory[];
};

export const CategoriesTable: FC<CategoriesTableProps> = ({ data }) => {
  const t = useTranslations();
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

  const columns: ColumnDef<HierarchicalProductCategory, unknown>[] = useMemo(
    () => [
      {
        id: "expander",
        header: "",
        cell: ({ row }) => {
          return row.original.children?.length ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(row.original.id);
              }}
              className="p-2 min-w-10 min-h-10 rounded-md flex items-center justify-center touch-manipulation"
              aria-label={
                expandedRows[row.original.id]
                  ? t("DataTable.collapseCategory")
                  : t("DataTable.expandCategory")
              }
            >
              {expandedRows[row.original.id] ? (
                <ChevronDown size={20} />
              ) : (
                <ChevronRight size={20} />
              )}
            </Button>
          ) : null;
        },
        size: 60,
      },
      {
        header: t("CategoriesTable.name"),
        accessorKey: "name",
        cell: ({ row }) => (
          <div
            style={{ paddingLeft: `${(row.original.depth || 0) * 16}px` }}
            className="flex items-center"
          >
            <TranslationDisplay
              translations={row.original.name}
              currentLocale={row.original.locale}
              disabledTooltip
            />
          </div>
        ),
      },
      {
        header: t("CategoriesTable.description"),
        accessorKey: "description",
        cell: ({ row }) => (
          <div className="w-[400px] whitespace-normal break-words">
            <TranslationDisplay
              translations={row.original.description}
              currentLocale={row.original.locale}
            />
          </div>
        ),
      },
      {
        header: t("CategoriesTable.slug"),
        accessorKey: "slug",
        cell: ({ row }) => (
          <TranslationDisplay
            translations={row.original.slug}
            currentLocale={row.original.locale}
            disabledTooltip
          />
        ),
      },
      {
        header: t("DataTable.createdAt"),
        accessorKey: "createdAt",
        cell: ({ row }) => <LocaleFullDate date={row.original.createdAt} />,
      },
      {
        header: t("DataTable.updatedAt"),
        accessorKey: "updatedAt",
        cell: ({ row }) => <LocaleFullDate date={row.original.updatedAt} />,
      },
      {
        header: t("DataTable.actions"),
        accessorKey: "actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Button
              variant="destructive"
              size="sm"
              aria-label={t("DataTable.delete")}
              onClick={async (e) => {
                e.stopPropagation();
                try {
                  await deleteProductCategory(row.original.id);
                  toast.success(t("CategoriesTable.categoryDeleted"));
                } catch (error) {
                  console.error(error);
                  toast.error(t("CategoriesTable.categoryDeleteError"));
                }
              }}
            >
              {t("DataTable.delete")}
            </Button>
          </div>
        ),
        size: 120,
      },
    ],
    [expandedRows, toggleExpand]
  );

  return <DataTable columns={columns} data={flattenedData} onRowClick={handleRowClick} />;
};
