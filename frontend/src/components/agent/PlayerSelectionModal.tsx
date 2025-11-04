import { Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PlayerOption {
  player_id: string;
  full_name: string;
  league: string;
  teams: string[];
  positions: string[];
  seasons: string[];
  nationality: string | null;
  age: number | null;
  photo_url: string | null;
}

interface PlayerSelectionModalProps {
  isOpen: boolean;
  message: string;
  players: PlayerOption[];
  onSelect: (index: number) => void;
  onCancel: () => void;
}

export default function PlayerSelectionModal({
  isOpen,
  message,
  players,
  onSelect,
  onCancel,
}: PlayerSelectionModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Select Player
          </DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>

        <div className="space-y-2 mt-4">
          {players.map((player, index) => (
            <button
              key={index}
              onClick={() => onSelect(index)}
              className="w-full text-left p-4 rounded-lg border border-border hover:border-primary hover:bg-accent transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <h3 className="font-semibold group-hover:text-primary transition-colors">
                    {player.full_name}
                  </h3>
                  <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                    {player.teams.length > 0 && (
                      <span>{player.teams.join(", ")}</span>
                    )}
                    {player.positions.length > 0 && (
                      <span>• {player.positions.join("/")}</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant="secondary">{player.league}</Badge>
                  {player.age && (
                    <span className="text-xs text-muted-foreground">
                      Age {player.age}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
