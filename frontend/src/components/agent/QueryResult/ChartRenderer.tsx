import type { ChartConfig } from "@/types/agent";
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

interface ChartRendererProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>[];
  chartConfig?: ChartConfig;
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

const formatValue = (
  value: unknown,
  format?: ChartConfig["value_format"],
): string | number => {
  if (typeof value !== "number") return String(value ?? "");

  const numValue = value as number;

  switch (format) {
    case "percentage":
      return `${(numValue * 100).toFixed(1)}%`;
    case "decimal":
      return numValue.toFixed(1);
    default:
      return Math.round(numValue);
  }
};

function DataTable({
  data,
  chartConfig,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>[];
  chartConfig?: ChartConfig;
}) {
  if (data.length === 0)
    return <p className="text-sm text-muted-foreground">No data available</p>;

  const columns = Object.keys(data[0]);

  return (
    <div className="space-y-3">
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
                    {formatValue(row[col], chartConfig?.value_format)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export function ChartRenderer({ data, chartConfig }: ChartRendererProps) {
  if (!chartConfig || chartConfig.chart_type === "table") {
    return <DataTable data={data} chartConfig={chartConfig} />;
  }

  const { chart_type, x_column, y_columns, color_scheme } = chartConfig;
  const colors =
    color_scheme || [...CHART_COLORS].sort(() => Math.random() - 0.5);

  const rechartsConfig = y_columns.reduce(
    (acc, col, idx) => {
      acc[col] = {
        label: col.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        color: colors[idx % colors.length],
      };
      return acc;
    },
    {} as Record<string, { label: string; color: string }>,
  );

  switch (chart_type) {
    case "bar":
      return (
        <ChartContainer config={rechartsConfig} className="h-[250px] w-full">
          <BarChart data={data} height={250}>
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
        <ChartContainer config={rechartsConfig} className="h-[250px] w-full">
          <LineChart data={data} height={250}>
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
        <ChartContainer config={rechartsConfig} className="h-[250px] w-full">
          <RadarChart data={data} height={250}>
            <PolarGrid />
            <PolarAngleAxis dataKey={x_column || undefined} />
            <PolarRadiusAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend />
            {y_columns.map((col, idx) => (
              <Radar
                key={col}
                name={col}
                dataKey={col}
                stroke={colors[idx % colors.length]}
                fill={colors[idx % colors.length]}
                fillOpacity={0.3}
                strokeWidth={2}
              />
            ))}
          </RadarChart>
        </ChartContainer>
      );

    case "pie":
      return (
        <ChartContainer config={rechartsConfig} className="h-[250px] w-full">
          <PieChart height={250}>
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
      return <DataTable data={data} chartConfig={chartConfig} />;
  }
}
