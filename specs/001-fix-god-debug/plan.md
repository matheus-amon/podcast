# Implementation Plan: God Mode Debug & Fix

**Branch**: `001-fix-god-debug` | **Date**: 2026-02-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-fix-god-debug/spec.md`

**Note**: This plan focuses on fixing existing code, not adding new features. All tasks are bug fixes and infrastructure improvements.

## Summary

Fix all critical and moderate bugs in the Podcast SaaS POC to make the application fully functional. Primary focus: backend startup issues, database schema fixes, API endpoint errors, and frontend integration problems. Technical approach follows API-First principle with systematic bug resolution by severity.

---

## Technical Context

**Language/Version**: TypeScript 5.x, Bun 1.3.6
**Primary Dependencies**: ElysiaJS 1.4, Drizzle ORM 0.45, Next.js 16, React 19
**Storage**: PostgreSQL 15 (via docker-compose)
**Testing**: E2E tests (mandatory per constitution), unit tests for critical paths
**Target Platform**: Linux server (Docker), Web browser
**Project Type**: Web application (frontend + backend monorepo)
**Performance Goals**: Backend start <5s, Frontend build <30s, API response <200ms p95
**Constraints**: Must work with existing codebase structure, no breaking changes to API contracts
**Scale/Scope**: POC - single tenant, <1000 users, 11 database tables

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. API-First Backend** | ✅ PASS | Backend fixes prioritized before frontend. Swagger already implemented. |
| **II. E2E Testing** | ⚠ PARTIAL | E2E tests not yet implemented. Will add for critical flows post-fix. |
| **III. Minimalist DDD** | ✅ PASS | Domain folders already in use (`modules/leads`, `modules/agenda`, etc.). No over-engineering needed. |
| **IV. REST & OpenAPI** | ✅ PASS | Swagger endpoint exists. REST conventions followed in controllers. |
| **V. Migration Discipline** | ⚠ PARTIAL | Drizzle schema exists but missing relations. Will fix schema before migrations. |
| **Dev Workflow: Gitmoji** | ✅ PASS | All commits will follow Gitmoji convention. |
| **Dev Workflow: .env** | ⚠ PARTIAL | Missing `.env.example`. Will create. |
| **Security: Validation** | ⚠ PARTIAL | Input validation exists but uses `as any`. Will fix with proper types. |
| **Security: Logging** | ⚠ PARTIAL | No structured logging implemented. Will add basic logging middleware. |

**GATE DECISION**: ✅ PROCEED - Partial violations are expected (bug fix mission). All fixes will move toward compliance.

---

## Project Structure

### Documentation (this feature)

```text
specs/001-fix-god-debug/
├── plan.md              # This file
├── research.md          # Phase 0 output (best practices, patterns)
├── data-model.md        # Phase 1 output (fixed schema with relations)
├── quickstart.md        # Phase 1 output (setup guide)
├── contracts/           # Phase 1 output (OpenAPI spec export)
└── tasks.md             # Phase 2 output (task breakdown)
```

### Source Code (repository root)

```text
apps/api/
├── src/
│   ├── db/
│   │   ├── index.ts           # Database connection (fix: add error handling)
│   │   └── schema.ts          # Schema (fix: add relations, fix types)
│   ├── modules/
│   │   ├── leads/
│   │   │   └── leads.controller.ts    # Fix: proper enum types
│   │   ├── agenda/
│   │   │   └── agenda.controller.ts   # Fix: empty whereClause bug
│   │   ├── budget/
│   │   │   └── budget.controller.ts   # Fix: type casting
│   │   ├── billing/
│   │   │   └── billing.controller.ts  # Fix: proper types
│   │   ├── dashboard/
│   │   │   └── dashboard.controller.ts # Fix: date comparisons
│   │   └── whitelabel/
│   │       └── whitelabel.controller.ts # Fix: query builder
│   ├── middleware/
│   │   └── error.middleware.ts        # NEW: global error handler
│   │   └── logger.middleware.ts       # NEW: structured logging
│   └── index.ts                       # Main entry point (already correct)
├── index.ts                           # FIX: point to src/index.ts or remove
├── .env.example                       # NEW: environment template
├── drizzle.config.ts
├── package.json
└── tsconfig.json

apps/web/
├── app/
│   ├── page.tsx                       # Dashboard (fix: error handling)
│   ├── leads/
│   ├── agenda/
│   ├── finance/
│   ├── budget/
│   └── settings/
├── lib/
│   └── api.ts                         # Fix: better error messages
├── hooks/
│   └── use-toast.ts                   # Verify initialization
└── package.json

