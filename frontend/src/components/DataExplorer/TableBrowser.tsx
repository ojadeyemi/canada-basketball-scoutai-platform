import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Columns3,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { VisualizationModal } from "./VisualizationModal";

interface TableBrowserProps {
  data: Record<string, any>[];
  tableName: string;
  isLoading?: boolean;
}

export function TableBrowser({
  data,
  tableName,
  isLoading,
}: TableBrowserProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [visualizationOpen, setVisualizationOpen] = useState(false);

  // Get full season list from unfiltered data
  const availableSeasons = useMemo(() => {
    if (data.length === 0) return [];
    const seasonKey = Object.keys(data[0]).find((key) =>
      key.toLowerCase().includes("season"),
    );
    if (!seasonKey) return [];

    const seasons = Array.from(
      new Set(data.map((row) => row[seasonKey]).filter(Boolean)),
    );
    return seasons.sort((a, b) => (b > a ? 1 : -1));
  }, [data]);

  // Format cell value
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return "—";
    if (typeof value === "number") {
      return Number.isInteger(value)
        ? value.toLocaleString()
        : value.toFixed(2);
    }
    if (typeof value === "boolean") return value ? "Yes" : "No";
    return String(value);
  };

  // Generate columns dynamically
  const columns = useMemo<ColumnDef<Record<string, any>>[]>(() => {
    if (data.length === 0) return [];

    const columnKeys = Object.keys(data[0]);
    return columnKeys.map((key) => ({
      accessorKey: key,
      header: ({ column }) => {
        const sortDirection = column.getIsSorted();
        return (
          <button
            className="flex items-center gap-1 hover:text-foreground transition-colors font-semibold select-none w-full"
            onClick={() => column.toggleSorting(sortDirection === "asc")}
          >
            <span className="truncate flex-1 text-left">
              {key.replace(/_/g, " ").toUpperCase()}
            </span>
            {sortDirection === "asc" ? (
              <ArrowUp className="w-3 h-3" />
            ) : sortDirection === "desc" ? (
              <ArrowDown className="w-3 h-3" />
            ) : (
              <ArrowUpDown className="w-3 h-3 opacity-50" />
            )}
          </button>
        );
      },
      cell: ({ getValue }) => (
        <span className="text-sm">{formatValue(getValue())}</span>
      ),
      filterFn: "includesString",
    }));
  }, [data]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 50,
      },
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading table data...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="border rounded-lg p-12 text-center">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex-1 w-full sm:max-w-sm">
          <Input
            placeholder="Search all columns..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="h-9"
          />
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setVisualizationOpen(true)}
          >
            <BarChart3 className="w-4 h-4 mr-1.5" />
            Visualize
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Columns3 className="w-4 h-4 mr-1.5" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 max-h-96 overflow-y-auto"
            >
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="font-medium">
          {table.getFilteredRowModel().rows.length.toLocaleString()} rows
        </span>
        {globalFilter && (
          <span>• Filtered from {data.length.toLocaleString()}</span>
        )}
      </div>

      {/* Table */}
      <div className="relative rounded-lg border bg-card overflow-hidden shadow-inner">
        <div className="overflow-x-auto scroll-smooth scrollbar-thin scrollbar-thumb-muted-foreground/40 scrollbar-track-muted/20 hover:scrollbar-thumb-muted-foreground/60 transition-colors">
          <Table>
            <TableHeader className="bg-muted/50 sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="font-semibold text-xs uppercase tracking-wide max-w-[150px]"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No results found
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row, index) => (
                  <TableRow
                    key={row.id}
                    className={cn(
                      "transition-colors hover:bg-muted/50",
                      index % 2 === 0 ? "bg-background" : "bg-muted/10",
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="py-2.5 px-4 max-w-[200px] truncate"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Scroll indicator shadows - always visible */}
        <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-card via-card/80 to-transparent pointer-events-none opacity-100" />
        <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-card via-card/80 to-transparent pointer-events-none opacity-100" />
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Per page:</span>
          <Select
            value={table.getState().pagination.pageSize.toString()}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger className="h-8 w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[25, 50, 100, 500].map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="text-xs text-muted-foreground font-medium">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="h-8 w-8 p-0"
          >
            <ChevronsLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="h-8 w-8 p-0"
          >
            <ChevronsRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Visualization Modal */}
      <VisualizationModal
        open={visualizationOpen}
        onOpenChange={setVisualizationOpen}
        data={table.getFilteredRowModel().rows.map((row) => row.original)}
        tableName={tableName}
        availableSeasons={availableSeasons}
      />
    </div>
  );
}
