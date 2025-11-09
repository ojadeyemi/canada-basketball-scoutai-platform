import type { AgentNodeOutput, LeagueDBName } from "@/types/agent";
import { API_BASE_URL } from "@/config/api";
import { toast } from "sonner";

interface StreamEvent {
  node: string;
  output: AgentNodeOutput;
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

export async function runRawSQL(
  sql: string,
  dbName: LeagueDBName,
): Promise<Record<string, any>[]> {
  const response = await fetch(`${API_BASE_URL}/agent/run-sql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sql_query: sql, db_name: dbName }),
  });

  if (!response.ok) {
    const errorMsg = await getErrorFromResponse(response);
    toast.error(errorMsg);
    throw new Error(errorMsg);
  }

  return response.json();
}
