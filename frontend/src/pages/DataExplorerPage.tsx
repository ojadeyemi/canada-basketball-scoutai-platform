import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Database,
  Table as TableIcon,
  Code,
  FileText,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { LEAGUES, type LeagueName } from "@/types/dataExplorer";
import { useTables, useTableData } from "@/hooks/useDataExplorer";
import { TableBrowser } from "@/components/DataExplorer/TableBrowser";
import { SchemaViewer } from "@/components/DataExplorer/SchemaViewer";
import { SQLEditor } from "@/components/agent/QueryResult/SQLEditor";
import type { LeagueDBName } from "@/types/agent";

export default function DataExplorerPage() {
  const [selectedLeague, setSelectedLeague] = useState<LeagueName | null>(
    "cebl",
  );
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null);

  // Fetch tables for selected league
  const { data: tablesData, isLoading: tablesLoading } =
    useTables(selectedLeague);

  // Get selected table metadata
  const selectedTableMeta = useMemo(() => {
    if (!tablesData || !selectedTable) return null;
    return tablesData.tables.find((t) => t.name === selectedTable);
  }, [tablesData, selectedTable]);

  // Auto-select first table when league changes
  useMemo(() => {
    if (tablesData?.tables.length && !selectedTable) {
      setSelectedTable(tablesData.tables[0].name);
    }
  }, [tablesData, selectedTable]);

  // Auto-select latest season when table changes
  useMemo(() => {
    if (selectedTableMeta?.latest_season) {
      setSelectedSeason(selectedTableMeta.latest_season.toString());
    } else {
      setSelectedSeason(null);
    }
  }, [selectedTableMeta]);

  // Fetch table data
  const { data: tableData, isLoading: dataLoading } = useTableData(
    selectedLeague,
    selectedTable,
    {
      season: selectedSeason || undefined,
    },
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Database className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Data Explorer
              </h1>
              <p className="text-muted-foreground mt-1">
                Browse, query, and visualize Canadian basketball league data
              </p>
            </div>
          </div>
        </div>

        {/* League Selector Card */}
        <Card className="mb-6 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <CardTitle className="text-lg">League</CardTitle>
                <CardDescription>Select a league to explore</CardDescription>
              </div>
              <Select
                value={selectedLeague || ""}
                onValueChange={(value) => {
                  setSelectedLeague(value as LeagueName);
                  setSelectedTable(null);
                  setSelectedSeason(null);
                }}
              >
                <SelectTrigger className="w-full sm:w-64">
                  <SelectValue placeholder="Select league" />
                </SelectTrigger>
                <SelectContent>
                  {LEAGUES.map((league) => (
                    <SelectItem key={league.id} value={league.id}>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {league.shortName}
                        </Badge>
                        <span>{league.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
        </Card>

        {/* Main Content */}
        {!selectedLeague ? (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center">
              <Database className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Select a League</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Choose a league from the dropdown above to start exploring
                player stats, team data, and game information
              </p>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="browse" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
              <TabsTrigger value="browse" className="gap-2">
                <TableIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Browse Tables</span>
                <span className="sm:hidden">Browse</span>
              </TabsTrigger>
              <TabsTrigger value="query" className="gap-2">
                <Code className="w-4 h-4" />
                <span className="hidden sm:inline">Custom SQL</span>
                <span className="sm:hidden">SQL</span>
              </TabsTrigger>
              <TabsTrigger value="schema" className="gap-2">
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Schema</span>
                <span className="sm:hidden">Schema</span>
              </TabsTrigger>
            </TabsList>

            {/* Browse Tables Tab */}
            <TabsContent value="browse" className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
                    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                      <Select
                        value={selectedTable || ""}
                        onValueChange={(value) => {
                          setSelectedTable(value);
                          setSelectedSeason(null);
                        }}
                        disabled={tablesLoading}
                      >
                        <SelectTrigger className="w-full sm:w-64">
                          <SelectValue placeholder="Select table" />
                        </SelectTrigger>
                        <SelectContent>
                          {tablesData?.tables.map((table) => (
                            <SelectItem key={table.name} value={table.name}>
                              <div className="flex items-center justify-between gap-4">
                                <span className="font-mono text-sm">
                                  {table.name}
                                </span>
                                <Badge variant="secondary" className="text-xs">
                                  {table.row_count.toLocaleString()}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {selectedTableMeta?.available_seasons &&
                        selectedTableMeta.available_seasons.length > 0 && (
                          <Select
                            value={selectedSeason || ""}
                            onValueChange={setSelectedSeason}
                          >
                            <SelectTrigger className="w-full sm:w-40">
                              <SelectValue placeholder="Season" />
                            </SelectTrigger>
                            <SelectContent>
                              {selectedTableMeta.available_seasons.map(
                                (season) => (
                                  <SelectItem
                                    key={season}
                                    value={season.toString()}
                                  >
                                    {season}
                                  </SelectItem>
                                ),
                              )}
                            </SelectContent>
                          </Select>
                        )}
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Season Required Warning */}
              {selectedTableMeta?.available_seasons &&
                selectedTableMeta.available_seasons.length > 0 &&
                !selectedSeason && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Please select a season to view data.
                    </AlertDescription>
                  </Alert>
                )}

              {/* Table Data Display */}
              {tablesLoading ? (
                <Card>
                  <CardContent className="py-16 text-center">
                    <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
                    <p className="text-muted-foreground">Loading tables...</p>
                  </CardContent>
                </Card>
              ) : selectedTable && tableData ? (
                <Card>
                  <CardContent className="pt-6">
                    <TableBrowser
                      data={tableData.data}
                      tableName={selectedTable}
                      isLoading={dataLoading}
                    />
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-dashed">
                  <CardContent className="py-16 text-center">
                    <TableIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">
                      No Table Selected
                    </h3>
                    <p className="text-muted-foreground">
                      Select a table from the dropdown above to view its data
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Custom SQL Tab */}
            <TabsContent value="query">
              <Card>
                <CardHeader>
                  <CardTitle>Custom SQL Query</CardTitle>
                  <CardDescription>
                    Write and execute custom SQL queries against the{" "}
                    {selectedLeague.toUpperCase()} database
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SQLEditor
                    sqlQuery={`-- Example: Get top 10 scorers\nSELECT * FROM ${selectedTable || "players"} LIMIT 10`}
                    dbName={selectedLeague as LeagueDBName}
                    chartTitle={`${selectedLeague.toUpperCase()} Custom Query`}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Schema Tab */}
            <TabsContent value="schema">
              <Card>
                <CardHeader>
                  <CardTitle>Database Schema</CardTitle>
                  <CardDescription>
                    Explore table structures and column definitions for the{" "}
                    {selectedLeague.toUpperCase()} database
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SchemaViewer league={selectedLeague as LeagueDBName} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
