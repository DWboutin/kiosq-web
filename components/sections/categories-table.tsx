import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { FC } from "react";

type CategoriesTableProps = {
  data: any[];
};

const columns: ColumnDef<any, any>[] = [
  {
    header: "Name",
    accessorKey: "name",
  },
  {
    header: "Description",
    accessorKey: "description",
  },
  {
    header: "Slug",
    accessorKey: "slug",
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
