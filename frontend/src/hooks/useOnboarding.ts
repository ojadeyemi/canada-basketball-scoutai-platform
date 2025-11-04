import { useEffect } from "react";
import { toast } from "sonner";
import { APP_CONFIG } from "@/constants";

export function useOnboarding() {
  useEffect(() => {
    // Welcome toast - show once per session
    const hasShownWelcome = sessionStorage.getItem(
      APP_CONFIG.WELCOME_TOAST_STORAGE_KEY,
    );

    if (!hasShownWelcome) {
      // Show welcome toast after a short delay
      const welcomeTimer = setTimeout(() => {
        toast("Welcome! 👋", {
          action: {
            label: "Give Feedback",
            onClick: () => window.open(APP_CONFIG.FEEDBACK_URL, "_blank"),
          },
          duration: 8000,
        });
        sessionStorage.setItem(APP_CONFIG.WELCOME_TOAST_STORAGE_KEY, "true");
      }, 2000);

      // Periodic feedback toast
      const feedbackInterval = setInterval(() => {
        toast("Enjoying the tool?", {
          action: {
            label: "Give Feedback",
            onClick: () => window.open(APP_CONFIG.FEEDBACK_URL, "_blank"),
          },
          duration: 6000,
        });
      }, APP_CONFIG.FEEDBACK_TOAST_INTERVAL);

      return () => {
        clearTimeout(welcomeTimer);
        clearInterval(feedbackInterval);
      };
    } else {
      // Still show periodic feedback even if welcome was shown
      const feedbackInterval = setInterval(() => {
        toast("Enjoying the tool?", {
          action: {
            label: "Give Feedback",
            onClick: () => window.open(APP_CONFIG.FEEDBACK_URL, "_blank"),
          },
          duration: 60000,
        });
      }, APP_CONFIG.FEEDBACK_TOAST_INTERVAL);

      return () => {
        clearInterval(feedbackInterval);
      };
    }
  }, []);
}
