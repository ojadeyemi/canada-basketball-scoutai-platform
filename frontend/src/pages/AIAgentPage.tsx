import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { streamChat } from "@/services/agentService";
import type {
  PlayerSelectionInterrupt,
  ScoutingConfirmationInterrupt,
  GenerateResponseOutput,
  RouterOutput,
} from "@/types/agent";
import { AGENT_NODES, INTERRUPT_TYPES } from "@/constants/nodes";
import PlayerSelectionModal from "@/components/agent/PlayerSelectionModal";
import ScoutingConfirmationModal from "@/components/agent/ScoutingConfirmationModal";
import AgentPromptInput from "@/components/agent/AgentPromptInput";
import AgentConversation from "@/components/agent/AgentConversation";

interface Message {
  type: "user" | "ai";
  content: string | GenerateResponseOutput;
}

interface ActiveInterrupt {
  type:
    | typeof INTERRUPT_TYPES.PLAYER_SELECTION
    | typeof INTERRUPT_TYPES.SCOUTING_CONFIRMATION;
  data: PlayerSelectionInterrupt | ScoutingConfirmationInterrupt;
}

export default function AIAgentPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId] = useState(() => uuidv4());
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentNode, setCurrentNode] = useState<string | null>(null);
  const [routerOutput, setRouterOutput] = useState<RouterOutput | null>(null);
  const [activeInterrupt, setActiveInterrupt] =
    useState<ActiveInterrupt | null>(null);

  const suggestedPrompts = [
    "Who are the top Canadian scorers in CEBL?",
    "Find me guards in U SPORTS women's league with good assist-to-turnover ratios",
    "Generate a scouting report for Aaron Rhooms in USPORTS men's league",
  ];

  const processStream = async (
    userInput: string | number | boolean,
    isResume = false,
    interruptType?:
      | typeof INTERRUPT_TYPES.PLAYER_SELECTION
      | typeof INTERRUPT_TYPES.SCOUTING_CONFIRMATION
  ) => {
    setIsStreaming(true);
    setCurrentNode(null);
    setRouterOutput(null);

    try {
      for await (const event of streamChat(
        userInput,
        sessionId,
        isResume,
        interruptType
      )) {
        const { node, output } = event;

        if (node === AGENT_NODES.ROUTER) {
          const routerData = output as RouterOutput;
          setCurrentNode(node);
          setRouterOutput(routerData);
        } else if (node === AGENT_NODES.STATS_LOOKUP) {
          setCurrentNode(node);
        } else if (node === AGENT_NODES.SCOUT) {
          console.log("[SCOUT NODE]", output);
          setCurrentNode(node);
        } else if (node === AGENT_NODES.GENERATE_RESPONSE) {
          setCurrentNode(null);
          setRouterOutput(null);
          setMessages((prev) => [
            ...prev,
            {
              type: "ai" as const,
              content: output as GenerateResponseOutput,
            },
          ]);
        } else if (node === AGENT_NODES.INTERRUPT) {
          console.log("[INTERRUPT NODE]", node, output);

          // Interrupt output is an array with { value, id } structure
          const interruptData = Array.isArray(output)
            ? output[0]?.value
            : output;
          console.log("[INTERRUPT] Parsed data:", interruptData);

          if (interruptData && "type" in interruptData) {
            if (interruptData.type === INTERRUPT_TYPES.PLAYER_SELECTION) {
              console.log("[INTERRUPT] Player selection:", interruptData);
              setCurrentNode(null);
              setActiveInterrupt({
                type: INTERRUPT_TYPES.PLAYER_SELECTION,
                data: interruptData as PlayerSelectionInterrupt,
              });
              break;
            } else if (
              interruptData.type === INTERRUPT_TYPES.SCOUTING_CONFIRMATION
            ) {
              console.log("[INTERRUPT] Scouting confirmation:", interruptData);
              setCurrentNode(null);
              setActiveInterrupt({
                type: INTERRUPT_TYPES.SCOUTING_CONFIRMATION,
                data: interruptData as ScoutingConfirmationInterrupt,
              });
              break;
            }
          }
        } else if (node === AGENT_NODES.ERROR) {
          setCurrentNode(null);
          setRouterOutput(null);
          setMessages((prev) => [
            ...prev,
            {
              type: "ai",
              content: {
                node: "generate_response",
                response_type: "text_response",
                main_response:
                  typeof output === "string"
                    ? output
                    : "An error occurred. Please try again.",
              } as GenerateResponseOutput,
            },
          ]);
        } else {
          setCurrentNode(node);
        }
      }
    } catch (error) {
      console.error("Stream error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Connection error. Please try again."
      );
      setRouterOutput(null);
      setMessages((prev) => [
        ...prev,
        {
          type: "ai",
          content: {
            node: "generate_response",
            response_type: "text_response",
            main_response: "Connection error. Please try again.",
          } as GenerateResponseOutput,
        },
      ]);
    } finally {
      setIsStreaming(false);
      setCurrentNode(null);
      setRouterOutput(null);
    }
  };

  const handleSend = async (message: {
    text?: string;
    displayText?: string;
  }) => {
    const userInput = message.text?.trim();
    const displayText = message.displayText?.trim() || userInput;
    if (!userInput || !displayText || isStreaming || activeInterrupt) return;

    setMessages((prev) => [...prev, { type: "user", content: displayText }]);
    await processStream(userInput, false);
  };

  const handlePromptClick = async (prompt: string) => {
    if (isStreaming || activeInterrupt) return;
    setMessages((prev) => [...prev, { type: "user", content: prompt }]);
    await processStream(prompt, false);
  };

  const handlePlayerSelection = async (index: number) => {
    console.log("[RESUME] Player selection with index:", index);
    setActiveInterrupt(null);
    await processStream(index, true, INTERRUPT_TYPES.PLAYER_SELECTION);
  };

  const handleScoutingConfirmation = async (confirmed: boolean) => {
    console.log("[RESUME] Scouting confirmation:", confirmed);
    setActiveInterrupt(null);
    await processStream(confirmed, true, INTERRUPT_TYPES.SCOUTING_CONFIRMATION);
  };

  const handleCancelInterrupt = () => {
    console.log("[CANCEL] User cancelled interrupt");
    setActiveInterrupt(null);
    setIsStreaming(false);
    setMessages((prev) => [
      ...prev,

      {
        type: "ai",
        content: {
          node: "generate_response",
          response_type: "text_response",
          main_response: "Action cancelled. How else can I help you?",
        } as GenerateResponseOutput,
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] max-w-7xl mx-auto w-full">
      {/* Header - only show when no messages */}
      {messages.length === 0 && (
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-8 h-8 text-purple-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              AI Scouting Agent
            </h1>
          </div>
          <p className="text-muted-foreground">
            Ask questions, get insights, discover talent across all leagues
          </p>
        </div>
      )}

      {/* Chat Interface */}
      <div className="flex-1 flex flex-col min-h-0">
        <AgentConversation
          messages={messages}
          isStreaming={isStreaming}
          currentNode={currentNode}
          routerOutput={routerOutput}
          suggestedPrompts={suggestedPrompts}
          onPromptClick={handlePromptClick}
        />

        {/* Input */}
        <div className="border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 p-1 w-full">
          <AgentPromptInput
            onSubmit={handleSend}
            disabled={isStreaming || !!activeInterrupt}
            isStreaming={isStreaming}
            placeholder={
              activeInterrupt
                ? "Waiting for your response..."
                : "Ask about players, stats, or trends..."
            }
          />
        </div>
      </div>

      {/* Interrupt Modals */}
      {activeInterrupt?.type === INTERRUPT_TYPES.PLAYER_SELECTION && (
        <PlayerSelectionModal
          isOpen={true}
          message={(activeInterrupt.data as PlayerSelectionInterrupt).message}
          players={
            (activeInterrupt.data as PlayerSelectionInterrupt).search_results
          }
          onSelect={handlePlayerSelection}
          onCancel={handleCancelInterrupt}
        />
      )}

      {activeInterrupt?.type === INTERRUPT_TYPES.SCOUTING_CONFIRMATION && (
        <ScoutingConfirmationModal
          isOpen={true}
          playerName={
            (activeInterrupt.data as ScoutingConfirmationInterrupt).player_name
          }
          playerId={
            (activeInterrupt.data as ScoutingConfirmationInterrupt).player_id
          }
          league={
            (activeInterrupt.data as ScoutingConfirmationInterrupt).league
          }
          message={
            (activeInterrupt.data as ScoutingConfirmationInterrupt).message
          }
          onConfirm={() => handleScoutingConfirmation(true)}
          onCancel={() => handleScoutingConfirmation(false)}
        />
      )}
    </div>
  );
}
