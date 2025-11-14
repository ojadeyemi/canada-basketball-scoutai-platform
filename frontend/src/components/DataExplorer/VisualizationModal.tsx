import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChartRenderer } from "@/components/agent/QueryResult/ChartRenderer";
import type { ChartConfig } from "@/types/agent";
import { BarChart3, TrendingUp, PieChart, Activity } from "lucide-react";

interface VisualizationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: Record<string, any>[];
  tableName: string;
  availableSeasons?: (string | number)[];
}

export function VisualizationModal({
  open,
  onOpenChange,
  data,
  tableName,
  availableSeasons: propSeasons,
}: VisualizationModalProps) {
  // Detect numeric columns
  const numericColumns =
    data.length > 0
      ? Object.keys(data[0]).filter((key) => typeof data[0][key] === "number")
      : [];

  // Detect potential label columns (strings, first column, or common label names)
  const labelColumn =
    data.length > 0
      ? Object.keys(data[0]).find(
          (key) =>
            typeof data[0][key] === "string" ||
            ["name", "player", "team", "season", "position"].some((label) =>
              key.toLowerCase().includes(label),
            ),
        ) || Object.keys(data[0])[0]
      : "";

  // Use prop seasons if provided, otherwise extract from data
  const availableSeasons = useMemo(() => {
    if (propSeasons && propSeasons.length > 0) return propSeasons;

    if (data.length === 0) return [];
    const seasonKey = Object.keys(data[0]).find((key) =>
      key.toLowerCase().includes("season"),
    );
    if (!seasonKey) return [];

    const seasons = Array.from(
      new Set(data.map((row) => row[seasonKey]).filter(Boolean)),
    );
    return seasons.sort((a, b) => (b > a ? 1 : -1));
  }, [data, propSeasons]);

  const [chartType, setChartType] = useState<
    "bar" | "line" | "pie" | "radar" | "table"
  >("bar");
  const [xColumn, setXColumn] = useState(labelColumn || "");
  const [yColumns, setYColumns] = useState<string[]>(
    numericColumns.slice(0, 3),
  );

  // Filter state
  const [seasonFrom, setSeasonFrom] = useState<string | undefined>(undefined);
  const [seasonTo, setSeasonTo] = useState<string | undefined>(undefined);
  const [rowLimit, setRowLimit] = useState<number>(100);

  // Apply filters to data
  const filteredData = useMemo(() => {
    let result = [...data];

    // Season filter
    if (seasonFrom || seasonTo) {
      const seasonKey = Object.keys(data[0] || {}).find((key) =>
        key.toLowerCase().includes("season"),
      );

      if (seasonKey) {
        result = result.filter((row) => {
          const season = row[seasonKey];
          if (!season) return false;

          const matchesFrom =
            !seasonFrom ||
            season >=
              (isNaN(Number(seasonFrom)) ? seasonFrom : Number(seasonFrom));
          const matchesTo =
            !seasonTo ||
            season <= (isNaN(Number(seasonTo)) ? seasonTo : Number(seasonTo));

          return matchesFrom && matchesTo;
        });
      }
    }

    // Row limit
    return result.slice(0, rowLimit);
  }, [data, seasonFrom, seasonTo, rowLimit]);

  const chartConfig: ChartConfig = {
    chart_type: chartType,
    x_column: xColumn,
    y_columns: yColumns,
    title: `${tableName} Visualization`,
    subtitle: null,
    color_scheme: [
      "#ef4444", // red
      "#3b82f6", // blue
      "#10b981", // green
      "#f59e0b", // orange
      "#8b5cf6", // purple
      "#06b6d4", // cyan
      "#ec4899", // pink
      "#84cc16", // lime
    ],
    legend_position: "bottom",
    x_axis_label: null,
    y_axis_label: null,
    value_format: "number",
    show_data_labels: false,
    sortable: true,
    paginated: true,
  };

  const chartIcons = {
    bar: BarChart3,
    line: TrendingUp,
    pie: PieChart,
    radar: Activity,
    table: BarChart3,
  };

  const ChartIcon = chartIcons[chartType];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ChartIcon className="w-5 h-5" />
            {tableName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Data Filters */}
          <div className="flex flex-wrap gap-3 items-end p-4 bg-muted/30 rounded-lg border">
            {/* Season Range Filter */}
            {availableSeasons.length > 0 && (
              <>
                <div className="flex-1 min-w-[140px]">
                  <label className="text-xs font-medium mb-1.5 block text-muted-foreground">
                    From Season
                  </label>
                  <Select
                    value={seasonFrom || "all"}
                    onValueChange={(v) =>
                      setSeasonFrom(v === "all" ? undefined : v)
                    }
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {availableSeasons.map((season) => (
                        <SelectItem key={season} value={season.toString()}>
                          {season}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1 min-w-[140px]">
                  <label className="text-xs font-medium mb-1.5 block text-muted-foreground">
                    To Season
                  </label>
                  <Select
                    value={seasonTo || "all"}
                    onValueChange={(v) =>
                      setSeasonTo(v === "all" ? undefined : v)
                    }
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {availableSeasons.map((season) => (
                        <SelectItem key={season} value={season.toString()}>
                          {season}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Row Limit */}
            <div className="flex-1 min-w-[140px]">
              <label className="text-xs font-medium mb-1.5 block text-muted-foreground">
                Max Rows
              </label>
              <Select
                value={rowLimit.toString()}
                onValueChange={(v) => setRowLimit(Number(v))}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[50, 100, 250, 500, 1000, 2500].map((limit) => (
                    <SelectItem key={limit} value={limit.toString()}>
                      {limit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="text-xs text-muted-foreground self-center">
              Showing {filteredData.length.toLocaleString()} of{" "}
              {data.length.toLocaleString()} rows
            </div>
          </div>

          {/* Chart Type Selection */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium text-muted-foreground">
              Chart:
            </span>
            {(["bar", "line", "pie", "radar"] as const).map((type) => (
              <Button
                key={type}
                variant={chartType === type ? "default" : "outline"}
                size="sm"
                onClick={() => setChartType(type)}
                className="capitalize"
              >
                {type}
              </Button>
            ))}
          </div>

          {/* Column Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">X-Axis</label>
              <Select value={xColumn} onValueChange={setXColumn}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select column" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(data[0] || {}).map((col) => (
                    <SelectItem key={col} value={col}>
                      {col}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Y-Axis ({yColumns.length} selected)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {numericColumns.map((col) => (
                  <Badge
                    key={col}
                    variant={yColumns.includes(col) ? "default" : "outline"}
                    className="cursor-pointer text-xs px-2 py-1"
                    onClick={() => {
                      if (yColumns.includes(col)) {
                        setYColumns(yColumns.filter((c) => c !== col));
                      } else {
                        setYColumns([...yColumns, col]);
                      }
                    }}
                  >
                    {col}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Chart Display */}
          <div className="border rounded-lg p-4 bg-background">
            {yColumns.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <ChartIcon className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p className="text-sm">Select Y-axis columns to visualize</p>
              </div>
            ) : (
              <ChartRenderer data={filteredData} chartConfig={chartConfig} />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
