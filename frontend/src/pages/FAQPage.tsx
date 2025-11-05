import { HelpCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { InteractiveGridPattern } from "@/components/ui/interactive-grid-pattern";
import { cn } from "@/lib/utils";

export default function FAQPage() {
  const faqs = [
    {
      question: "What leagues does this platform cover?",
      answer:
        "Canada Basketball AI Scouting Platform covers four major Canadian basketball leagues: U SPORTS (university), CCAA (college), CEBL (professional men's league), and HoopQueens (professional women's summer league).",
    },
    {
      question: "How does the AI Scouting Agent work?",
      answer:
        "The AI Scouting Agent uses LangGraph and large language models to understand natural language queries about players and statistics. It can query our databases, generate insights, create visualizations, and produce comprehensive scouting reports in PDF format.",
    },
    {
      question: "Can I search for players across all leagues at once?",
      answer:
        "Yes! The Player Search tool uses fuzzy search technology that works across all four leagues simultaneously. You can also filter by specific leagues if you want to narrow your search.",
    },
    {
      question: "What kind of statistics are available?",
      answer:
        "We provide comprehensive statistics including points, rebounds, assists, shooting percentages, advanced metrics, biographical information, and season-by-season breakdowns. The specific stats vary by league based on what's publicly available.",
    },
    {
      question: "How do I generate a scouting report?",
      answer:
        "You can request a scouting report through the AI Agent by asking something like 'Generate a scouting report for [player name]'. The agent will confirm the player details and generate a comprehensive PDF report with statistics, trends, and analysis.",
    },
    {
      question: "Is the data updated in real-time?",
      answer:
        "Data is sourced from official league databases and updated periodically at the end of each seasons.",
    },
    {
      question: "Can I compare players across different leagues?",
      answer:
        "Yes! The AI Agent can handle comparison queries like 'Compare the top scorers in CEBL vs U SPORTS' or statistical comparisons between specific players from different leagues.",
    },
    {
      question: "Who built this platform?",
      answer:
        "This platform was created by OJ Adeyemi, a Software Engineer and Data Scientist passionate about basketball analytics and AI applications in sports. Check out the About page for more details.",
    },
    {
      question: "Is this tool affiliated with Canada Basketball?",
      answer:
        "No, this is an independent project created to help scouts, coaches, and analysts discover Canadian basketball talent. Canada Basketball is the official governing body mentioned for informational purposes only.",
    },
    {
      question: "Can I export or download player statistics?",
      answer:
        "Currently, you can generate and download PDF scouting reports through the AI Agent. Additional export features for raw data may be added in future updates.",
    },
  ];

  return (
    <div className="relative min-h-[calc(100vh-16rem)] w-full overflow-hidden py-12">
      {/* Background Grid Pattern */}
      <InteractiveGridPattern
        className={cn(
          "[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]",
        )}
        width={20}
        height={20}
        squares={[100, 100]}
        squaresClassName="hover:fill-red-600/40 fill-red-600/10 stroke-red-600/20"
      />
      <div className="max-w-5xl mx-auto w-full relative z-10">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-3">
            <HelpCircle className="w-10 h-10 text-blue-600" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-red-600 bg-clip-text text-transparent">
              Frequently Asked Questions
            </h1>
          </div>
          <p className="text-muted-foreground text-xl max-w-3xl mx-auto">
            Everything you need to know about Canada Basketball AI Scouting
            Platform
          </p>
        </div>

        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-foreground">
              Common Questions
            </CardTitle>
            <CardDescription className="text-base">
              Find answers to the most frequently asked questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left text-lg font-semibold hover:text-red-600 transition-colors">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Card className="border-2 bg-secondary/30">
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-2 text-foreground">
                Still have questions?
              </h3>
              <p className="text-muted-foreground mb-4">
                Feel free to reach out for more information
              </p>
              <a
                href="mailto:ojieadeyemi@gmail.com"
                className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
              >
                Contact Us
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
