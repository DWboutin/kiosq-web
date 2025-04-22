"use client";

import { DataTable } from "@/components/ui/data-table";
import { FormattedProductCategory } from "@/utils/factories/product-categories-factory";
import { ColumnDef } from "@tanstack/react-table";
import { FC } from "react";
import { TranslationDisplay } from "@/components/ui/table-utils/translation-display";
import { useCategoriesStore } from "@/stores/categories-store";
import { Button } from "@/components/ui/button";
import { deleteProductCategory } from "@/actions/delete-product-category";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
type CategoriesTableProps = {
  data: FormattedProductCategory[];
};

export const CategoriesTable: FC<CategoriesTableProps> = ({ data }) => {
  const t = useTranslations("CategoriesTable");
  const selectCategory = useCategoriesStore((state) => state.selectCategory);

  const handleRowClick = (row: FormattedProductCategory) => {
    selectCategory(row);
  };

  const columns: ColumnDef<FormattedProductCategory, unknown>[] = [
    {
      header: t("name"),
      accessorKey: "name",
      cell: ({ row }) => (
        <TranslationDisplay translations={row.original.name} currentLocale={row.original.locale} />
      ),
    },
    {
      header: t("description"),
      accessorKey: "description",
      cell: ({ row }) => (
        <TranslationDisplay
          translations={row.original.description}
          currentLocale={row.original.locale}
        />
      ),
    },
    {
      header: t("slug"),
      accessorKey: "slug",
      cell: ({ row }) => (
        <TranslationDisplay translations={row.original.slug} currentLocale={row.original.locale} />
      ),
    },
    {
      header: t("parent"),
      accessorKey: "parent",
    },
    {
      header: t("createdAt"),
      accessorKey: "createdAt",
    },
    {
      header: t("updatedAt"),
      accessorKey: "updatedAt",
    },
    {
      header: t("actions"),
      accessorKey: "actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="destructive"
            size="sm"
            aria-label={t("delete")}
            onClick={async (e) => {
              e.stopPropagation();
              try {
                await deleteProductCategory(row.original.id);
                toast.success(t("categoryDeleted"));
              } catch (error) {
                console.error(error);
                toast.error(t("categoryDeleteError"));
              }
            }}
          >
            {t("delete")}
          </Button>
        </div>
      ),
    },
  ];

  return <DataTable columns={columns} data={data} onRowClick={handleRowClick} />;
};
