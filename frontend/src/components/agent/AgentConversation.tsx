import { Sparkles } from "lucide-react";
import type { GenerateResponseOutput, RouterOutput } from "@/types/agent";
import { AGENT_NODES } from "@/constants/nodes";
import UserMessage from "@/components/agent/UserMessage";
import AIMessage from "@/components/agent/AIMessage";
import AgentThinking from "@/components/agent/AgentThinking";
import NodeLoader from "@/components/agent/NodeLoader";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";

interface Message {
  type: "user" | "ai";
  content: string | GenerateResponseOutput;
}

interface AgentConversationProps {
  messages: Message[];
  isStreaming: boolean;
  currentNode: string | null;
  routerOutput: RouterOutput | null;
  suggestedPrompts: string[];
  onPromptClick: (prompt: string) => void;
}

export default function AgentConversation({
  messages,
  isStreaming,
  currentNode,
  routerOutput,
  suggestedPrompts,
  onPromptClick,
}: AgentConversationProps) {
  return (
    <Conversation className="flex-1 overflow-y-auto">
      <ConversationContent className="space-y-2 w-full px-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
            <div className="w-full max-w-xl space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide text-center">
                Try asking:
              </p>
              <Suggestions className="flex-col gap-3">
                {suggestedPrompts.map((prompt, i) => (
                  <Suggestion
                    key={i}
                    suggestion={prompt}
                    onClick={onPromptClick}
                    className="w-full justify-start py-3 h-auto text-left whitespace-normal"
                    variant="secondary"
                  />
                ))}
              </Suggestions>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <div key={i}>
                {msg.type === "user" ? (
                  <UserMessage content={msg.content as string} />
                ) : (
                  <AIMessage output={msg.content as GenerateResponseOutput} />
                )}
              </div>
            ))}

            {routerOutput && (
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <AgentThinking
                    routerOutput={routerOutput}
                    isStreaming={isStreaming}
                  />
                </div>
              </div>
            )}

            {currentNode && currentNode !== AGENT_NODES.ROUTER && (
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <NodeLoader
                    node={
                      currentNode as
                        | "router"
                        | "stats_lookup"
                        | "confirm_scouting_report"
                        | "scout"
                        | "generate_response"
                    }
                  />
                </div>
              </div>
            )}
          </>
        )}
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  );
}
