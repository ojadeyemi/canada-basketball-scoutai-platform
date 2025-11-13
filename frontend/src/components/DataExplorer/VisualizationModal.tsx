import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
}

export function VisualizationModal({
  open,
  onOpenChange,
  data,
  tableName,
}: VisualizationModalProps) {
  // Detect numeric columns
  const numericColumns = data.length > 0
    ? Object.keys(data[0]).filter((key) => typeof data[0][key] === "number")
    : [];

  // Detect potential label columns (strings, first column, or common label names)
  const labelColumn = data.length > 0
    ? Object.keys(data[0]).find(
        (key) =>
          typeof data[0][key] === "string" ||
          ["name", "player", "team", "season", "position"].some((label) =>
            key.toLowerCase().includes(label)
          )
      ) || Object.keys(data[0])[0]
    : "";

  const [chartType, setChartType] = useState<"bar" | "line" | "pie" | "radar" | "table">("bar");
  const [xColumn, setXColumn] = useState(labelColumn);
  const [yColumns, setYColumns] = useState<string[]>(numericColumns.slice(0, 3));

  const chartConfig: ChartConfig = {
    chart_type: chartType,
    x_column: xColumn,
    y_columns: yColumns,
    title: `${tableName} Visualization`,
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
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ChartIcon className="w-5 h-5" />
            Visualize: {tableName}
          </DialogTitle>
          <DialogDescription>
            {data.length} rows • {numericColumns.length} numeric columns
          </DialogDescription>
        </DialogHeader>

        {/* Chart Configuration */}
        <div className="space-y-4">
          {/* Chart Type Selection */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-muted-foreground">Chart Type:</span>
            {(["bar", "line", "pie", "radar", "table"] as const).map((type) => (
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
          {chartType !== "table" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* X-Axis (Label) */}
              <div className="space-y-2">
                <label className="text-sm font-medium">X-Axis (Labels)</label>
                <Select value={xColumn} onValueChange={setXColumn}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select X-axis column" />
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

              {/* Y-Axis (Values) */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Y-Axis (Values) - {yColumns.length} selected
                </label>
                <div className="flex flex-wrap gap-1">
                  {numericColumns.map((col) => (
                    <Badge
                      key={col}
                      variant={yColumns.includes(col) ? "default" : "outline"}
                      className="cursor-pointer"
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
                {numericColumns.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No numeric columns available
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Chart Display */}
          <div className="border rounded-lg p-4 bg-muted/20">
            {yColumns.length === 0 && chartType !== "table" ? (
              <div className="text-center py-12 text-muted-foreground">
                <ChartIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select at least one Y-axis column to visualize data</p>
              </div>
            ) : (
              <ChartRenderer data={data.slice(0, 100)} chartConfig={chartConfig} />
            )}
          </div>

          {data.length > 100 && (
            <p className="text-xs text-muted-foreground text-center">
              Showing first 100 rows for performance
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
