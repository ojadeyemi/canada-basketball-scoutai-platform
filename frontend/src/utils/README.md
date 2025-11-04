# Statistical Utilities Usage Guide

## Overview

This module provides comprehensive utilities for working with player statistics, including:

- Position inference for leagues without explicit position data
- Color-coded stat tiers (5-tier system: Elite, Good, Average, Below Average, Poor)
- League-adjusted and position-adjusted stat ranges
- Helper functions for formatting and charting

---

## Quick Start

### 1. Get Stat Color for UI Display

```typescript
import { getStatColor, getStatColorClasses } from '@/utils/statHelpers'

// Basic usage
const colorInfo = getStatColor(15.5, 'points_per_game', 'cebl')
// Returns: { color: 'green', label: 'Good' }

// Get Tailwind CSS classes
const classes = getStatColorClasses(colorInfo.color)
// Returns: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-300' }

// Use in component
<div className={`${classes.bg} ${classes.text} ${classes.border} px-3 py-1 rounded`}>
  {colorInfo.label}
</div>
```

### 2. Position-Aware Stats

```typescript
import { inferPosition, getStatColor } from "@/utils/statHelpers";

// Infer position for leagues without position data
const position = inferPosition(seasonStats);
// Returns: 'guard' | 'forward' | 'center' | 'unknown'

// Get position-adjusted color (e.g., RPG ranges differ by position)
const rpgColor = getStatColor(7.5, "rebounds_per_game", "usports", position);
// For guards: 7.5 RPG = 'blue' (elite)
// For centers: 7.5 RPG = 'yellow' (average)
```

### 3. Tooltips with Stat Descriptions

```typescript
import { getStatInfo } from '@/utils/statHelpers'

const statInfo = getStatInfo('true_shooting_pct')
/*
Returns:
{
  name: "True Shooting %",
  description: "Shooting efficiency accounting for 2PT, 3PT, and FT value...",
  formula: "PTS / (2 × (FGA + 0.44 × FTA))",
  ranges: [...],
  higherIsBetter: true
}
*/

// Use in tooltip component (shadcn/ui example)
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger>
      <span className="underline decoration-dotted">TS%</span>
    </TooltipTrigger>
    <TooltipContent>
      <div>
        <p className="font-semibold">{statInfo.name}</p>
        <p className="text-sm">{statInfo.description}</p>
        {statInfo.formula && (
          <p className="text-xs text-gray-500 mt-1">
            Formula: {statInfo.formula}
          </p>
        )}
      </div>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

### 4. Format Stat Values

```typescript
import { formatStatValue } from "@/utils/statHelpers";

formatStatValue(0.545, "true_shooting_pct"); // "54.5%"
formatStatValue(2.3, "assist_to_turnover_ratio"); // "2.3"
formatStatValue(1250, "total_points"); // "1,250"
formatStatValue(null, "points_per_game"); // "-"
```

### 5. Prepare Data for Charts

```typescript
import { prepareChartData } from '@/utils/statHelpers'

const chartData = prepareChartData(
  playerDetail.seasons,
  ['points_per_game', 'rebounds_per_game', 'assists_per_game']
)

/*
Returns:
[
  { season: '2023-24', points_per_game: 15.2, rebounds_per_game: 5.3, assists_per_game: 3.1 },
  { season: '2022-23', points_per_game: 12.8, rebounds_per_game: 4.9, assists_per_game: 2.7 },
  ...
]
*/

// Use with recharts
<LineChart data={chartData}>
  <Line dataKey="points_per_game" stroke="#8884d8" />
  <Line dataKey="rebounds_per_game" stroke="#82ca9d" />
  <Line dataKey="assists_per_game" stroke="#ffc658" />
</LineChart>
```

### 6. Calculate Career Totals

```typescript
import { calculateCareerTotals } from "@/utils/statHelpers";

const totals = calculateCareerTotals(playerDetail.seasons);
/*
Returns:
{
  totalPoints: 1450,
  totalRebounds: 520,
  totalAssists: 280,
  totalSteals: 95,
  totalBlocks: 42,
  totalGamesPlayed: 88
}
*/
```

---

## Complete Component Example

```typescript
import { getStatColor, getStatColorClasses, formatStatValue, getStatInfo, inferPosition } from '@/utils/statHelpers'
import { PlayerDetail } from '@/types/player'

interface StatCardProps {
  playerDetail: PlayerDetail
  statKey: string
  value: number
}

export function StatCard({ playerDetail, statKey, value }: StatCardProps) {
  const statInfo = getStatInfo(statKey)
  if (!statInfo) return null

  // Infer position if not available
  const position = playerDetail.seasons[0]?.advanced_stats
    ? inferPosition(playerDetail.seasons[0])
    : undefined

  // Get color tier
  const colorInfo = getStatColor(value, statKey, playerDetail.league as any, position)
  const classes = colorInfo ? getStatColorClasses(colorInfo.color) : null

  return (
    <div className={`p-4 rounded-lg border ${classes?.bg} ${classes?.border}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600">
          {statInfo.name}
        </span>
        {colorInfo && (
          <span className={`text-xs px-2 py-1 rounded ${classes?.text}`}>
            {colorInfo.label}
          </span>
        )}
      </div>
      <div className="mt-2 text-2xl font-bold">
        {formatStatValue(value, statKey)}
      </div>
      <div className="mt-1 text-xs text-gray-500">
        {statInfo.description}
      </div>
    </div>
  )
}
```

---

## Color Tier Meanings

- **Blue (Elite)**: Top-tier performance, exceptional players
- **Green (Good)**: Above-average performance
- **Yellow (Average)**: League-average performance
- **Orange (Below Average)**: Below league average
- **Red (Poor)**: Significantly below average

---

## League-Adjusted Ranges

Stats like PPG have different ranges per league:

- **U SPORTS/CCAA**: 18+ PPG = Elite
- **CEBL**: 19+ PPG = Elite (higher competition level)
- **HoopQueens**: 18+ PPG = Elite

---

## Position-Adjusted Ranges

Stats like RPG and APG vary by position:

### Rebounds Per Game

- **Guards**: 6.5+ = Elite
- **Forwards**: 9+ = Elite
- **Centers**: 10+ = Elite

### Assists Per Game

- **Guards**: 6.5+ = Elite
- **Forwards**: 4.5+ = Elite
- **Centers**: 3.5+ = Elite

---

## Advanced Stats Formulas

All advanced metrics are calculated in the backend and include:

- **True Shooting %**: `PTS / (2 × (FGA + 0.44 × FTA))`
- **Effective FG%**: `(FGM + 0.5 × 3PM) / FGA`
- **AST/TO Ratio**: `AST / TOV`
- **Usage Rate**: `(FGA + 0.44 × FTA + TOV) / Team Total × 100`

---

## Notes

- All percentage stats are stored as decimals (0-1 scale) in the database
- `formatStatValue()` automatically converts to percentage display
- Position inference uses heuristics; real position data preferred when available
- Ranges are calibrated for Canadian amateur/semi-pro leagues
