import { Sparkles } from "lucide-react";
import type { GenerateResponseOutput } from "@/types/agent";
import QueryResultDisplay from "./QueryResult/QueryResultDisplay";
import ScoutingReportDisplay from "./ScoutingReportDisplay";

interface AIMessageProps {
  output: GenerateResponseOutput | { response: GenerateResponseOutput };
}

export default function AIMessage({ output }: AIMessageProps) {
  // Handle nested response structure from backend
  const actualOutput: GenerateResponseOutput =
    "response" in output ? output.response : output;

  return (
    <div className="flex gap-3 w-full py-3 max-w-full">
      {/* Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center ring-1 ring-border">
        <Sparkles className="w-4 h-4 text-white" />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col gap-3 text-foreground min-w-0 overflow-x-hidden">
        {/* Main Response Text */}
        {actualOutput.main_response && (
          <div className="text-sm whitespace-pre-wrap leading-relaxed break-words">
            {actualOutput.main_response}
          </div>
        )}

        {/* Response Type Specific Rendering */}
        {actualOutput.response_type === "query_result" &&
          actualOutput.query_result && (
            <QueryResultDisplay queryResult={actualOutput.query_result} />
          )}

        {actualOutput.response_type === "scouting_report_plan" &&
          actualOutput.scouting_report && (
            <ScoutingReportDisplay
              scoutingReport={actualOutput.scouting_report}
              pdfUrl={actualOutput.pdf_url || null}
            />
          )}
      </div>
    </div>
  );
}
