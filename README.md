# Paris 2024 Football Events Dashboard

Full-stack monorepo for importing, caching, browsing, refetching, and exporting Paris 2024 Olympic football events.

The project contains two applications:

- `apps/api`: NestJS API backed by PostgreSQL
- `apps/web`: Next.js dashboard backed by the API

## What It Does

The backend fetches Olympic schedule data, filters football events, stores them in PostgreSQL, and exposes a small cached API.

The frontend displays cached events in a table and lets you:

- refetch the full football schedule
- refetch a single event detail payload
- open the raw event API response
- export an event detail payload as JSON

## Stack

| Layer           | Technology                                       |
| --------------- | ------------------------------------------------ |
| Frontend        | Next.js 15, React 19, TanStack Query, TypeScript |
| Backend         | NestJS 11, TypeScript                            |
| Database        | PostgreSQL 17                                    |
| ORM             | TypeORM 0.3                                      |
| Package manager | pnpm 10                                          |
| Runtime         | Node.js 23                                       |

## Repo Layout

```text
assignment/
├── apps/
│   ├── api/
│   └── web/
├── packages/
│   └── types/
├── docker-compose.yml
├── docker-compose.prod.yml
└── package.json
```

## Prerequisites

- Node.js `23.11.1`
- pnpm `10.33.0`
- Docker with Compose

If you use `nvm`, run:

```bash
nvm use
```

## Local Development

### 1. Install dependencies

```bash
pnpm install
```

### 2. Start PostgreSQL

```bash
docker compose up -d
```

This uses the local database-only Compose file.

### 3. Configure environment variables

API:

```bash
cp apps/api/.env.example apps/api/.env
```

Web:

```bash
cp apps/web/.env.example apps/web/.env.local
```

### 4. Run both apps

```bash
pnpm dev
```

Applications:

- frontend: `http://localhost:3000`
- API: `http://localhost:3001/api`
- API root status: `http://localhost:3001`

Run separately if needed:

```bash
pnpm dev:web
pnpm dev:api
```

## Typical Usage Flow

On a fresh database, `GET /api/events` returns cached rows only, so the list can be empty until you populate the cache.

Typical flow:

1. Open `http://localhost:3000`
2. Click `Refetch everything`
3. Wait for the schedule import to finish
4. Browse cached football events
5. Use row actions to refetch or export one event

## Environment Variables

### API

Defined in `apps/api/.env`:

| Variable            | Default                      |
| ------------------- | ---------------------------- |
| `PORT`              | `3001`                       |
| `DB_HOST`           | `localhost`                  |
| `DB_PORT`           | `5432`                       |
| `DB_USER`           | `postgres`                   |
| `DB_PASS`           | `postgres`                   |
| `DB_NAME`           | `assignment`                 |
| `OLYMPICS_BASE_URL` | `https://stacy.olympics.com` |

Endpoint tests use `apps/api/.env.test`, which points to the isolated test database on port `5433`.

### Web

Defined in `apps/web/.env.local`:

