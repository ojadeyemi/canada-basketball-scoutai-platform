import type { AgentNodeOutput } from "@/types/agent";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

interface StreamEvent {
  node: string;
  output: AgentNodeOutput;
}

export async function* streamChat(
  userInput: string | number | boolean,
  sessionId: string,
  isResume = false,
  interruptType?: "player_selection_for_scouting" | "scouting_confirmation",
): AsyncGenerator<StreamEvent> {
  const response = await fetch(`${API_BASE_URL}/api/agent/chat`, {
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
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");

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
