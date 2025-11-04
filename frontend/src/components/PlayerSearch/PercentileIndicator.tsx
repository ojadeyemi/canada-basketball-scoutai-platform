import { getPercentileBgClass, formatPercentile } from "@/utils/playerHelpers";
import { cn } from "@/lib/utils";

interface PercentileIndicatorProps {
  percentile: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-5 w-5 text-[10px]",
  md: "h-6 w-6 text-xs",
  lg: "h-8 w-8 text-sm",
};

export const PercentileIndicator = ({
  percentile,
  showLabel = true,
  size = "md",
  className,
}: PercentileIndicatorProps) => {
  const bgClass = getPercentileBgClass(percentile);

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div
        className={cn(
          "flex items-center justify-center rounded-full font-semibold text-white",
          sizeClasses[size],
          bgClass,
        )}
      >
        {Math.round(percentile)}
      </div>
      {showLabel && (
        <span className="text-xs text-muted-foreground">
          {formatPercentile(percentile)}
        </span>
      )}
    </div>
  );
};
