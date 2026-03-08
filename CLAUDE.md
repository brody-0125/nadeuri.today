# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**나들이 (nadeuri.today)** — Real-time accessibility facility status monitoring for Seoul Metro. Tracks 9 types of accessibility facilities (elevators, escalators, moving walks, wheelchair lifts, safety boards, disabled restrooms, sign language phones, wheelchair chargers, mobility helpers) across 300+ stations on lines 1–9 and S-line.

## Build & Development Commands

### Frontend (web/)
```bash
cd web && npm install
npm run dev          # Dev server on localhost:3000
npm run build        # Static export to web/out/
```

### Data Collection Scripts (scripts/)
```bash
cd scripts && npm install
npm run collect              # Collect real-time facility data
npm run collect-static       # Collect static facility data (daily)
npm run build-latest         # Aggregate into data/latest.json
npm run validate             # Validate data integrity
```

### Environment Variables
- `SEOUL_API_KEY` — Seoul Open Data API key (required for live data collection)
- `RECAPTCHA_SECRET` — reCAPTCHA v3 secret (contact form verification)

## Architecture

### Data Pipeline
```
Seoul Open Data API → GitHub Actions (cron) → Node.js scripts → data/*.json → build-latest.js → data/latest.json → Next.js static site → GitHub Pages
```

- **Real-time collection** runs every 5 minutes via GitHub Actions (`collect-realtime.yml`)
- **Static facility data** collected daily at 3:15 PM KST (`collect-static.yml`)
- Realtime data stored in `data/realtime/` (overwritten on each collection)
- Frontend reads `data/latest.json` (aggregated snapshot)

### Frontend (web/src/)
- **Next.js 14** with App Router, TypeScript, Tailwind CSS
- **Static export** (`output: 'export'`) deployed to GitHub Pages
- Path alias: `@/*` → `src/*`
- `app/page.tsx` — Main station list with search/filter
- `app/station/[code]/` — Station detail page (dynamic route)
- `lib/data.ts` — Data fetching with caching
- `lib/stations.ts` — Station metadata (names, lines, coordinates)
- `lib/hangul.ts` — Korean Hangul decomposition for search (supports chosung matching)
- `lib/mock-data.ts` — Mock data for development (toggled via DevSettingsPanel)
- `types/index.ts` — Core type definitions (`FacilityStatus`, `FacilityType`, etc.)

### Data Collection (scripts/)
- ES modules (`"type": "module"` in package.json)
- `scripts/api/` — One module per facility type (elevator.js, escalator.js, etc.)
- `scripts/config/api-endpoints.json` — API endpoint definitions with field mappings
- `scripts/api/client.js` — HTTP client wrapper for Seoul Open Data API

### Contact Form Backend (gas/)
- Google Apps Script deployed as web app
- reCAPTCHA v3 verification, honeypot, duplicate detection
- Stores submissions in Google Sheets

## Key Conventions

- **Korean-first content**: All UI text in Korean. Follow tone/voice guide in `docs/tone-voice-uiux-guide.md` — "neighbor-like" warmth, clarity over formality.
- **Brand guidelines**: Colors, typography in `docs/brand-identity-guidelines.md`. Metro line colors defined in `web/tailwind.config.ts`.
- **Facility statuses**: `OPERATING | FAULT | MAINTENANCE | UNKNOWN`
- **Facility types split**: Real-time (`elevator`, `escalator`, `moving_walk`, `wheelchair_lift`, `safety_board`) vs. Static (`disabled_restroom`, `sign_language_phone`, `wheelchair_charger`, `helper`)
- **Theme system**: Light/dark via CSS variables and ThemeProvider component
- **Mobile-first**: TabBar for mobile navigation, responsive layouts
