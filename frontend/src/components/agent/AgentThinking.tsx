import { useCallback, useEffect, useState } from "react";
import type { RouterOutput } from "@/types/agent";
import { INTENT_MESSAGES } from "@/constants/nodes";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";

interface AgentThinkingProps {
  routerOutput: RouterOutput | null;
  isStreaming: boolean;
}

const getRandomMessage = (messages: string[]): string => {
  return messages[Math.floor(Math.random() * messages.length)];
};

export default function AgentThinking({
  routerOutput,
  isStreaming,
}: AgentThinkingProps) {
  const [content, setContent] = useState("");
  const [currentTokenIndex, setCurrentTokenIndex] = useState(0);
  const [tokens, setTokens] = useState<string[]>([]);

  // Function to chunk text into fake tokens of 3-4 characters
  const chunkIntoTokens = useCallback((text: string): string[] => {
    const tokens: string[] = [];
    let i = 0;
    while (i < text.length) {
      const chunkSize = Math.floor(Math.random() * 2) + 3; // Random size between 3-4
      tokens.push(text.slice(i, i + chunkSize));
      i += chunkSize;
    }
    return tokens;
  }, []);

  // Build content text when routerOutput changes
  useEffect(() => {
    if (!routerOutput) return;

    const parts: string[] = [];

    // Get random intent message
    const intentMessages = INTENT_MESSAGES[routerOutput.intent] || [
      "Processing...",
    ];
    const intentMessage = getRandomMessage(intentMessages);
    parts.push(intentMessage);

    // Add player name if available
    if (routerOutput.player_name || routerOutput.entities?.player_name) {
      const playerName =
        routerOutput.player_name || routerOutput.entities.player_name;
      parts.push(`Player: ${playerName}`);
    }

    // Add league if available
    if (routerOutput.league || routerOutput.entities?.league) {
      const league = routerOutput.league || routerOutput.entities.league;
      parts.push(`League: ${league}`);
    }

    // Add season if available
    if (routerOutput.entities?.season) {
      parts.push(`Season: ${routerOutput.entities.season}`);
    }

    // Add query context if available
    if (routerOutput.entities?.query_context) {
      parts.push(routerOutput.entities.query_context);
    }

    const fullText = parts.join("\n\n");
    const tokenizedText = chunkIntoTokens(fullText);
    setTokens(tokenizedText);
    setContent("");
    setCurrentTokenIndex(0);
  }, [routerOutput, chunkIntoTokens]);

  // Stream tokens
  useEffect(() => {
    if (!isStreaming || currentTokenIndex >= tokens.length) {
      return;
    }

    const timer = setTimeout(() => {
      setContent((prev) => prev + tokens[currentTokenIndex]);
      setCurrentTokenIndex((prev) => prev + 1);
    }, 50);

    return () => clearTimeout(timer);
  }, [isStreaming, currentTokenIndex, tokens]);

  if (!routerOutput) return null;

  return (
    <Reasoning isStreaming={isStreaming}>
      <ReasoningTrigger title="Thinking" />
      <ReasoningContent>{content}</ReasoningContent>
    </Reasoning>
  );
}