| Variable              | Default                     |
| --------------------- | --------------------------- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001/api` |

## API

All routes are prefixed with `/api`.

### `GET /`

Returns a small status payload with links to the API entrypoints.

### `GET /api/events`

Returns cached football events.

Example response:

```json
{
  "events": [
    {
      "externalId": "d3a8f9d8-...",
      "genderCode": "M",
      "startDate": "2024-07-24T17:00:00.000Z",
      "competitors": [{ "name": "France" }, { "name": "United States" }]
    }
  ]
}
```

### `GET /api/events/refetch`

Fetches the football schedule from the upstream Olympics API, upserts it into PostgreSQL, and returns the refreshed cached list.

### `GET /api/events/:id`

Returns one event detail payload by public `externalId`.

If the detail is missing in cache, the API fetches it from upstream, stores it, and returns it.

### `GET /api/events/refetch/:id`

Refetches one event detail payload from upstream and updates the cached event row.

## Error Shape

The API uses a global exception filter. Errors are returned in this shape:

```json
{
  "statusCode": 404,
  "message": "Event with id ... not found",
  "path": "/api/events/...",
  "timestamp": "2026-04-16T12:00:00.000Z"
}
```

## Scripts

Run from the repo root:

| Command                    | Description                                           |
| -------------------------- | ----------------------------------------------------- |
| `pnpm dev`                 | Run `web` and `api` in parallel                       |
| `pnpm dev:web`             | Run the Next.js app                                   |
| `pnpm dev:api`             | Run the NestJS API                                    |
| `pnpm build`               | Build shared types, then both apps                    |
| `pnpm build:web`           | Build the frontend                                    |
| `pnpm build:api`           | Build the backend                                     |
| `pnpm typecheck`           | Type-check all workspaces                             |
| `pnpm test:api:db:up`      | Start the isolated PostgreSQL test database           |
| `pnpm test:api:db:migrate` | Run API migrations against the isolated test database |
| `pnpm test:api:endpoints`  | Run Jest and Supertest endpoint suites                |
| `pnpm test:api:db:down`    | Stop and remove the isolated test database            |

API migration commands:

| Command                                              | Description                                                                       |
| ---------------------------------------------------- | --------------------------------------------------------------------------------- |
| `pnpm --filter @assignment/api migration:run:dev`    | Run pending migrations against the local database using the TypeScript datasource |
| `pnpm --filter @assignment/api migration:revert:dev` | Revert the last local migration                                                   |
| `pnpm --filter @assignment/api migration:show`       | Show migration status                                                             |

## Docker

### Local Postgres only

```bash
docker compose up -d
docker compose down
docker compose down -v
```

### Endpoint test Postgres

Use the dedicated test Compose file to keep endpoint suites isolated from the local development database:

```bash
pnpm test:api:db:up
pnpm test:api:db:migrate
pnpm test:api:endpoints
pnpm test:api:db:down
```

The endpoint suites live under `apps/api/test`, use Jest with Supertest, mock the upstream Olympics API, and keep reusable payload generators in `apps/api/test/generators`.

### Full-stack deployment on VPS/VM

The repo includes `docker-compose.prod.yml` for:

- `postgres`
- `api`
- `web`

Start it with:

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

Stop it with:

```bash
docker compose -f docker-compose.prod.yml down
```

Notes:

- `NEXT_PUBLIC_API_URL` is baked into the web image at build time, so changing it requires rebuilding the frontend container.
- If you deploy on a VPS, place a reverse proxy such as Nginx in front of the frontend and API.
- The API container runs pending database migrations before the Nest server starts.

## Deployment

Simplest hosted option:

- `apps/web` on Vercel
- `apps/api` on Railway
- PostgreSQL on Railway

Simplest self-hosted option:

- one VM or VPS using `docker-compose.prod.yml`

## Todo

Hello future developers! -> here are some things you can do if you are willing to contribute:

- [x] Migration system
- [ ] Add proper config module with env var validation
- [x] Add tests
- [ ] Tidy up tests
- [ ] Add json diff inside application
- [ ] Refactor backend into hexagonal architecture - optional as we are short on time.
- [ ] Improve caching strategy as in future application could be extended with live events - however now it's not needed as we operate in distand past.
- [ ] Add Authorization - possibly JWT with token reuse detection on backend, not needed as this serves as devtool
- [ ] Add rate limiting

## Implementation Notes

### How data is retrieved and parsed

The backend uses two upstream retrieval flows.

#### 1. Schedule import

- The API client generates one Olympics schedule URL per day for the fixed Paris 2024 window from `2024-07-24` through `2024-08-11` thats how long oly games are running.
- Those day endpoints are fetched in parallel.
- All returned `units` arrays are flattened into one collection.
- Only rows with `disciplineCode === "FBL"` are kept. "FBL" is code for Football
- The schedule DTO maps each upstream schedule unit into the local `EventEntity` shape used for caching.
- For the cached list response, only a subset of fields is exposed: `externalId`, `genderCode`, `startDate`, and competitor names.

#### 2. Event detail retrieval

- When `/api/events/:id` or `/api/events/refetch/:id` is called, the backend resolves the cached row by public `externalId`.
- It then uses the row's `sourceEventId` to fetch the upstream match detail payload.
- That raw payload is translated by `MatchDataAdapter` into the shared `Match` shape returned by the API.

Detail parsing currently uses these rules:

- competition name and season are normalized into a fixed local shape
- venue city is derived from the last segment of `location.longDescription`
- home and away teams are detected from `HOME_AWAY` markers, with fallback to the first two items when markers are missing
- match status is inferred from the upstream `PERIOD` code
- score is taken from `TOT` and `H1` period rows
- scorers are built from play-by-play actions where a `SHOT` or `PEN` action has result `GOAL`
- lineups are built from team athletes, with starter detection and position lookup from available entries

### How endpoint ordering is determined

There are two ordering stages in the current implementation.

#### 1. Upstream schedule ordering before persistence

- After all day schedules are combined, football events are sorted by `startDate` ascending.
- This gives deterministic import order before data is written to PostgreSQL.

#### 2. Cached API response ordering

- The public `GET /api/events` response is returned from the repository, not directly from the in-memory upstream sort.
- The repository currently orders cached rows by `endDate` ascending and then `sourceEventId` ascending.
- That means the list ordering visible in the API and frontend is determined by the database query order, not strictly by kickoff time.

If strict kickoff ordering is required at the API boundary, the repository ordering should be aligned to `startDate`.

### Assumptions for missing or inconsistent schedule data

The current implementation makes these fallback assumptions:

- if the upstream response has no `HOME_AWAY` markers, the first item is treated as home and the second as away
- if venue data is missing, venue fields fall back to empty strings
- if the location description is missing, the city falls back to an empty string
- if the match `PERIOD` code is missing or unknown, status falls back to `SCHEDULED`
- if total score or half-time score rows are missing, score values fall back to `0`
- if play-by-play data is missing, scorers are returned as an empty array
- if a goal action has no resolvable athlete or assist, that part is skipped rather than failing the whole match mapping
- if a scorer minute cannot be parsed from the upstream string, it falls back to `0`
- if formation or coach data is missing, those fields fall back to `unknown`
- if a player position cannot be resolved from the upstream payload, it falls back to `UNK`
- the dashboard is cache-first, so an empty database is treated as a valid initial state until a full refetch is triggered

### Current tradeoff

The parser is intentionally defensive: it prefers returning a usable partial match payload over failing the entire response when optional upstream fields are missing. That keeps the API resilient, but it also means some fields may contain fallback values rather than hard validation errors.

### Migration strategy

- `synchronize` is disabled.
- TypeORM migrations are the source of truth for schema changes.
- In non-production environments, pending migrations run automatically through the TypeORM module configuration.
- In production Docker deployments, the API container executes `migration:run` before starting the Nest server.
