import { APP_CONFIG } from "@/constants";

export default function Footer() {
  return (
    <footer className="bg-red-700 text-white text-center py-2 relative z-0">
      <div className="container mx-auto px-4 text-sm flex items-center justify-center gap-3">
        <span className="text-xs bg-yellow-500 text-black px-2 py-0.5 rounded font-semibold">
          RESEARCH PREVIEW
        </span>
        <span>
          © 2025 Made by{" "}
          <a
            href={APP_CONFIG.AUTHOR.WEBSITE}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-200 hover:text-blue-300 transition-colors"
          >
            {APP_CONFIG.AUTHOR.NAME}
          </a>
        </span>
      </div>
    </footer>
  );
}
