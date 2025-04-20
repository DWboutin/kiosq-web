"use client";

import { DataTable } from "@/components/ui/data-table";
import { FormattedProductCategory } from "@/utils/factories/product-categories-factory";
import { ColumnDef } from "@tanstack/react-table";
import { FC } from "react";
import { Badge } from "@/components/ui/badge";
import { AppConfig } from "@/app-config";
import { TranslationDisplay } from "@/components/ui/table-utils/translation-display";

type CategoriesTableProps = {
  data: FormattedProductCategory[];
};

const columns: ColumnDef<FormattedProductCategory, unknown>[] = [
  {
    header: "Name",
    accessorKey: "name",
    cell: ({ row }) => (
      <TranslationDisplay translations={row.original.name} currentLocale={row.original.locale} />
    ),
  },
  {
    header: "Description",
    accessorKey: "description",
    cell: ({ row }) => (
      <TranslationDisplay
        translations={row.original.description}
        currentLocale={row.original.locale}
      />
    ),
  },
  {
    header: "Slug",
    accessorKey: "slug",
    cell: ({ row }) => (
      <TranslationDisplay translations={row.original.slug} currentLocale={row.original.locale} />
    ),
  },
  {
    header: "Parent",
    accessorKey: "parent",
  },
  {
    header: "Created At",
    accessorKey: "createdAt",
  },
  {
    header: "Updated At",
    accessorKey: "updatedAt",
  },
  {
    header: "Actions",
    accessorKey: "actions",
  },
];

export const CategoriesTable: FC<CategoriesTableProps> = ({ data }) => {
  return <DataTable columns={columns} data={data} />;
};
