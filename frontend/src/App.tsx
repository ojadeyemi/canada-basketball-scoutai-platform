import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import CardNav from "./components/CardNav";
import type { CardNavItem } from "./components/CardNav";
import ErrorBoundary from "./components/ErrorBoundary";
import Footer from "./components/Footer";
import { FeedbackButton } from "./components/FeedbackButton";
import logo from "./assets/logo.svg";
import { Toaster } from "@/components/ui/sonner";
import { APP_CONFIG } from "./constants";
import { warmupBackend } from "./services/api";

const HomePage = lazy(() => import("./pages/HomePage"));
const PlayerSearchPage = lazy(() => import("./pages/PlayerSearchPage"));
const AIAgentPage = lazy(() => import("./pages/AIAgentPage"));
const DataExplorerPage = lazy(() => import("./pages/DataExplorerPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const FAQPage = lazy(() => import("./pages/FAQPage"));
function App() {
  useEffect(() => {
    warmupBackend();
  }, []);
  const navItems: CardNavItem[] = [
    {
      label: "Tools",
      bgColor: "#BA0C2F",
      textColor: "#fff",
      links: [
        {
          label: "Player Search",
          href: "/player-search",
          ariaLabel: "Search for players",
        },
        {
          label: "AI Agent",
          href: "/agent",
          ariaLabel: "Chat with AI scouting agent",
        },
        {
          label: "Data Explorer",
          href: "/data-explorer",
          ariaLabel: "Explore league databases",
        },
      ],
    },
    {
      label: "About",
      bgColor: "#8B0000",
      textColor: "#fff",
      links: [
        {
          label: "About This Tool",
          href: "/about",
          ariaLabel: "Learn about this tool",
        },
        { label: "FAQ", href: "/faq", ariaLabel: "Frequently asked questions" },
      ],
    },
    {
      label: "Contact",
      bgColor: "#4A4A4A",
      textColor: "#fff",
      links: [
        {
          label: "Feedback",
          href: APP_CONFIG.FEEDBACK_URL,
          ariaLabel: "Submit feedback",
        },
        {
          label: "LinkedIn",
          href: APP_CONFIG.AUTHOR.LINKEDIN,
          ariaLabel: "Connect on LinkedIn",
        },
        {
          label: "Email",
          href: `mailto:${APP_CONFIG.AUTHOR.EMAIL}`,
          ariaLabel: "Send an email",
        },
      ],
    },
  ];

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div className="min-h-screen bg-background flex flex-col relative">
          <CardNav
            logo={logo}
            logoAlt="Canada Basketball Logo"
            items={navItems}
            baseColor="#ffffff"
            menuColor="#000000"
            buttonBgColor="#BA0C2F"
            buttonTextColor="#ffffff"
            ease="power3.out"
          />

          <main className="px-4 py-8 flex-grow mt-20">
            <Suspense
              fallback={
                <div className="flex justify-center items-center min-h-[50vh]">
                  Loading...
                </div>
              }
            >
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/player-search" element={<PlayerSearchPage />} />
                <Route path="/agent" element={<AIAgentPage />} />
                <Route path="/data-explorer" element={<DataExplorerPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/faq" element={<FAQPage />} />
              </Routes>
            </Suspense>
          </main>

          <Footer />
        </div>
        <FeedbackButton />
        <Toaster
          position="top-right"
          toastOptions={{ className: "z-50" }}
          offset="80px"
          expand
        />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
