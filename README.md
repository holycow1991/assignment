# Paris 2024 — Olympic Football Endpoint Generator

A full-stack tool for QA engineers to generate, review, and export expected API endpoints for every football (soccer) match played during the **Paris 2024 Olympic Games**.

Generated endpoints serve as reference values for automated tests that validate the example [FootyScores](https://footyscores.example) API implementation.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [API Reference](#api-reference)
- [Endpoint Generation Logic](#endpoint-generation-logic)
- [Data Export](#data-export)
- [Assumptions](#assumptions)

---

## Overview

The application fetches the official Paris 2024 Olympic Games competition schedule, filters football matches, and generates a deterministic, well-structured API endpoint for each match. Results can be reviewed in the browser UI and exported as machine-readable JSON for use in automated test suites.

### Key Features

- **Load & display** all Olympic football matches with generated endpoints in a table
- **Export to JSON** — one-click download of the full results as `paris-2024-endpoints.json`
- **Deterministic output** — results are always sorted by kickoff date and time
- **Bonus** — JSON comparison against the live FootyScores API

---

## Tech Stack

| Layer    | Technology                     |
| -------- | ------------------------------ |
| Frontend | React 19, Vite 6, TypeScript 5 |
| Backend  | NestJS 11, TypeScript 5        |
| Database | PostgreSQL 17                  |
| ORM      | TypeORM 0.3                    |
| Runtime  | Node.js 23                     |

---

## Project Structure

```
assignment/
├── apps/
│   ├── web/                    # React + Vite frontend  (@assignment/web)
│   │   ├── src/
│   │   │   ├── main.tsx        # React 18 entry point
│   │   │   └── App.tsx         # Main UI component
│   │   ├── vite.config.ts      # Dev server (port 3000) + /api proxy
│   │   └── index.html
│   └── api/                    # NestJS backend          (@assignment/api)
│       ├── src/
│       │   ├── main.ts         # Bootstrap (port 3001, global prefix /api)
│       │   └── app.module.ts   # Root module — ConfigModule + TypeOrmModule
│       ├── nest-cli.json
│       └── .env.example
├── packages/
│   └── types/                  # Shared TypeScript interfaces (@assignment/types)
│       └── src/
│           ├── match.types.ts  # Match, Competition, Venue, Score, Scorer …
│           └── index.ts
├── docker-compose.yml          # Postgres 17 service
├── tsconfig.base.json          # Shared strict TypeScript base
├── pnpm-workspace.yaml
└── package.json                # Root workspace — shared scripts
```

---

## Prerequisites

| Tool                    | Version   | Install                                                |
| ----------------------- | --------- | ------------------------------------------------------ |
| Node.js                 | `23.11.1` | [nvm](https://github.com/nvm-sh/nvm) recommended       |
| pnpm                    | `10.33.0` | `npm i -g pnpm`                                        |
| Docker + Docker Compose | v2+       | [docs.docker.com](https://docs.docker.com/get-docker/) |

---

## Getting Started

### 1 — Clone & install dependencies

```bash
git clone <repo-url>
cd assignment

# Use the correct Node version (if using nvm)
nvm use

# Install all workspace dependencies
pnpm install
```

### 2 — Start the database

```bash
docker compose up -d
```

Postgres 17 will be available on `localhost:5432`. The `assignment` database is created automatically.

### 3 — Configure the API environment

```bash
cp apps/api/.env.example apps/api/.env
```

### 4 — Run the full stack

```bash
# Start both apps in parallel
pnpm dev
```

| App      | URL                       |
| -------- | ------------------------- |
| Frontend | http://localhost:3000     |
| API      | http://localhost:3001/api |

Or run them individually:

```bash
pnpm dev:web   # Vite on port 3000
pnpm dev:api   # NestJS on port 3001
```

### 5 — Use the app

1. Open **http://localhost:3000** in your browser.
2. Click **"Load & Generate Endpoints"** to fetch and process the schedule.
3. Review the match list and their generated endpoints.
4. Click **"Export JSON"** to download `paris-2024-endpoints.json`.

---

## Environment Variables

Configuration lives in `apps/api/.env` (copy from `.env.example`):

| Variable  | Default      | Description         |
| --------- | ------------ | ------------------- |
| `PORT`    | `3001`       | NestJS server port  |
| `DB_HOST` | `localhost`  | PostgreSQL host     |
| `DB_PORT` | `5432`       | PostgreSQL port     |
| `DB_USER` | `postgres`   | PostgreSQL username |
| `DB_PASS` | `postgres`   | PostgreSQL password |
| `DB_NAME` | `assignment` | Database name       |

---

## Available Scripts

Run from the **repo root**:

| Script           | Description                           |
| ---------------- | ------------------------------------- |
| `pnpm dev`       | Start `web` and `api` in parallel     |
| `pnpm dev:web`   | Start Vite frontend only              |
| `pnpm dev:api`   | Start NestJS API only                 |
| `pnpm build`     | Build all packages (types → web, api) |
| `pnpm build:web` | Build frontend only                   |
| `pnpm build:api` | Build API only                        |
| `pnpm typecheck` | TypeScript type-check all workspaces  |

Docker shortcuts:

```bash
docker compose up -d      # Start Postgres in background
docker compose down       # Stop containers (data persisted)
docker compose down -v    # Stop containers + wipe volume data
```

---

## API Reference

All routes are prefixed with `/api`.

| Method | Path                     | Description                                              |
| ------ | ------------------------ | -------------------------------------------------------- |
| `GET`  | `/api/matches/endpoints` | Returns all generated match endpoints, sorted by kickoff |

### Response shape

```jsonc
[
  {
    "match": {
      "competition": { "name": "...", "season": "...", "round": "..." },
      "venue": { "name": "...", "city": "..." },
      "kickoff": "2024-07-24T19:00:00+02:00",
      "status": "FT",
      "teams": { "home": "France", "away": "United States" },
    },
    "endpoint": "/matches/2024-07-24/france-vs-united-states",
  },
]
```

---

## Endpoint Generation Logic

Each endpoint is constructed deterministically from the match data:

```
/matches/{YYYY-MM-DD}/{home-slug}-vs-{away-slug}
```

- **Date** — derived from the `kickoff` timestamp (UTC date part)
- **Team slugs** — lower-cased, spaces replaced with hyphens, special characters removed
- **Ordering** — results are sorted ascending by `kickoff` (ISO-8601 string sort is stable)

Given the same schedule input, the output is always identical.

---

## Data Export

The **Export JSON** button in the UI downloads the full results array as `paris-2024-endpoints.json`. This file is suitable for:

- Feeding directly into automated test frameworks
- Diffing against a previous run to detect schedule changes
- Seeding test fixtures

### Example output

```json
[
  {
    "match": {
      "competition": {
        "name": "Olympic Games",
        "season": "Paris 2024",
        "round": "Group Stage"
      },
      "venue": { "name": "Parc des Princes", "city": "Paris" },
      "kickoff": "2024-07-24T19:00:00+02:00",
      "status": "FT",
      "teams": { "home": "France", "away": "United States" }
    },
    "endpoint": "/matches/2024-07-24/france-vs-united-states"
  }
]
```

---

## Assumptions

- The official Olympic schedule is treated as the single source of truth for match data. Any match listed under the **Football** sport category is included; all other sports are ignored.
- Where kickoff times are missing or ambiguous in the source data, the match is still included with `kickoff` set to the start-of-day in local venue time.
- Team names are normalised for slug generation by removing diacritics and punctuation (e.g. `Côte d'Ivoire` → `cote-divoire`).
- The default sort order is **ascending by kickoff datetime**. Matches at the same exact minute are further sorted alphabetically by home team name to ensure a stable, predictable order.
- `synchronize: true` is enabled in TypeORM for non-production environments — schema is auto-managed during development. In production, run explicit migrations.
