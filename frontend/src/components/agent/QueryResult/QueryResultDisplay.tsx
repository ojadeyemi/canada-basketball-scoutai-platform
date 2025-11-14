import type { QueryResult } from "@/types/agent";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartRenderer } from "./ChartRenderer";
import { SQLEditor } from "./SQLEditor";
import { ExportButton } from "@/components/DataExplorer/ExportButton";

interface QueryResultDisplayProps {
  queryResult: QueryResult;
}

export default function QueryResultDisplay({
  queryResult,
}: QueryResultDisplayProps) {
  const { data, chart_config, sql_query, db_name } = queryResult;

  return (
    <Card className="w-full max-w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">
          {chart_config?.title || "Query Results"}
        </CardTitle>
        {chart_config?.subtitle && (
          <CardDescription className="text-sm">
            {chart_config.subtitle}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-3 overflow-x-hidden pt-0">
        <div className="flex justify-end">
          <ExportButton
            data={data}
            filename={chart_config?.title || "query_results"}
          />
        </div>
        <div className="overflow-x-auto">
          <ChartRenderer data={data} chartConfig={chart_config} />
        </div>

        {sql_query && (
          <SQLEditor
            sqlQuery={sql_query}
            dbName={db_name}
            chartTitle={chart_config?.title}
          />
        )}
      </CardContent>
    </Card>
  );
}
