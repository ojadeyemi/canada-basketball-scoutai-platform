import type {
  AgentNodeOutput,
  LeagueDBName,
  DatabaseSchema,
} from "@/types/agent";
import { API_BASE_URL } from "@/config/api";
import { toast } from "sonner";

interface StreamEvent {
  node: string;
  output: AgentNodeOutput;
}

export interface SQLErrorDetail {
  message: string;
  raw_error: string;
}

async function getErrorFromResponse(response: Response): Promise<string> {
  try {
    const data = await response.json();
    return (
      data.detail ||
      data.message ||
      `HTTP ${response.status}: ${response.statusText}`
    );
  } catch {
    return `HTTP ${response.status}: ${response.statusText}`;
  }
}

async function getSQLErrorFromResponse(
  response: Response,
): Promise<SQLErrorDetail> {
  try {
    const data = await response.json();
    if (typeof data.detail === "object" && data.detail.message) {
      return {
        message: data.detail.message,
        raw_error: data.detail.raw_error || data.detail.message,
      };
    }
    const errorMsg =
      data.detail ||
      data.message ||
      `HTTP ${response.status}: ${response.statusText}`;
    return { message: errorMsg, raw_error: errorMsg };
  } catch {
    const fallback = `HTTP ${response.status}: ${response.statusText}`;
    return { message: fallback, raw_error: fallback };
  }
}

export async function* streamChat(
  userInput: string | number | boolean,
  sessionId: string,
  isResume = false,
  interruptType?: "player_selection_for_scouting" | "scouting_confirmation",
): AsyncGenerator<StreamEvent> {
  const response = await fetch(`${API_BASE_URL}/agent/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_input: userInput,
      session_id: sessionId,
      is_resume: isResume,
      interrupt_type: interruptType,
    }),
  });

  if (!response.ok) {
    const errorMsg = await getErrorFromResponse(response);
    toast.error(errorMsg);
    throw new Error(errorMsg);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    toast.error("No response body");
    throw new Error("No response body");
  }

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.trim()) {
          try {
            const event = JSON.parse(line) as StreamEvent;
            yield event;
          } catch (e) {
            console.error("Failed to parse NDJSON line:", line, e);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

export class SQLError extends Error {
  constructor(
    message: string,
    public rawError: string,
  ) {
    super(message);
    this.name = "SQLError";
  }
}

export async function runRawSQL(
  sql: string,
  dbName: LeagueDBName,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<Record<string, any>[]> {
  const response = await fetch(`${API_BASE_URL}/agent/run-sql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sql_query: sql, db_name: dbName }),
  });

  if (!response.ok) {
    const errorDetail = await getSQLErrorFromResponse(response);
    toast.error(errorDetail.message);
    throw new SQLError(errorDetail.message, errorDetail.raw_error);
  }

  return response.json();
}

export async function getDatabaseSchema(
  dbName: LeagueDBName,
): Promise<DatabaseSchema> {
  const response = await fetch(`${API_BASE_URL}/agent/schema/${dbName}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const errorMsg = await getErrorFromResponse(response);
    toast.error(errorMsg);
    throw new Error(errorMsg);
  }

  return response.json();
}
