# Podcast SaaS — Proof of Concept

[![CI](https://github.com/matheus-amon/podcast/actions/workflows/ci.yml/badge.svg)](https://github.com/matheus-amon/podcast/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A proof-of-concept SaaS for podcast operations, covering the four domains that
actually block a small studio: **agenda**, **leads**, **budget** and **billing**.

The project is spec-driven: requirements and behaviour are written down under
[`specs/`](specs/) before they are implemented, and the implementation is
checked back against them.

## Structure

A monorepo with two applications:

| Path | Stack | Role |
|---|---|---|
| `apps/api` | Bun · ElysiaJS · Drizzle | Backend, REST API, Postgres access |
| `apps/web` | Next.js · shadcn/ui · Tailwind | Frontend |

Supporting directories: [`specs/`](specs/) for specifications,
[`docs/`](docs/) for documentation.

## Running locally

### Backend

```bash
cd apps/api
bun install
bun run src/index.ts
```

Serves on `http://localhost:3001`. Swagger UI at
`http://localhost:3001/swagger`.

Requires a running PostgreSQL instance — set the connection string in
`apps/api/.env`. To create the schema:

```bash
cd apps/api
bun x drizzle-kit push
```

### Frontend

```bash
cd apps/web
bun install
bun run dev
```

Available at `http://localhost:3000`.

Alternatively bring up the whole stack at once:

```bash
docker compose up
```

## Features

- **Agenda** — `apps/web/app/agenda` — episode and recording scheduling
- **Leads** — `apps/web/app/leads` — pipeline of contacts and opportunities
- **Finance** — `apps/web/app/finance` — budget tracking and billing
- **Settings** — `apps/web/app/settings` — whitelabelling

## Status

Proof of concept. The four domains above are implemented at the level needed
to validate the workflow; billing in particular is not yet production-ready.

### Known debt

The two applications are not in the same state, and CI reflects that honestly:

| | State |
|---|---|
| `apps/web` | 101 tests passing, builds clean |
| `apps/api` | 339 passing, 23 skipped, typecheck clean, coverage gate passing |

`apps/api` has two blocking CI jobs: `tsc --noEmit` and
`bun run test:coverage` (tests plus the coverage gate).

### Tests

```bash
cd apps/api
bun test              # unit + integration; DB and e2e suites skip themselves
bun run test:coverage # same, plus a coverage gate that actually bars
```

Two suites skip unless you opt in, because they need services this repo does not
start for you:

| Suite | Needs | Run with |
|---|---|---|
| `tests/e2e/auth.e2e.test.ts` | API running on `:3001` and a seeded database | `bun run test:e2e` |
| `tests/unit/infrastructure/user-repository.adapter.test.ts` | `DATABASE_URL` pointing at a real Postgres with the schema pushed | `DATABASE_URL=… bun test ./tests/unit/infrastructure` |
| `benchmark.test.ts` | A real database | `RUN_BENCHMARK=1 bun test ./benchmark.test.ts` |

### Coverage

`bun run test:coverage` writes an lcov report and checks it with
`apps/api/scripts/check-coverage.ts` (default gates: 80% lines, 75% functions).

There is no `coverageThreshold` in `bunfig.toml` on purpose. Bun has no such
option — it is Jest/Vitest syntax that Bun ignores without a warning, which is
how a 95% threshold sat in the config for months while the project ran at 82%
and nothing failed.

The 286 type errors it used to report were not 286 pieces of debt. A single
`let db;` in `apps/api/src/db/index.ts` had no type and no initializer, which
under `noImplicitAny` made every Drizzle call in every repository adapter
`any` — and checking an `any` finds nothing. Fixing that one declaration took
the count to 107 and surfaced the defects the `any` had been hiding: imports of
schema symbols that do not exist, two missing imports, and an auth guard whose
context was never populated.
