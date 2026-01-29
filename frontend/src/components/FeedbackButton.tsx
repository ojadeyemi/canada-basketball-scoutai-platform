import { useState } from "react";
import { MessageSquarePlus } from "lucide-react";
import { APP_CONFIG } from "@/constants";
import { cn } from "@/lib/utils";

export function FeedbackButton() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <a
      href={APP_CONFIG.FEEDBACK_URL}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        // Positioning - fixed bottom right, desktop only
        "fixed bottom-6 right-6 z-40",
        "hidden md:flex",
        // Base styles
        "items-center gap-2",
        "bg-primary text-primary-foreground",
        "rounded-full shadow-lg",
        // Sizing and padding
        "h-12 px-4",
        // Transitions
        "transition-all duration-300 ease-out",
        // Hover effects
        "hover:shadow-xl hover:scale-105",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
      )}
      aria-label="Provide feedback"
    >
      <MessageSquarePlus className="w-5 h-5 shrink-0" />
      <span
        className={cn(
          "font-medium text-sm whitespace-nowrap overflow-hidden transition-all duration-300",
          isHovered ? "max-w-32 opacity-100" : "max-w-0 opacity-0",
        )}
      >
        Feedback
      </span>
    </a>
  );
}
