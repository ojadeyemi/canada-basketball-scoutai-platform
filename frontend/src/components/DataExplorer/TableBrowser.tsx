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
import { Badge } from "@/components/ui/badge";
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
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ExportButton } from "./ExportButton";
import { VisualizationModal } from "./VisualizationModal";
import ShotChart from "@/components/PlayerSearch/charts/ShotChart";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface TableBrowserProps {
  data: Record<string, any>[];
  tableName: string;
  league: string;
  isLoading?: boolean;
}

export function TableBrowser({ data, tableName, league, isLoading }: TableBrowserProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [visualizationOpen, setVisualizationOpen] = useState(false);
  const [shotChartOpen, setShotChartOpen] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  const [selectedPlayerName, setSelectedPlayerName] = useState<string | null>(null);

  // Detect if this is CEBL play_by_play data (has x, y, player_id)
  const isShotChartData =
    league === "cebl" &&
    tableName === "play_by_play" &&
    data.length > 0 &&
    "x" in data[0] &&
    "y" in data[0] &&
    "player_id" in data[0];

  // Format cell value
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return "—";
    if (typeof value === "number") {
      return Number.isInteger(value) ? value.toLocaleString() : value.toFixed(2);
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
            className="flex items-center gap-1 hover:text-foreground transition-colors font-semibold select-none"
            onClick={() => column.toggleSorting(sortDirection === "asc")}
          >
            <span className="truncate">{key.replace(/_/g, " ").toUpperCase()}</span>
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
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search */}
        <div className="flex-1 w-full sm:max-w-sm">
          <Input
            placeholder="Search all columns..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="h-9"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          {isShotChartData && (
            <Badge variant="secondary" className="px-3 py-1">
              <MapPin className="w-3 h-3 mr-1" />
              Click any row to view shot chart
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setVisualizationOpen(true)}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Visualize
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Columns3 className="w-4 h-4 mr-2" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 max-h-96 overflow-y-auto">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <ExportButton
            data={table.getFilteredRowModel().rows.map((row) => row.original)}
            filename={`${league}_${tableName}`}
          />
        </div>
      </div>

      {/* Stats Badge */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Badge variant="secondary">
          {table.getFilteredRowModel().rows.length.toLocaleString()} rows
        </Badge>
        {globalFilter && (
          <span>
            • Filtered from {data.length.toLocaleString()} total
          </span>
        )}
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50 sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="font-semibold text-xs uppercase tracking-wide"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
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
                    onClick={() => {
                      if (isShotChartData && row.original.player_id) {
                        setSelectedPlayerId(row.original.player_id);
                        setSelectedPlayerName(
                          row.original.player_name ||
                          row.original.scoreboard_name ||
                          `Player ${row.original.player_id}`
                        );
                        setShotChartOpen(true);
                      }
                    }}
                    className={cn(
                      "border-b transition-colors hover:bg-muted/50",
                      index % 2 === 0 ? "bg-background" : "bg-muted/10",
                      isShotChartData && "cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/20"
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-2 px-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Rows per page:</span>
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

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
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
      />

      {/* Shot Chart Modal */}
      {isShotChartData && selectedPlayerId && (
        <Dialog open={shotChartOpen} onOpenChange={setShotChartOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Shot Chart: {selectedPlayerName}
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <ShotChart playerId={selectedPlayerId} />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
