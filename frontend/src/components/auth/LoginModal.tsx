import { useState, type FormEvent } from "react";
import { verifyPassword } from "@/services/authService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Lock } from "lucide-react";

interface LoginModalProps {
  onSuccess: () => void;
}

export function LoginModal({ onSuccess }: LoginModalProps) {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const isValid = await verifyPassword(password);

      if (isValid) {
        onSuccess();
      } else {
        setError("Invalid password. Please try again.");
        setPassword("");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md space-y-6 rounded-lg border border-border bg-card p-8 shadow-2xl">
        <div className="space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Agent Access
          </h2>
          <p className="text-sm text-muted-foreground">
            Enter password to access the AI Scouting Agent
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              autoFocus
              className="h-11"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isLoading || !password.trim()}
          >
            {isLoading ? "Verifying..." : "Access Agent"}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          Demo for Canada Basketball
        </p>
      </div>
    </div>
  );
}
