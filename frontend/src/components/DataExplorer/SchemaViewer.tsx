import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getDatabaseSchema } from "@/services/agentService";
import type { LeagueDBName } from "@/types/agent";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Database, Search, Table as TableIcon } from "lucide-react";
import { toast } from "sonner";

interface SchemaViewerProps {
  league: LeagueDBName;
}

export function SchemaViewer({ league }: SchemaViewerProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: schema, isLoading, error } = useQuery({
    queryKey: ["schema", league],
    queryFn: () => getDatabaseSchema(league),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label} to clipboard`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <Database className="w-12 h-12 mx-auto animate-pulse text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading schema...</p>
        </div>
      </div>
    );
  }

  if (error || !schema) {
    return (
      <Card className="border-destructive">
        <CardContent className="py-12 text-center">
          <p className="text-destructive">Failed to load schema</p>
        </CardContent>
      </Card>
    );
  }

  // Filter tables based on search
  const filteredTables = schema.tables.filter((table) =>
    searchQuery
      ? table.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        table.columns.some((col) => col.name.toLowerCase().includes(searchQuery.toLowerCase()))
      : true
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Database className="w-5 h-5" />
            Database Schema
          </h3>
          <p className="text-sm text-muted-foreground">
            {schema.tables.length} tables • {league.toUpperCase()}
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tables or columns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Tables Accordion */}
      {filteredTables.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No tables or columns match your search</p>
          </CardContent>
        </Card>
      ) : (
        <Accordion type="multiple" className="space-y-2">
          {filteredTables.map((table) => (
            <AccordionItem
              key={table.name}
              value={table.name}
              className="border rounded-lg px-4 bg-card"
            >
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3 flex-1">
                  <TableIcon className="w-4 h-4 text-primary" />
                  <span className="font-mono font-medium">{table.name}</span>
                  <Badge variant="secondary" className="ml-auto mr-2">
                    {table.columns.length} columns
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pt-2">
                  {/* Quick Copy Button */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(table.name, "table name")}
                    >
                      <Copy className="w-3 h-3 mr-2" />
                      Copy Table Name
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(
                          `SELECT * FROM ${table.name} LIMIT 10`,
                          "query template"
                        )
                      }
                    >
                      <Copy className="w-3 h-3 mr-2" />
                      Copy SELECT Query
                    </Button>
                  </div>

                  {/* Columns List */}
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left p-2 font-medium">Column Name</th>
                          <th className="text-left p-2 font-medium">Type</th>
                          <th className="text-left p-2 font-medium">Nullable</th>
                          <th className="text-right p-2 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {table.columns.map((col, idx) => (
                          <tr
                            key={col.name}
                            className={`border-t ${
                              idx % 2 === 0 ? "bg-background" : "bg-muted/20"
                            } hover:bg-muted/40 transition-colors`}
                          >
                            <td className="p-2 font-mono text-xs">{col.name}</td>
                            <td className="p-2">
                              <Badge variant="outline" className="font-mono text-xs">
                                {col.type || "UNKNOWN"}
                              </Badge>
                            </td>
                            <td className="p-2">
                              <Badge variant={col.nullable ? "secondary" : "default"}>
                                {col.nullable ? "Yes" : "No"}
                              </Badge>
                            </td>
                            <td className="p-2 text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(col.name, "column name")}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}
