# Canada Basketball ScoutAI - Frontend

React 18 + TypeScript frontend with AI chat and interactive player search.

---

## Features

- **AI Chat Interface** – Natural language queries with real-time streaming
- **Player Search** – Fuzzy search across 25,000+ players
- **Interactive Charts** – Recharts visualizations (bar, line, scatter, pie)
- **Player Modals** – 4-tab layout (overview, stats, charts, scouting)
- **PDF Reports** – One-click scouting report download

---

## Quick Start

### Local Development (Recommended)

```bash
pnpm install
pnpm dev
```

**Access:** [http://localhost:5173](http://localhost:5173)

### Docker (Production)

```bash
docker build -t scoutai-frontend .
docker run -p 80:80 scoutai-frontend
```

**Access:** [http://localhost](http://localhost) (served via nginx)

---

## Environment Variables

Create `.env`:

```bash
VITE_API_BASE_URL=http://localhost:8080  # Local backend
# VITE_API_BASE_URL=https://api.example.com  # Production backend
```

---

## Commands

```bash
pnpm dev       # Dev server (http://localhost:5173)
pnpm build     # Production build
pnpm preview   # Preview build locally
pnpm lint      # Lint with ESLint
pnpm format    # Format with Prettier
```

---

## Project Structure

```
src/
├── components/
│   ├── PlayerSearch/   # Search UI + charts
│   ├── agent/          # AI chat components
│   ├── ai-elements/    # Reusable AI UI
│   └── ui/             # shadcn/ui components
├── pages/              # 5 routes
│   ├── HomePage.tsx
│   ├── PlayerSearchPage.tsx
│   ├── AIAgentPage.tsx
│   ├── AboutPage.tsx
│   └── FAQPage.tsx
├── services/api.ts     # API client
├── hooks/              # Custom React hooks
└── types/              # TypeScript definitions
```

---

## Key Tech

| Tech                 | Purpose                 |
| -------------------- | ----------------------- |
| **React 18**         | UI framework            |
| **TypeScript 5.9**   | Type safety             |
| **Vite 5.4**         | Fast dev server + build |
| **pnpm**             | Package manager         |
| **TanStack Query**   | API state management    |
| **Recharts 2.15**    | Chart library           |
| **Tailwind CSS 3.4** | Styling                 |
| **shadcn/ui**        | Component library       |
| **React Router 6**   | Client-side routing     |

---

## Deployment

### Vercel (Recommended)

```bash
npm i -g vercel && vercel --prod
```

### Docker + Google Cloud Run

```bash
docker build -t gcr.io/project-id/frontend .
docker push gcr.io/project-id/frontend
gcloud run deploy frontend --image gcr.io/project-id/frontend --allow-unauthenticated
```

---

## Troubleshooting

| Issue                  | Solution                                          |
| ---------------------- | ------------------------------------------------- |
| Dev server won't start | Run `pnpm install`, check Node.js 18+             |
| API requests fail      | Check `VITE_API_BASE_URL` in `.env`, backend CORS |
| Charts not rendering   | Clear cache, check browser console                |
| Build fails            | `rm -rf node_modules && pnpm install`             |

---

## License

MIT
