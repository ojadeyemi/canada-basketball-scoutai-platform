import { FileCheck, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LEAGUE_LOGOS } from "@/constants/leagues";

interface ScoutingConfirmationModalProps {
  isOpen: boolean;
  playerName: string;
  playerId: string;
  league: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ScoutingConfirmationModal({
  isOpen,
  playerName,
  playerId,
  league,
  message,
  onConfirm,
  onCancel,
}: ScoutingConfirmationModalProps) {
  const leagueKey = league.toLowerCase();
  const leagueLogo = LEAGUE_LOGOS[leagueKey as keyof typeof LEAGUE_LOGOS];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-primary" />
            Confirm Scouting Report
          </DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>

        <div className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl p-6 space-y-4 border border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Player
            </span>
            <span className="font-semibold text-foreground">{playerName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              League
            </span>
            <div className="flex items-center gap-2">
              {leagueLogo && (
                <img
                  src={leagueLogo}
                  alt={league}
                  className="w-6 h-6 object-contain"
                />
              )}
              <Badge variant="secondary" className="font-semibold">
                {league}
              </Badge>
            </div>
          </div>
          <div className="flex items-start justify-between gap-4">
            <span className="text-sm font-medium text-muted-foreground shrink-0">
              Player ID
            </span>
            <span className="text-xs font-mono text-muted-foreground bg-background px-2 py-1 rounded break-all text-right">
              {playerId}
            </span>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={onCancel} className="gap-2">
            <X className="w-4 h-4" />
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="gap-2 bg-red-900 hover:bg-red-800 text-white"
          >
            <FileCheck className="w-4 h-4" />
            Generate Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
