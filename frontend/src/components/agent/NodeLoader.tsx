import { Loader } from "@/components/ai-elements/loader";
import { cn } from "@/lib/utils";

interface NodeLoaderProps {
  node:
    | "router"
    | "stats_lookup"
    | "confirm_scouting_report"
    | "scout"
    | "generate_response";
  className?: string;
}

const NODE_LABELS: Record<NodeLoaderProps["node"], string> = {
  router: "Analyzing your request",
  stats_lookup: "Querying player statistics",
  confirm_scouting_report: "Generating scouting report",
  scout: "Generating scouting report",
  generate_response: "Preparing response",
};

export default function NodeLoader({ node, className }: NodeLoaderProps) {
  return (
    <div
      className={cn("flex items-center gap-3 text-muted-foreground", className)}
    >
      <Loader size={16} />
      <span className="text-sm font-medium">{NODE_LABELS[node]}</span>
    </div>
  );
}
