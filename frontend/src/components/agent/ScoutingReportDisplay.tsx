import { useState } from "react";
import {
  Download,
  FileText,
  TrendingUp,
  Target,
  Shield,
  Award,
} from "lucide-react";
import type { ScoutingReport } from "@/types/agent";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface ScoutingReportDisplayProps {
  scoutingReport: ScoutingReport;
  pdfUrl: string | null;
}

export default function ScoutingReportDisplay({
  scoutingReport,
  pdfUrl,
}: ScoutingReportDisplayProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const {
    player_profile,
    archetype,
    archetype_description,
    strengths,
    weaknesses,
    trajectory_summary,
    national_team_assessments,
    final_recommendation,
  } = scoutingReport;

  return (
    <div className="space-y-3 w-full">
      {/* PDF exists: Show download button */}
      {pdfUrl && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(pdfUrl, "_blank")}
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          Download PDF Report
        </Button>
      )}

      {/* PDF not ready: Show preview button */}
      {!pdfUrl && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDialogOpen(true)}
            className="gap-2"
          >
            <FileText className="w-4 h-4" />
            Preview Report
          </Button>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl">
                  {player_profile.name}
                </DialogTitle>
                <DialogDescription>
                  {player_profile.position && `${player_profile.position} • `}
                  {player_profile.current_team} ({player_profile.league})
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                {/* Archetype */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold">Player Archetype</h3>
                  </div>
                  <Badge variant="secondary" className="mb-2">
                    {archetype}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    {archetype_description}
                  </p>
                </div>

                {/* Bio Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  {player_profile.height && (
                    <div>
                      <span className="text-muted-foreground">Height:</span>
                      <span className="ml-2 font-medium">
                        {player_profile.height}
                      </span>
                    </div>
                  )}
                  {player_profile.weight && (
                    <div>
                      <span className="text-muted-foreground">Weight:</span>
                      <span className="ml-2 font-medium">
                        {player_profile.weight}
                      </span>
                    </div>
                  )}
                  {player_profile.age && (
                    <div>
                      <span className="text-muted-foreground">Age:</span>
                      <span className="ml-2 font-medium">
                        {player_profile.age}
                      </span>
                    </div>
                  )}
                  {player_profile.jersey_number && (
                    <div>
                      <span className="text-muted-foreground">Number:</span>
                      <span className="ml-2 font-medium">
                        #{player_profile.jersey_number}
                      </span>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Strengths & Weaknesses */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <h3 className="font-semibold">Strengths</h3>
                    </div>
                    <div className="space-y-3">
                      {strengths.map((strength, idx) => (
                        <div key={idx} className="space-y-1">
                          <h4 className="font-semibold text-sm">
                            {strength.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {strength.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Shield className="w-5 h-5 text-orange-600" />
                      <h3 className="font-semibold">Areas for Development</h3>
                    </div>
                    <div className="space-y-3">
                      {weaknesses.map((weakness, idx) => (
                        <div key={idx} className="space-y-1">
                          <h4 className="font-semibold text-sm">
                            {weakness.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {weakness.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Trajectory Summary */}
                <div>
                  <h3 className="font-semibold mb-2">Development Trajectory</h3>
                  <p className="text-sm text-muted-foreground">
                    {trajectory_summary}
                  </p>
                </div>

                <Separator />

                {/* National Team Assessments */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">National Team Fit</h3>
                  </div>
                  <div className="space-y-4">
                    {national_team_assessments.map((assessment, idx) => (
                      <div key={idx}>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-sm">
                            {assessment.team_type}
                          </h4>
                          <Badge
                            variant={
                              assessment.fit_rating === "Strong Fit" ||
                              assessment.fit_rating === "Good Fit"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {assessment.fit_rating}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {assessment.rationale}
                        </p>
                        {idx < national_team_assessments.length - 1 && (
                          <Separator className="mt-3" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Final Recommendation */}
                <div className="border border-primary/50 rounded-lg p-4 bg-gradient-to-br from-background to-primary/5">
                  <h3 className="font-semibold text-lg mb-2">
                    {final_recommendation.verdict_title}
                  </h3>
                  <div className="flex gap-2 mb-3">
                    <Badge variant="outline">
                      Domestic: {final_recommendation.overall_grade_domestic}
                    </Badge>
                    <Badge variant="outline">
                      National: {final_recommendation.overall_grade_national}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {final_recommendation.summary}
                  </p>
                  <div>
                    <h4 className="font-semibold text-sm mb-2">
                      Best Use Cases:
                    </h4>
                    <ul className="list-disc list-inside space-y-1">
                      {final_recommendation.best_use_cases.map(
                        (useCase, idx) => (
                          <li
                            key={idx}
                            className="text-sm text-muted-foreground"
                          >
                            {useCase}
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                </div>

                {/* Download PDF Button */}
                {pdfUrl && (
                  <div className="flex justify-end pt-4">
                    <Button
                      onClick={() => window.open(pdfUrl, "_blank")}
                      className="gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download PDF
                    </Button>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