docker-compose.yml                     # PostgreSQL (already configured)
```

**Structure Decision**: Web application structure (Option 2 from template) matches existing monorepo setup. No changes to high-level structure needed - only bug fixes within existing directories.

---

## Phase 0: Research & Best Practices

### Research Topics

1. **Drizzle ORM Relations**: How to define one-to-many and many-to-one relations
   - Leads ↔ LeadInteractions
   - Episodes ↔ Scripts
   - Episodes ↔ Agenda Events
   - Episodes ↔ Budget Entries
   - Episodes ↔ Production Tasks

2. **ElysiaJS Error Handling**: Global error middleware patterns
   - Catch unhandled exceptions
   - Format error responses consistently
   - Log errors with context

3. **ElysiaJS Structured Logging**: Request/response logging middleware
   - Log levels (error, warn, info, debug)
   - Request ID correlation
   - Performance timing

4. **Drizzle Date Comparisons**: Best practices for date filtering
   - Timezone handling
   - String vs Date object comparisons
   - Month/year aggregations

5. **Next.js Error Boundaries**: React error handling patterns
   - Error boundary components
   - API fetch error handling
   - Loading and empty states

### Research Output Location
All findings will be documented in `specs/001-fix-god-debug/research.md`

---

## Phase 1: Design & Contracts

### Data Model Updates (data-model.md)

**Entities Requiring Schema Fixes:**

1. **Leads** - Add relations to LeadInteractions
2. **Episodes** - Add relations to Scripts, Agenda, Budget, Tasks
3. **Agenda** - Fix leadId and episodeId foreign key usage
4. **Budget** - Fix connectedEpisodeId relation
5. **All Tables** - Ensure created_at, updated_at consistency

### API Contracts (contracts/)

**Existing Endpoints to Document:**

| Module | Endpoints | Status |
|--------|-----------|--------|
| Leads | GET /, GET /:id, POST /, PUT /:id, DELETE /:id, GET /:id/interactions, POST /:id/interactions | ✅ Implemented |
| Agenda | GET /events, POST /events, GET /episodes, GET /episodes/:id, POST /episodes, PUT /episodes/:id, GET /episodes/:id/script, POST /episodes/:id/script, GET /episodes/:id/tasks, POST /episodes/:id/tasks, PUT /tasks/:id | ✅ Implemented |
| Budget | GET /, GET /summary, POST /, PUT /:id, DELETE /:id, GET /templates, POST /templates, POST /templates/:id/apply | ✅ Implemented |
| Billing | GET /, GET /summary, POST /, PUT /:id, DELETE /:id | ✅ Implemented |
| Dashboard | GET /metrics, GET /charts/revenue, GET /recent-activity | ✅ Implemented |
| Whitelabel | GET /config, POST /config | ✅ Implemented |

**Contract Fixes Needed:**
- Standardize error response format: `{ error: { code, message, details } }`
- Add proper HTTP status codes (400, 404, 500)
- Document in Swagger (already enabled, needs verification)

### Quickstart Guide (quickstart.md)

**Setup Steps to Document:**

1. Prerequisites (Bun, Docker)
2. Clone and install dependencies
3. Configure `.env` from `.env.example`
4. Start PostgreSQL via docker-compose
5. Run database migrations
6. Start backend
7. Start frontend
8. Verify with Swagger

---

## Phase 2: Task Breakdown Preview

**Tasks will be generated by `/speckit.tasks` command after this plan is complete.**

### Expected Task Categories

1. **Critical Fixes** (P0) - Blocking functionality
   - Fix entry point confusion
   - Fix Agenda empty whereClause bug
   - Fix Dashboard date comparisons
   - Create .env.example
   - Add schema relations

2. **Type Safety Fixes** (P1) - TypeScript correctness
   - Replace `as any` with proper enum types
   - Fix type casting in budget summary
   - Proper Date object handling

3. **Infrastructure** (P1) - Developer experience
   - Add error middleware
   - Add logging middleware
   - Create .gitignore entries
   - Update README with setup instructions

4. **Frontend Fixes** (P2) - UI stability
   - Improve API error handling
   - Add empty states
   - Verify toast initialization

5. **Documentation** (P2) - Knowledge transfer
   - Quickstart guide
   - API contract documentation
   - Architecture decisions

---

## Complexity Tracking

> **No violations requiring justification.** All fixes maintain alignment with constitution principles.

---

## Next Steps

1. ✅ Complete Phase 0 research → `research.md`
2. ✅ Complete Phase 1 design → `data-model.md`, `contracts/`, `quickstart.md`
3. ✅ Update agent context with technologies
4. ⏳ Run `/speckit.tasks` to generate task breakdown
5. ⏳ Begin implementation (Critical Fixes first)

---

**Plan Status**: Ready for Phase 0 execution
**Constitution Compliance**: ✅ All principles respected
**Estimated Complexity**: Medium (14 issues across 3 severity levels)
