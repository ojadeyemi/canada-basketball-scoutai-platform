# Canada Basketball ScoutAI - Frontend

React + TypeScript frontend with natural language AI chat and interactive player search.

---

## Features

- **AI Chat Interface**: Natural language queries with real-time NDJSON streaming
- **Player Search**: Fuzzy search across 25,000+ players with autocomplete
- **15+ Interactive Charts**: Recharts visualizations (bar, line, scatter, pie)
- **Player Detail Modals**: 4-tab layout (overview, stats, charts, scouting)
- **PDF Download**: One-click scouting report generation

---

## Quick Start

### Option 1: Docker (Production)

```bash
# Build
docker build -t scoutai-frontend .

# Run
docker run -p 3000:3000 scoutai-frontend
```

Access: http://localhost:3000

### Option 2: Local Development

```bash
# Install dependencies
pnpm install

# Run dev server
pnpm dev
```

Access: http://localhost:5173

---

## Environment Variables

Create `.env` file:

```bash
VITE_API_BASE_URL=http://localhost:8000
```

For production:

```bash
VITE_API_BASE_URL=https://your-api.run.app
```

---

## Development

### Available Commands

```bash
# Install dependencies
pnpm install

# Run dev server (hot reload)
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Lint code
pnpm lint

# Format code
pnpm format
```

### Project Structure

```
src/
├── components/          # UI components
│   ├── PlayerSearch/   # Search + charts
│   ├── AIAgent/        # Chat interface
│   └── ui/             # shadcn/ui components
├── pages/              # Route pages
│   ├── HomePage.tsx
│   └── AIAgentPage.tsx
├── services/           # API client
│   └── api.ts
├── hooks/              # React hooks
└── types/              # TypeScript types
```

---

## Key Features Explained

### 1. AI Chat Interface

Located in `src/pages/AIAgentPage.tsx`

- NDJSON streaming parser
- Real-time status updates
- Chart rendering from JSON
- Session persistence via `session_id`

**Example Query:**
```
"Top 5 CEBL scorers in 2024 with PER above 20"
```

**Response Format:**
```json
{"type": "status", "content": "Processing query..."}
{"type": "chart", "data": {...}, "chartType": "bar"}
{"type": "text", "content": "Xavier Moon leads..."}
{"type": "done"}
```

### 2. Player Search

Located in `src/pages/HomePage.tsx`

- Debounced search (300ms delay)
- Fuzzy matching (typo-tolerant)
- League filtering (U SPORTS, CCAA, CEBL, HoopQueens)
- Detailed player modals with 4 tabs

### 3. Interactive Charts

Located in `src/components/PlayerSearch/charts/`

- **ScoringChart.tsx** - PPG trends
- **ShootingChart.tsx** - FG%, 3PT%, FT%
- **AdvancedStatsChart.tsx** - PER, TS%, USG%
- **DefensiveChart.tsx** - Steals, blocks, defensive rating

Built with Recharts 2.15+ (responsive, interactive)

---

## Docker Setup

### Multi-Stage Build

The Dockerfile uses a two-stage build:

1. **Builder stage**: Installs pnpm, builds production bundle
2. **Nginx stage**: Serves static files with optimized caching

### Nginx Configuration

Located in `nginx.conf`:

- Gzip compression enabled
- SPA routing (all routes → `index.html`)
- Static asset caching (1 year)

### Build and Run

```bash
# Build image
docker build -t scoutai-frontend .

# Run container
docker run -p 3000:3000 scoutai-frontend

# With custom API URL
docker run -p 3000:3000 \
  -e VITE_API_BASE_URL=https://api.example.com \
  scoutai-frontend
```

---

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Google Cloud Run

```bash
# Build and push
docker build -t gcr.io/project-id/scoutai-frontend .
docker push gcr.io/project-id/scoutai-frontend

# Deploy
gcloud run deploy scoutai-frontend \
  --image gcr.io/project-id/scoutai-frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --set-env-vars "VITE_API_BASE_URL=https://api.run.app"
```

---

## Tech Stack

- **React 18** - UI framework
- **TypeScript 5.9** - Type safety
- **Vite 5.4** - Build tool
- **pnpm** - Package manager
- **TanStack Query 5.90** - Data fetching + caching
- **Recharts 2.15** - Charts
- **Tailwind CSS 3.4** - Styling
- **shadcn/ui** - Component library
- **React Router 7** - Routing

---

## Troubleshooting

**Dev server won't start**
- Run: `pnpm install` to reinstall dependencies
- Check Node.js version: `node -v` (need 18+)

**API requests failing**
- Verify `VITE_API_BASE_URL` in `.env`
- Check backend is running on port 8000
- Check CORS settings in backend `main.py`

**Charts not rendering**
- Clear browser cache
- Check browser console for errors
- Verify Recharts is installed: `pnpm list recharts`

**Build fails**
- Clear cache: `pnpm clean`
- Remove node_modules: `rm -rf node_modules && pnpm install`

---

## License

MIT
