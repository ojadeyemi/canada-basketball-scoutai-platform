import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronDown,
  Database,
  Play,
  Loader2,
  Table as TableIcon,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RotateCcw,
} from "lucide-react";
import Editor, { type Monaco } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { runRawSQL, getDatabaseSchema } from "@/services/agentService";
import type { DatabaseSchema, LeagueDBName } from "@/types/agent";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type SortingState,
  type ColumnDef,
} from "@tanstack/react-table";

interface SQLEditorProps {
  sqlQuery: string;
  dbName: string;
  chartTitle?: string;
}

function RawQueryResultTable({ data }: { data: Record<string, any>[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);

  if (!data || data.length === 0) {
    return <p className="text-sm text-muted-foreground">No results found.</p>;
  }

  const formatCellValue = (value: any): string => {
    if (value === null || value === undefined) return "—";
    if (typeof value === "number") {
      return Number.isInteger(value) ? value.toString() : value.toFixed(2);
    }
    return String(value);
  };

  const columnKeys = Object.keys(data[0]);
  const columns: ColumnDef<Record<string, any>>[] = columnKeys.map((key) => ({
    accessorKey: key,
    header: ({ column }) => {
      const sortDirection = column.getIsSorted();
      return (
        <button
          className="flex items-center gap-1 hover:text-foreground transition-colors font-semibold"
          onClick={() => column.toggleSorting(sortDirection === "asc")}
          aria-label={`Sort by ${key} ${sortDirection === "asc" ? "descending" : "ascending"}`}
        >
          {key}
          {sortDirection === "asc" ? (
            <ArrowUp className="w-4 h-4" />
          ) : sortDirection === "desc" ? (
            <ArrowDown className="w-4 h-4" />
          ) : (
            <ArrowUpDown className="w-4 h-4 opacity-50" />
          )}
        </button>
      );
    },
    cell: ({ getValue }) => formatCellValue(getValue()),
  }));

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="rounded-md border border-border/40 overflow-auto bg-card max-h-[600px]">
      <Table>
        <TableHeader className="bg-muted/50 sticky top-0 z-10">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="hover:bg-transparent border-b border-border/40"
            >
              {headerGroup.headers.map((header, headerIndex) => (
                <TableHead
                  key={header.id}
                  className={cn(
                    "h-10 px-3 text-xs font-medium bg-muted/50",
                    headerIndex !== headerGroup.headers.length - 1 &&
                      "border-r border-border/20",
                  )}
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
          {table.getRowModel().rows.map((row, index) => (
            <TableRow
              key={row.id}
              className={cn(
                "border-b border-border/20 transition-colors hover:bg-muted/30",
                index % 2 === 0 ? "bg-background" : "bg-muted/10",
              )}
            >
              {row.getVisibleCells().map((cell, cellIndex) => (
                <TableCell
                  key={cell.id}
                  className={cn(
                    "px-3 py-2.5 text-sm",
                    cellIndex !== row.getVisibleCells().length - 1 &&
                      "border-r border-border/20",
                  )}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function SQLEditor({ sqlQuery, dbName, chartTitle }: SQLEditorProps) {
  const [isQueryOpen, setIsQueryOpen] = useState(false);
  const [rawQueryResults, setRawQueryResults] = useState<
    Record<string, any>[] | null
  >(null);
  const [isRawQueryLoading, setIsRawQueryLoading] = useState(false);
  const [rawQueryError, setRawQueryError] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const [editedSQL, setEditedSQL] = useState(sqlQuery);
  const [schema, setSchema] = useState<DatabaseSchema | null>(null);
  const isDirty = editedSQL !== sqlQuery;

  const monacoRef = useRef<Monaco | null>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    if (dbName) {
      getDatabaseSchema(dbName as LeagueDBName)
        .then(setSchema)
        .catch((err) => console.error("Failed to fetch schema:", err));
    }
  }, [dbName]);

  useEffect(() => {
    if (sqlQuery) {
      setEditedSQL(sqlQuery);
    }
  }, [sqlQuery]);

  const handleRunQuery = async () => {
    if (!editedSQL) return;
    setIsRawQueryLoading(true);
    setRawQueryError(null);
    setRawQueryResults(null);
    try {
      const results = await runRawSQL(editedSQL, dbName as LeagueDBName);
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

  const handleResetSQL = () => {
    setEditedSQL(sqlQuery);
  };

  const handleEditorDidMount = (
    editorInstance: editor.IStandaloneCodeEditor,
    monaco: Monaco,
  ) => {
    editorRef.current = editorInstance;
    monacoRef.current = monaco;

    if (!schema) return;

    monaco.languages.registerCompletionItemProvider("sql", {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const suggestions: any[] = [];

        schema.tables.forEach((table) => {
          suggestions.push({
            label: table.name,
            kind: monaco.languages.CompletionItemKind.Class,
            insertText: table.name,
            range,
            detail: "table",
          });

          table.columns.forEach((col) => {
            suggestions.push({
              label: `${table.name}.${col.name}`,
              kind: monaco.languages.CompletionItemKind.Field,
              insertText: `${table.name}.${col.name}`,
              range,
              detail: `${col.type}${col.nullable ? " (nullable)" : ""}`,
              documentation: `Column from ${table.name}`,
            });
          });
        });

        return { suggestions };
      },
    });

    const validateSQL = (model: any) => {
      const value = model.getValue();
      const markers: any[] = [];

      const lines = value.split("\n");
      lines.forEach((line: string, lineIndex: number) => {
        const lineNumber = lineIndex + 1;

        if (/SELECT\s*$/i.test(line.trim())) {
          markers.push({
            severity: monaco.MarkerSeverity.Error,
            startLineNumber: lineNumber,
            startColumn: 1,
            endLineNumber: lineNumber,
            endColumn: line.length + 1,
            message: "Incomplete SELECT statement",
          });
        }

        if (/FROM\s*$/i.test(line.trim())) {
          markers.push({
            severity: monaco.MarkerSeverity.Error,
            startLineNumber: lineNumber,
            startColumn: 1,
            endLineNumber: lineNumber,
            endColumn: line.length + 1,
            message: "Incomplete FROM clause",
          });
        }

        const singleQuotes = (line.match(/'/g) || []).length;
        const doubleQuotes = (line.match(/"/g) || []).length;
        if (singleQuotes % 2 !== 0 || doubleQuotes % 2 !== 0) {
          markers.push({
            severity: monaco.MarkerSeverity.Error,
            startLineNumber: lineNumber,
            startColumn: 1,
            endLineNumber: lineNumber,
            endColumn: line.length + 1,
            message: "Unmatched quotes",
          });
        }

        if (/\bLIMI\b/i.test(line)) {
          const match = line.match(/\bLIMI\b/i);
          if (match && match.index !== undefined) {
            markers.push({
              severity: monaco.MarkerSeverity.Error,
              startLineNumber: lineNumber,
              startColumn: match.index + 1,
              endLineNumber: lineNumber,
              endColumn: match.index + 5,
              message: "Did you mean 'LIMIT'?",
            });
          }
        }
      });

      const trailingCommaMatch = value.match(/,\s*(FROM|WHERE|ORDER|GROUP)/i);
      if (trailingCommaMatch && trailingCommaMatch.index !== undefined) {
        const position = model.getPositionAt(trailingCommaMatch.index);
        markers.push({
          severity: monaco.MarkerSeverity.Error,
          startLineNumber: position.lineNumber,
          startColumn: position.column,
          endLineNumber: position.lineNumber,
          endColumn: position.column + 1,
          message: "Unexpected comma before keyword",
        });
      }

      monaco.editor.setModelMarkers(model, "sql", markers);
    };

    const model = editorInstance.getModel();
    if (model) {
      validateSQL(model);
      model.onDidChangeContent(() => validateSQL(model));
    }
  };

  return (
    <Collapsible open={isQueryOpen} onOpenChange={setIsQueryOpen}>
      <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ChevronDown
          className={`w-4 h-4 transition-transform ${isQueryOpen ? "rotate-180" : ""}`}
        />
        <Database className="w-4 h-4" />
        <span>View SQL Query</span>
        <Badge variant="secondary" className="ml-2 text-xs">
          {dbName}
        </Badge>
        {isDirty && (
          <Badge variant="outline" className="ml-1 text-xs">
            Modified
          </Badge>
        )}
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 space-y-3">
        <div className="rounded-lg border overflow-hidden h-[200px]">
          <Editor
            height="100%"
            language="sql"
            value={editedSQL}
            onChange={(value) => setEditedSQL(value || "")}
            onMount={handleEditorDidMount}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 12,
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              wordWrap: "on",
              scrollbar: {
                vertical: "auto",
                horizontal: "auto",
              },
            }}
          />
        </div>
        <div className="flex items-center gap-2">
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
          {isDirty && (
            <Button
              onClick={handleResetSQL}
              size="sm"
              variant="outline"
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </Button>
          )}
        </div>

        {rawQueryError && (
          <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-md">
            <div className="flex items-start gap-2">
              <span className="text-red-500 font-semibold text-sm">
                ❌ SQL Error
              </span>
            </div>
            <p className="text-red-500 text-xs mt-1">{rawQueryError}</p>
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
              className="w-full sm:max-w-3xl overflow-y-auto pt-20 flex flex-col"
            >
              <SheetHeader className="pb-4 border-b">
                <SheetTitle className="text-lg">
                  {chartTitle || `Query Results`}
                </SheetTitle>
                <SheetDescription className="text-xs">
                  {rawQueryResults.length} rows • {dbName}
                </SheetDescription>
              </SheetHeader>
              <div className="flex-1 py-6 px-4 overflow-auto">
                <RawQueryResultTable data={rawQueryResults} />
              </div>
              <div className="border-t p-4 mt-auto bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <SheetClose asChild>
                  <Button variant="outline" className="w-full">
                    Close
                  </Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
