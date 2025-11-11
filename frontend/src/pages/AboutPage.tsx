import {
  ExternalLink,
  Linkedin,
  Mail,
  Github as GithubIcon,
  BookOpen,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InteractiveGridPattern } from "@/components/ui/interactive-grid-pattern";
import { cn } from "@/lib/utils";
import { LEAGUE_LOGOS } from "@/constants/leagues";
import { APP_CONFIG } from "@/constants";

export default function AboutPage() {
  return (
    <div className="relative min-h-[calc(100vh-16rem)] w-full overflow-hidden py-12">
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
      <div className="max-w-6xl mx-auto w-full relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-gray-800 bg-clip-text text-transparent mb-4">
            About Canada Basketball AI Scouting Platform
          </h1>
          <p className="text-muted-foreground text-xl max-w-3xl mx-auto">
            An AI-powered platform for Canadian basketball talent discovery
          </p>
        </div>

        <div className="space-y-8">
          {/* About Canada Basketball */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-foreground">
                About Canada Basketball
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed text-lg">
                <a
                  href="https://www.basketball.ca/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-600 hover:text-red-700 font-semibold hover:underline transition-colors"
                >
                  Canada Basketball
                </a>{" "}
                is the National Sporting Organization for the sport of
                basketball in Canada. Canada Basketball is respected worldwide
                and recognized by the International Amateur Basketball
                Federation (FIBA) and the Government of Canada as the sole
                governing body of amateur basketball in Canada. A not-for-profit
                organization, Canada Basketball represents all basketball
                interests and provides leadership, coordination and direction in
                all areas of the sport.
              </p>
            </CardContent>
          </Card>

          {/* About This Tool */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-foreground">
                About This Tool
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed text-lg">
                Canada Basketball AI Scouting consolidates player statistics
                from four major Canadian basketball leagues (U SPORTS, CCAA,
                CEBL, and HoopQueens) into a single searchable platform. It
                features an AI agent powered by LangGraph that can answer
                natural language queries, generate detailed scouting reports,
                and provide statistical insights to help scouts, coaches, and
                analysts discover talent.
              </p>
            </CardContent>
          </Card>

          {/* Leagues */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-foreground">
                Leagues Covered
              </CardTitle>
              <CardDescription className="text-base">
                Comprehensive coverage across Canadian basketball
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <a
                  href="https://en.usports.ca/sports/mbkb/index"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group p-6 rounded-xl border-2 border-border hover:border-red-600 transition-all hover:shadow-lg bg-secondary/50"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <img
                      src={LEAGUE_LOGOS.usports}
                      alt="U SPORTS"
                      className="w-10 h-10 object-contain"
                    />
                    <h3 className="text-xl font-semibold text-foreground group-hover:text-red-600 transition-colors">
                      U SPORTS
                    </h3>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Canadian university basketball league
                  </p>
                </a>

                <a
                  href="https://www.ccaa.ca/sports/mbkb/index"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group p-6 rounded-xl border-2 border-border hover:border-red-600 transition-all hover:shadow-lg bg-secondary/50"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <img
                      src={LEAGUE_LOGOS.ccaa}
                      alt="CCAA"
                      className="w-10 h-10 object-contain"
                    />
                    <h3 className="text-xl font-semibold text-foreground group-hover:text-red-600 transition-colors">
                      CCAA
                    </h3>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Canadian Collegiate Athletic Association
                  </p>
                </a>

                <a
                  href="https://cebl.ca/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group p-6 rounded-xl border-2 border-border hover:border-red-600 transition-all hover:shadow-lg bg-secondary/50"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <img
                      src={LEAGUE_LOGOS.cebl}
                      alt="CEBL"
                      className="w-10 h-10 object-contain"
                    />
                    <h3 className="text-xl font-semibold text-foreground group-hover:text-red-600 transition-colors">
                      CEBL
                    </h3>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Canadian Elite Basketball League
                  </p>
                </a>

                <a
                  href="https://www.thehoopqueens.com/the-league"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group p-6 rounded-xl border-2 border-border hover:border-red-600 transition-all hover:shadow-lg bg-secondary/50"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <img
                      src={LEAGUE_LOGOS.hoopqueens}
                      alt="HoopQueens"
                      className="w-10 h-10 object-contain"
                    />
                    <h3 className="text-xl font-semibold text-foreground group-hover:text-red-600 transition-colors">
                      HoopQueens
                    </h3>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Women's summer league
                  </p>
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Created By */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-foreground">
                Created By
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-600 to-gray-800 flex items-center justify-center text-white font-bold text-3xl shrink-0">
                  OJ
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">
                    {APP_CONFIG.AUTHOR.NAME}
                  </p>
                  <p className="text-base text-muted-foreground">
                    Software Engineer & Computer Scientist
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-4 gap-3">
                <a
                  href={APP_CONFIG.AUTHOR.LINKEDIN}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors group border-2 border-transparent hover:border-blue-600"
                >
                  <Linkedin className="w-6 h-6 text-blue-600" />
                  <span className="font-medium">LinkedIn</span>
                  <ExternalLink className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>

                <a
                  href={APP_CONFIG.AUTHOR.GITHUB}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors group border-2 border-transparent hover:border-gray-800"
                >
                  <GithubIcon className="w-6 h-6 text-gray-800" />
                  <span className="font-medium">GitHub</span>
                  <ExternalLink className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>

                <a
                  href={APP_CONFIG.AUTHOR.WEBSITE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors group border-2 border-transparent hover:border-red-600"
                >
                  <ExternalLink className="w-6 h-6 text-red-600" />
                  <span className="font-medium">Portfolio</span>
                  <ExternalLink className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>

                <a
                  href={`mailto:${APP_CONFIG.AUTHOR.EMAIL}`}
                  className="flex items-center gap-3 p-4 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors group border-2 border-transparent hover:border-gray-600"
                >
                  <Mail className="w-6 h-6 text-gray-600" />
                  <span className="font-medium">Email</span>
                  <ExternalLink className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Technical Stack */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-foreground">
                Technical Stack
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    Backend
                  </h3>
                  <ul className="space-y-2 text-muted-foreground text-base">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-600" />
                      FastAPI + Python
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-600" />
                      LangGraph AI Agent
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-600" />
                      SQLite + PostgreSQL
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    Frontend
                  </h3>
                  <ul className="space-y-2 text-muted-foreground text-base">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-600" />
                      React + TypeScript
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-600" />
                      Vite + TailwindCSS
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-600" />
                      shadcn/ui + Recharts
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    Infrastructure
                  </h3>
                  <ul className="space-y-2 text-muted-foreground text-base">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-600" />
                      Cohere + Gemini
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-600" />
                      Google Cloud Platform
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-600" />
                      Docker + GitHub Actions
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t">
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  Developer Resources
                </h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href="https://api.scout.northscore.ca/redoc"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 p-4 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors group border-2 border-transparent hover:border-red-600"
                  >
                    <BookOpen className="w-6 h-6 text-red-600" />
                    <span className="font-medium">API Documentation</span>
                    <ExternalLink className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                  <a
                    href="https://github.com/ojadeyemi/canada-basketball-scoutai-platform"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 p-4 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors group border-2 border-transparent hover:border-gray-800"
                  >
                    <GithubIcon className="w-6 h-6 text-gray-800" />
                    <span className="font-medium">Source Code</span>
                    <ExternalLink className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
