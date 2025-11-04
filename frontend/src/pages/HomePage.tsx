import { Link } from "react-router-dom";
import { Search, Bot } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InteractiveGridPattern } from "@/components/ui/interactive-grid-pattern";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { APP_CONFIG } from "@/constants";
import { useOnboarding } from "@/hooks/useOnboarding";

export default function HomePage() {
  useOnboarding();
  return (
    <div className="relative min-h-[calc(100vh-16rem)] w-full overflow-hidden flex items-center justify-center">
      {/* Background Grid Pattern */}
      <InteractiveGridPattern
        className={cn(
          "[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]",
          "opacity-30",
        )}
        width={20}
        height={20}
        squares={[100, 100]}
        squaresClassName="hover:fill-red-600/40 fill-red-600/10 stroke-red-600/20"
      />
      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-red-600 to-gray-800 bg-clip-text text-transparent mb-2">
            Canada Basketball AI Scouting Platfrom
          </h1>
          <Badge
            variant="outline"
            className="text-xs px-2 py-0.5 mb-4 bg-yellow-50 border-yellow-300 text-yellow-700"
          >
            {APP_CONFIG.BETA_BADGE_TEXT}
          </Badge>
          <p className="text-muted-foreground text-xl max-w-3xl mx-auto">
            Discover talent across U SPORTS, CCAA, HoopQueens, and CEBL
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Player Search Card */}
          <Link to="/player-search" className="block group">
            <Card className="h-full transition-all hover:shadow-lg hover:scale-[1.02] border-2 hover:border-red-600">
              <CardHeader className="space-y-4">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center group-hover:bg-red-600 transition-colors">
                  <Search className="w-8 h-8 text-red-600 group-hover:text-white transition-colors" />
                </div>
                <CardTitle className="text-2xl">Player Search</CardTitle>
                <CardDescription className="text-base">
                  Search and explore player statistics with detailed analytics
                  and visualizations across all Canadian leagues
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                      Fuzzy search across 4 leagues
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                      15+ interactive charts
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                      Season-by-season breakdowns
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* AI Agent Card */}
          <Link to="/agent" className="block group">
            <Card className="h-full transition-all hover:shadow-lg hover:scale-[1.02] border-2 hover:border-red-600">
              <CardHeader className="space-y-4">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center group-hover:bg-red-600 transition-colors">
                  <Bot className="w-8 h-8 text-red-600 group-hover:text-white transition-colors" />
                </div>
                <CardTitle className="text-2xl">AI Scouting Agent</CardTitle>
                <CardDescription className="text-base">
                  Ask questions in natural language and get insights with
                  AI-powered analysis and scouting reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                      Natural language queries
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                      AI-generated scouting reports
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                      Statistical comparisons
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
