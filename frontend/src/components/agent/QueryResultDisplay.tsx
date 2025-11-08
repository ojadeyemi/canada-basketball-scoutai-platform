import type { QueryResult, ChartConfig } from "@/types/agent";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  Database,
  Play,
  Loader2,
  Table as TableIcon,
} from "lucide-react";
import { useState } from "react";
import { runRawSQL } from "@/services/agentService";

interface QueryResultDisplayProps {
  queryResult: QueryResult;
}

const CHART_COLORS = [
  "#3b82f6",
  "#ef4444",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
  "#f97316",
  "#6366f1",
];
//TODO change defualt colors of bar
//for table on side remove toggle and maybe try to round decimal numebrs to two decimal places if needed
//TO DO move title and other stuff of sheet lower of  firue out a way for navbar to not cover everywhere

//TODO make chart result as well smaller overall covering alot of space right now

function RawQueryResultTable({ data }: { data: Record<string, any>[] }) {
  if (!data || data.length === 0) {
    return <p className="text-sm text-muted-foreground">No results found.</p>;
  }
  const columns = Object.keys(data[0]);
  return (
    <div className="rounded-lg border overflow-hidden mt-4">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col} className="font-semibold">
                {col}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, idx) => (
            <TableRow key={idx}>
              {columns.map((col) => (
                <TableCell key={col}>{String(row[col])}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function QueryResultDisplay({
  queryResult,
}: QueryResultDisplayProps) {
  const { data, chart_config, sql_query, db_name } = queryResult;
  const [isQueryOpen, setIsQueryOpen] = useState(false);
  const [rawQueryResults, setRawQueryResults] = useState<
    Record<string, any>[] | null
  >(null);
  const [isRawQueryLoading, setIsRawQueryLoading] = useState(false);
  const [rawQueryError, setRawQueryError] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isTableCollapsed, setIsTableCollapsed] = useState(false);

  const handleRunQuery = async () => {
    if (!sql_query) return;
    setIsRawQueryLoading(true);
    setRawQueryError(null);
    setRawQueryResults(null);
    try {
      const results = await runRawSQL(sql_query, db_name);
      setRawQueryResults(results);
    } catch (error) {
      console.error("Failed to run raw SQL query:", error);
      setRawQueryError(
        error instanceof Error ? error.message : "An unknown error occurred.",
      );
    } finally {
      setIsRawQueryLoading(false);
    }
  };

  const formatValue = (value: any, format?: ChartConfig["value_format"]) => {
    if (typeof value !== "number") return value;

    switch (format) {
      case "percentage":
        return `${(value * 100).toFixed(1)}%`;
      case "decimal":
        return value.toFixed(1);
      default:
        return Math.round(value);
    }
  };

  const renderChart = () => {
    if (!chart_config || chart_config.chart_type === "table") {
      return renderTable();
    }

    const { chart_type, x_column, y_columns, color_scheme } = chart_config;
    const colors = color_scheme || CHART_COLORS;

    const chartConfig = y_columns.reduce(
      (acc, col, idx) => {
        acc[col] = {
          label: col
            .replace(/_/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase()),
          color: colors[idx % colors.length],
        };
        return acc;
      },
      {} as Record<string, { label: string; color: string }>,
    );

    switch (chart_type) {
      case "bar":
        return (
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
            <BarChart data={data} width={856} height={350}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={x_column || undefined} />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              {y_columns.map((col, idx) => (
                <Bar
                  key={col}
                  dataKey={col}
                  fill={colors[idx % colors.length]}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ChartContainer>
        );

      case "line":
        return (
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
            <LineChart data={data} width={856} height={350}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={x_column || undefined} />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              {y_columns.map((col, idx) => (
                <Line
                  key={col}
                  type="monotone"
                  dataKey={col}
                  stroke={colors[idx % colors.length]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ChartContainer>
        );

      case "radar":
        return (
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
            <RadarChart data={data} width={856} height={350}>
              <PolarGrid />
              <PolarAngleAxis dataKey={x_column || undefined} />
              <PolarRadiusAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              {y_columns.map((col, idx) => (
                <Radar
                  key={col}
                  name={col}
                  dataKey={col}
                  stroke={colors[idx % colors.length]}
                  fill={colors[idx % colors.length]}
                  fillOpacity={0.6}
                />
              ))}
            </RadarChart>
          </ChartContainer>
        );

      case "pie":
        return (
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
            <PieChart width={856} height={350}>
              <Pie
                data={data}
                dataKey={y_columns[0]}
                nameKey={x_column || "name"}
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colors[index % colors.length]}
                  />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ChartContainer>
        );

      default:
        return renderTable();
    }
  };

  const renderTable = () => {
    if (data.length === 0)
      return <p className="text-sm text-muted-foreground">No data available</p>;

    const columns = Object.keys(data[0]);

    return (
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col} className="font-semibold">
                  {col
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, idx) => (
              <TableRow key={idx}>
                {columns.map((col) => (
                  <TableCell key={col}>
                    {formatValue(row[col], chart_config?.value_format)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <Card className="w-full max-w-full">
      <CardHeader>
        <CardTitle>{chart_config?.title || "Query Results"}</CardTitle>
        {chart_config?.subtitle && (
          <CardDescription>{chart_config.subtitle}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4 overflow-x-hidden">
        <div className="overflow-x-auto">{renderChart()}</div>

        {/* SQL Query Collapsible */}
        {sql_query && (
          <Collapsible open={isQueryOpen} onOpenChange={setIsQueryOpen}>
            <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ChevronDown
                className={`w-4 h-4 transition-transform ${isQueryOpen ? "rotate-180" : ""}`}
              />
              <Database className="w-4 h-4" />
              <span>View SQL Query</span>
              <Badge variant="secondary" className="ml-2 text-xs">
                {db_name}
              </Badge>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 space-y-3">
              <pre className="bg-muted p-3 rounded-lg text-xs overflow-x-auto relative">
                <code className="text-foreground">{sql_query}</code>
              </pre>
              <Button
                onClick={handleRunQuery}
                disabled={isRawQueryLoading}
                size="sm"
                variant="secondary"
                className="flex items-center gap-2"
              >
                {isRawQueryLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                <span>Run Query</span>
              </Button>

              {rawQueryError && (
                <div className="text-red-500 text-xs bg-red-500/10 p-2 rounded-md">
                  {rawQueryError}
                </div>
              )}

              {rawQueryResults && (
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <TableIcon className="w-4 h-4" />
                      <span>View Results ({rawQueryResults.length} rows)</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="right"
                    className="w-full sm:max-w-3xl overflow-y-auto"
                  >
                    <SheetHeader>
                      <SheetTitle>
                        {chart_config?.title || `Query Results - ${db_name}`}
                      </SheetTitle>
                      <SheetDescription>
                        Showing {rawQueryResults.length} rows from {db_name}
                      </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6">
                      <Collapsible
                        open={!isTableCollapsed}
                        onOpenChange={(open) => setIsTableCollapsed(!open)}
                      >
                        <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium mb-3 hover:text-foreground transition-colors">
                          <ChevronDown
                            className={`w-4 h-4 transition-transform ${!isTableCollapsed ? "rotate-180" : ""}`}
                          />
                          <span>Data Table</span>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <RawQueryResultTable data={rawQueryResults} />
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                  </SheetContent>
                </Sheet>
              )}
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
}
