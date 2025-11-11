import { API_BASE_URL } from "@/config/api";

interface PasswordVerifyResponse {
  success: boolean;
  message: string;
}

/**
 * Verify agent access password
 */
export async function verifyPassword(password: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      return false;
    }

    const data: PasswordVerifyResponse = await response.json();
    return data.success;
  } catch (error) {
    console.error("Password verification failed:", error);
    return false;
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return localStorage.getItem("agent_authenticated") === "true";
}

/**
 * Save authentication state
 */
export function setAuthenticated(value: boolean): void {
  if (value) {
    localStorage.setItem("agent_authenticated", "true");
  } else {
    localStorage.removeItem("agent_authenticated");
  }
}

/**
 * Clear authentication state (logout)
 */
export function logout(): void {
  setAuthenticated(false);
}
