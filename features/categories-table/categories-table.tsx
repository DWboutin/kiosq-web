"use client";

import { DataTable } from "@/components/ui/data-table";
import { FormattedProductCategory } from "@/utils/factories/product-categories-factory";
import { ColumnDef } from "@tanstack/react-table";
import { FC, useMemo, useState } from "react";
import { TranslationDisplay } from "@/components/ui/translation-display";
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
import { useCategoriesTable } from "@/features/categories-table/hooks/use-categories-table";
import { DeleteButtonWithConfirmationModal } from "@/features/delete-button-with-confirmation-modal/delete-button-with-confirmation-modal";

type CategoriesTableProps = {
  data: FormattedProductCategory[];
};

export const CategoriesTable: FC<CategoriesTableProps> = ({ data }) => {
  const t = useTranslations();
  const {
    selectors: { flattenedData, expandedRows },
    actions: { handleRowClick, toggleExpand },
  } = useCategoriesTable({ data });

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
          <div className="w-[400px] whitespace-normal break-words overflow-hidden">
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
            <DeleteButtonWithConfirmationModal
              title={t("CategoriesTable.deleteModalTitle")}
              description={t("CategoriesTable.deleteModalDescription")}
              buttonDeleteLabel={t("CategoriesTable.deleteModalButton")}
              buttonCancelLabel={t("CategoriesTable.cancelModalButton")}
              action={async (e) => {
                e.stopPropagation();
                e.preventDefault();
                try {
                  await deleteProductCategory(row.original.id);
                  toast.success(t("CategoriesTable.categoryDeleted"));
                } catch (error) {
                  console.error(error);
                  toast.error(t("CategoriesTable.categoryDeleteError"));
                }
              }}
            >
              <Button variant="destructive" size="sm">
                {t("DataTable.delete")}
              </Button>
            </DeleteButtonWithConfirmationModal>
          </div>
        ),
        size: 120,
      },
    ],
    [expandedRows, toggleExpand]
  );

  return <DataTable columns={columns} data={flattenedData} onRowClick={handleRowClick} />;
};
