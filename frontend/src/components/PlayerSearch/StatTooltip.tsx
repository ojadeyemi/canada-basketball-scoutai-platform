import { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { STAT_DESCRIPTIONS } from "../../constants/statDescriptions";
import { STAT_KEY_MAPPING } from "../../constants/statKeyMapping";

interface StatTooltipProps {
  /**
   * The stat label/abbreviation (e.g., "PPG", "FG%", "Double-Double Rate")
   */
  statLabel: string;
  /**
   * The content to wrap with tooltip (typically the stat display element)
   */
  children: ReactNode;
  /**
   * Optional: Override stat key if it doesn't match mapping
   */
  statKey?: string;
  /**
   * Whether to show on mobile (default: false, only shows on md+ screens)
   */
  showOnMobile?: boolean;
}

/**
 * Reusable tooltip wrapper for basketball statistics.
 * Pulls full name and description from STAT_DESCRIPTIONS.
 * Desktop-only by default (hidden on mobile).
 */
export const StatTooltip = ({
  statLabel,
  children,
  statKey,
  showOnMobile = false,
}: StatTooltipProps) => {
  // Look up the stat key from mapping
  const lookupKey = statKey || STAT_KEY_MAPPING[statLabel];
  const statInfo = lookupKey ? STAT_DESCRIPTIONS[lookupKey] : null;

  // If no stat info found, render children without tooltip
  if (!statInfo) {
    return <>{children}</>;
  }

  const fullName = statInfo.name;
  const description = statInfo.description;
  const formula = statInfo.formula;

  // Build tooltip content
  const tooltipContent = (
    <div className="max-w-xs space-y-1.5">
      <div className="font-semibold text-sm">{fullName}</div>
      <div className="text-xs opacity-90 leading-relaxed">{description}</div>
      {formula && (
        <div className="text-xs opacity-80 mt-2 pt-2 border-t border-slate-600/30 font-mono bg-slate-800/40 px-2 py-1 rounded">
          {formula}
        </div>
      )}
    </div>
  );

  return (
    <Tooltip>
      <TooltipTrigger
        asChild
        className={showOnMobile ? "" : "hidden md:inline-flex"}
      >
        <span
          className="cursor-help"
          aria-label={`${fullName}: ${description}`}
        >
          {children}
        </span>
      </TooltipTrigger>
      {/* Only render tooltip content on desktop */}
      <TooltipContent
        side="top"
        className={showOnMobile ? "" : "hidden md:block"}
      >
        {tooltipContent}
      </TooltipContent>
      {/* Fallback: No tooltip on mobile, but still has aria-label */}
      {!showOnMobile && (
        <span className="md:hidden" aria-label={`${fullName}: ${description}`}>
          {children}
        </span>
      )}
    </Tooltip>
  );
};
