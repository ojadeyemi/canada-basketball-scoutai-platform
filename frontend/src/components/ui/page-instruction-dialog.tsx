import { useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface InstructionStep {
  icon?: React.ReactNode;
  text: string;
}

interface PageInstructionDialogProps {
  pageKey: string;
  title: string;
  description?: string;
  steps: InstructionStep[];
  icon?: React.ReactNode;
}

const STORAGE_PREFIX = "page_instruction_seen_";

export function PageInstructionDialog({
  pageKey,
  title,
  description,
  steps,
  icon,
}: PageInstructionDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const location = useLocation();

  const closeDialog = useCallback(() => {
    const dialog = dialogRef.current;
    if (dialog) {
      dialog.close();
      sessionStorage.setItem(`${STORAGE_PREFIX}${pageKey}`, "true");
    }
  }, [pageKey]);

  // Show dialog on mount and when navigating to this page
  useEffect(() => {
    const hasSeen = sessionStorage.getItem(`${STORAGE_PREFIX}${pageKey}`);
    if (!hasSeen && dialogRef.current) {
      dialogRef.current.showModal();
    }
  }, [pageKey, location.pathname]);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      closeDialog();
    }
  };

  // Close on Escape key
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (e: Event) => {
      e.preventDefault();
      closeDialog();
    };

    dialog.addEventListener("cancel", handleCancel);
    return () => dialog.removeEventListener("cancel", handleCancel);
  }, [closeDialog]);

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      className={cn(
        // Reset and base styles
        "m-0 p-0 border-0 bg-transparent",
        // Positioning
        "fixed inset-0 z-50",
        // Backdrop
        "backdrop:bg-black/60 backdrop:backdrop-blur-sm",
        // Animation
        "opacity-0 open:opacity-100 transition-opacity duration-200",
      )}
    >
      <div
        className={cn(
          // Centering wrapper
          "fixed inset-0 flex items-center justify-center p-4",
        )}
      >
        <div
          className={cn(
            // Modal container
            "bg-background border border-border rounded-xl shadow-2xl",
            // Sizing - mobile first, larger on desktop
            "w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl",
            // Max height with scroll
            "max-h-[85vh] overflow-y-auto",
            // Animation
            "scale-95 open:scale-100 transition-transform duration-200",
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-background border-b border-border px-5 py-4 md:px-8 md:py-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 md:gap-4">
                {icon && (
                  <div className="shrink-0 p-2 md:p-3 rounded-lg bg-primary/10 text-primary">
                    {icon}
                  </div>
                )}
                <div>
                  <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-foreground">
                    {title}
                  </h2>
                  {description && (
                    <p className="text-sm md:text-base text-muted-foreground mt-0.5 md:mt-1">
                      {description}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={closeDialog}
                className="shrink-0 p-1.5 md:p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                aria-label="Close instructions"
              >
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>
          </div>

          {/* Steps */}
          <div className="p-5 md:p-8 space-y-4">
            <ol className="space-y-3 md:space-y-4">
              {steps.map((step, index) => (
                <li key={index} className="flex gap-3 md:gap-4">
                  <span className="shrink-0 w-6 h-6 md:w-8 md:h-8 rounded-full bg-primary/10 text-primary text-sm md:text-base font-medium flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="text-sm md:text-base text-foreground leading-relaxed pt-0.5 md:pt-1">
                    {step.text}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-background border-t border-border px-5 py-4 md:px-8 md:py-5">
            <button
              onClick={closeDialog}
              className={cn(
                "w-full py-2.5 md:py-3 px-4 rounded-lg font-medium text-sm md:text-base",
                "bg-primary text-primary-foreground",
                "hover:bg-primary/90 transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              )}
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}
