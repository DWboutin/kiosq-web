"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  RowSelectionState,
  VisibilityState,
  Table as TableInstance,
  Row,
} from "@tanstack/react-table";
import { useShallow } from "zustand/react/shallow";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState, useMemo } from "react";
import { ChevronDown, ChevronUp, ChevronsUpDown, EyeIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDataTableVisibilityStore } from "@/stores/data-table-visibility-store";
import { useIsMounted } from "@/hooks/useIsMounted";

interface DataTableProps<TData, TValue> {
  tableId: string;
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  onRowClick?: (row: TData) => void;
  onSelectionChange?: (rows: TData[]) => void;
}

const DataTableColumnsVisibilityControl = <TData,>({ table }: { table: TableInstance<TData> }) => {
  const t = useTranslations("DataTable");

  return (
    <div className="flex justify-end mb-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <EyeIcon className="h-4 w-4 mr-2" />
            {t("columnsVisibility")}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {table
            .getAllColumns()
            .filter((column) => column.getCanHide())
            .map((column) => {
              return (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              );
            })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export function DataTable<TData, TValue>({
  tableId,
  columns,
  data,
  isLoading = false,
  onRowClick,
  onSelectionChange,
}: DataTableProps<TData, TValue>) {
  const t = useTranslations("DataTable");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const isClient = useIsMounted();

  const columnVisibility = useDataTableVisibilityStore(
    useShallow((state) => state.getTableVisibility(tableId) || {})
  );
  const setTableVisibility = useDataTableVisibilityStore(
    useShallow((state) => state.setTableVisibility)
  );

  // Create a stable function reference to mimic setState
  const setColumnVisibility = useMemo(() => {
    return (updaterOrValue: VisibilityState | ((old: VisibilityState) => VisibilityState)) => {
      const newValue =
        typeof updaterOrValue === "function" ? updaterOrValue(columnVisibility) : updaterOrValue;

      setTableVisibility(tableId, newValue);
    };
  }, [tableId, columnVisibility, setTableVisibility]);

  const selectionColumn = {
    id: "select",
    header: ({ table }: { table: TableInstance<TData> }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label={t("selectAll")}
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }: { row: Row<TData> }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label={t("selectRow")}
        onClick={(e) => e.stopPropagation()}
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  };

  const allColumns = onSelectionChange
    ? [selectionColumn as ColumnDef<TData, TValue>, ...columns]
    : columns;

  const table = useReactTable({
    data,
    columns: allColumns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      rowSelection,
      columnVisibility: isClient ? columnVisibility : {},
    },
  });

  const selectedRows = table.getSelectedRowModel().rows.map((row) => row.original);

  if (onSelectionChange && Object.keys(rowSelection).length > 0) {
    onSelectionChange(selectedRows as TData[]);
  }

  const handleRowClick = (row: TData) => {
    if (onRowClick) {
      onRowClick(row);
    }
  };

  return (
    <div>
      <DataTableColumnsVisibilityControl table={table} />
      <div className="w-full overflow-auto">
        <div className="rounded-md border bg-white overflow-hidden relative z-0">
          <Table className="w-full">
            <TableHeader className="[&_tr:first-child]:overflow-hidden [&_tr:first-child]:rounded-t-md">
              {table.getHeaderGroups().map((headerGroup, index) => (
                <TableRow
                  key={headerGroup.id}
                  className={cn(
                    "bg-neutral-50 border-b",
                    index === 0 &&
                      "[&_th:first-child]:rounded-tl-md [&_th:last-child]:rounded-tr-md"
                  )}
                >
                  {headerGroup.headers.map((header) => {
                    const isSorted = header.column.getIsSorted();
                    return (
                      <TableHead
                        key={header.id}
                        className={cn(
                          "font-medium text-neutral-600 overflow-hidden",
                          header.column.getCanSort() && "cursor-pointer select-none",
                          header.id !== "expander" && "first:pl-6"
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                        style={{
                          width: header.column.columnDef.size as number | undefined,
                          minWidth: header.column.columnDef.minSize as number | undefined,
                          maxWidth: header.column.columnDef.maxSize as number | undefined,
                        }}
                      >
                        <div className="flex items-center gap-1 overflow-hidden">
                          <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                            {header.isPlaceholder
                              ? null
                              : flexRender(header.column.columnDef.header, header.getContext())}
                          </div>
                          {header.column.getCanSort() && (
                            <div className="ml-1 flex-shrink-0">
                              {isSorted === "asc" ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : isSorted === "desc" ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronsUpDown className="h-4 w-4 opacity-50" />
                              )}
                            </div>
                          )}
                        </div>
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    <div className="flex items-center justify-center">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                      <span className="ml-2">Loading...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={cn(
                      "transition-colors hover:bg-neutral-50 cursor-pointer",
                      row.getIsSelected() && "bg-neutral-100"
                    )}
                    onClick={() => handleRowClick(row.original as TData)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="overflow-hidden first:pl-6"
                        style={{
                          width: cell.column.columnDef.size as number | undefined,
                          minWidth: cell.column.columnDef.minSize as number | undefined,
                          maxWidth: cell.column.columnDef.maxSize as number | undefined,
                        }}
                      >
                        <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center text-neutral-500">
                      <div className="mb-2 rounded-full border p-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-5 w-5"
                        >
                          <rect width="8" height="14" x="8" y="5" rx="1" />
                          <path d="M4 7v7" />
                          <path d="M16 5v14" />
                          <path d="M20 10v6" />
                        </svg>
                      </div>
                      <p>No results found.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
