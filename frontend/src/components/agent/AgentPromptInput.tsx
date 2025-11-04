import { useState, useRef } from "react";
import {
  PromptInput,
  PromptInputBody,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTools,
  PromptInputSpeechButton,
} from "@/components/ai-elements/prompt-input";
import PlayerContextManager, {
  type PlayerContext,
} from "@/components/agent/PlayerContextManager";

interface AgentPromptInputProps {
  onSubmit: (message: { text?: string; displayText?: string }) => void;
  disabled?: boolean;
  isStreaming?: boolean;
  placeholder?: string;
}

export default function AgentPromptInput({
  onSubmit,
  disabled,
  isStreaming,
  placeholder = "Ask about players, stats, or trends...",
}: AgentPromptInputProps) {
  const [playerContexts, setPlayerContexts] = useState<PlayerContext[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const addPlayerContext = (player: PlayerContext) => {
    setPlayerContexts((prev) => [...prev, player]);
  };

  const removePlayerContext = (id: string) => {
    setPlayerContexts((prev) => prev.filter((p) => p.id !== id));
  };

  const formatPlayerContextString = () => {
    if (playerContexts.length === 0) return "";

    const contextLines = playerContexts.map(
      (player) =>
        `[Player Context: ${player.full_name} (${player.teams.join(", ")}) - ${player.league} - Seasons: ${player.seasons.join(", ")}]`,
    );

    return contextLines.join("\n") + "\n\n";
  };

  const handleSubmit = (message: { text?: string }) => {
    const contextString = formatPlayerContextString();
    const userText = message.text || "";
    const finalMessage = {
      text: contextString + userText,
      displayText: userText,
    };
    onSubmit(finalMessage);
    setPlayerContexts([]);
  };

  return (
    <PromptInput onSubmit={handleSubmit}>
      <PromptInputBody>
        <PromptInputTextarea
          ref={textareaRef}
          placeholder={placeholder}
          disabled={disabled}
        />
      </PromptInputBody>

      <PromptInputFooter>
        <PromptInputTools>
          <PromptInputSpeechButton textareaRef={textareaRef} />
          <PlayerContextManager
            playerContexts={playerContexts}
            onAdd={addPlayerContext}
            onRemove={removePlayerContext}
          />
        </PromptInputTools>
        <PromptInputSubmit
          disabled={disabled}
          status={isStreaming ? "streaming" : undefined}
        />
      </PromptInputFooter>
    </PromptInput>
  );
}
