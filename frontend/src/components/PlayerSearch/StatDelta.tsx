import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { formatDelta, getDeltaColor } from "@/utils/playerHelpers";
import { cn } from "@/lib/utils";

interface StatDeltaProps {
  label: string;
  delta: number | undefined;
  sampleSize?: number;
  className?: string;
}

export const StatDelta = ({
  label,
  delta,
  sampleSize,
  className,
}: StatDeltaProps) => {
  if (delta === undefined || delta === null) {
    return null;
  }

  const Icon = delta > 0 ? ArrowUp : delta < 0 ? ArrowDown : Minus;

  const colorClass = getDeltaColor(delta);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-sm text-muted-foreground">{label}:</span>
      <div className="flex items-center gap-1">
        <Icon className={cn("h-4 w-4", colorClass)} />
        <span className={cn("font-semibold", colorClass)}>
          {formatDelta(delta)}
        </span>
      </div>
      {sampleSize !== undefined && sampleSize > 0 && (
        <span className="text-xs text-muted-foreground">(n={sampleSize})</span>
      )}
    </div>
  );
};
