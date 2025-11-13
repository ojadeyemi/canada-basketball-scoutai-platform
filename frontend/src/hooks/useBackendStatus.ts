import { useState, useEffect } from "react";
import { warmupBackend } from "@/services/api";

type BackendStatus = "loading" | "ready" | "hidden";

export function useBackendStatus(): BackendStatus {
  const [status, setStatus] = useState<BackendStatus>("loading");

  useEffect(() => {
    let isMounted = true;

    const checkBackend = async () => {
      const isReady = await warmupBackend();

      if (isMounted) {
        if (isReady) {
          setStatus("ready");
          // Hide after 3 seconds
          setTimeout(() => {
            if (isMounted) setStatus("hidden");
          }, 3000);
        } else {
          // Retry after 30 seconds
          setTimeout(() => {
            if (isMounted) checkBackend();
          }, 30000);
        }
      }
    };

    checkBackend();

    return () => {
      isMounted = false;
    };
  }, []);

  return status;
}
