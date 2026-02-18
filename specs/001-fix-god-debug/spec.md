# Feature Specification: God Mode Debug & Fix

**Feature Branch**: `001-fix-god-debug`
**Created**: 2026-02-18
**Status**: Draft
**Input**: User description: "analise completa de todo o repo e identificação e debug do que não funciona, foco em fazer funcionar o código atual, não é feature, é GOD-fix"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Developer Runs Backend Successfully (Priority: P1)

As a developer, I want to start the backend API without errors so I can test and develop features.

**Why this priority**: Backend is the foundation for all features. Without a working API, frontend and integrations cannot function.

**Independent Test**: Developer can run `bun install && bun run src/index.ts` in `apps/api` and see the success message with Swagger available at `/swagger`.

**Acceptance Scenarios**:

1. **Given** a fresh checkout with PostgreSQL running, **When** developer runs `bun install` then `bun run src/index.ts`, **Then** server starts on port 3001 without errors
2. **Given** the server is running, **When** developer accesses `http://localhost:3001/swagger`, **Then** Swagger UI loads with all API endpoints documented
3. **Given** DATABASE_URL is configured, **When** server starts, **Then** database connection is established without errors

---

### User Story 2 - Developer Runs Frontend Successfully (Priority: P1)

As a developer, I want to start the frontend without build errors so I can access the UI.

**Why this priority**: Frontend is the primary user interface. Without it, users cannot interact with the system.

**Independent Test**: Developer can run `bun install && bun run dev` in `apps/web` and access `http://localhost:3000` without errors.

**Acceptance Scenarios**:

1. **Given** backend is running, **When** developer runs `bun install` then `bun run dev` in apps/web, **Then** Next.js dev server starts on port 3000
2. **Given** frontend is running, **When** developer accesses `http://localhost:3000`, **Then** dashboard page loads without React errors
3. **Given** API is accessible, **When** dashboard loads, **Then** metrics display without fetch errors

---

### User Story 3 - Database Migrations Apply Successfully (Priority: P1)

As a developer, I want to apply database migrations without errors so the schema is created correctly.

**Why this priority**: Database schema is required for all API operations. Missing tables cause runtime failures.

**Independent Test**: Developer can run `bun x drizzle-kit push` in `apps/api` and all tables are created successfully.

**Acceptance Scenarios**:

1. **Given** PostgreSQL is running with empty database, **When** developer runs `bun x drizzle-kit push`, **Then** all tables (leads, episodes, agenda, budget, billing, etc.) are created
2. **Given** migrations ran successfully, **When** checking database, **Then** all enums and foreign keys exist
3. **Given** schema exists, **When** API queries data, **Then** no "relation does not exist" errors occur

---

### User Story 4 - API Endpoints Return Data Without Errors (Priority: P2)

As a developer, I want all API endpoints to respond without runtime errors so the frontend can consume data.

**Why this priority**: Broken endpoints cause frontend failures and poor user experience.

**Independent Test**: Each GET endpoint returns valid JSON data with HTTP 200 status.

**Acceptance Scenarios**:

1. **Given** database has data, **When** calling `GET /api/leads`, **Then** returns array of leads without errors
2. **Given** database has data, **When** calling `GET /api/agenda/events`, **Then** returns array of events without errors
3. **Given** database has data, **When** calling `GET /api/budget`, **Then** returns array of budget entries without errors
4. **Given** database has data, **When** calling `GET /api/billing`, **Then** returns array of invoices without errors
5. **Given** database has data, **When** calling `GET /api/dashboard/metrics`, **Then** returns metrics object without errors

---

### User Story 5 - Frontend Pages Load Without Errors (Priority: P2)

As a developer, I want all frontend pages to load without React errors so users can navigate the application.

**Why this priority**: Page errors block user workflows and reduce trust in the application.

**Independent Test**: Each route (`/leads`, `/agenda`, `/finance`, `/budget`, `/settings`) loads without console errors.

**Acceptance Scenarios**:

1. **Given** frontend and backend running, **When** accessing `/leads`, **Then** page renders without React errors
2. **Given** frontend and backend running, **When** accessing `/agenda`, **Then** calendar/events render without errors
3. **Given** frontend and backend running, **When** accessing `/finance`, **Then** budget/billing UI renders without errors
4. **Given** frontend and backend running, **When** accessing `/settings`, **Then** whitelabel settings render without errors

---

### Edge Cases

- **Database connection failure**: System should display clear error message, not crash silently
- **API unavailable**: Frontend should handle fetch errors gracefully with user-friendly messages
- **Missing environment variables**: Application should fail fast with clear error about which variable is missing
- **Type mismatches in API responses**: Frontend should handle unexpected data structures without crashing
- **Date parsing errors**: System should handle different date formats gracefully
- **Empty database**: Dashboard and lists should display empty states, not crash

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST start backend server on port 3001 without runtime errors
- **FR-002**: System MUST start frontend dev server on port 3000 without build errors
- **FR-003**: System MUST apply database migrations successfully via `drizzle-kit push`
- **FR-004**: System MUST expose Swagger documentation at `/swagger` endpoint
- **FR-005**: System MUST connect to PostgreSQL database using DATABASE_URL environment variable
- **FR-006**: Frontend MUST fetch data from backend API without CORS errors
- **FR-007**: All API endpoints MUST return valid JSON responses
- **FR-008**: Dashboard MUST display metrics (leads count, episodes count, revenue, events)
- **FR-009**: System MUST handle missing environment variables with clear error messages
- **FR-010**: Frontend MUST display error toasts when API calls fail
- **FR-011**: Database schema MUST include all tables: leads, lead_interactions, episodes, scripts, agenda, production_tasks, budget, budget_templates, billing, metrics, whitelabel_config
- **FR-012**: All timestamp fields MUST use proper Date objects, not strings

### Key Entities

- **Leads**: CRM contacts (name, email, role, status, company, position, avatar, bio, linkedin, tags, notes)
- **Episodes**: Podcast content (title, description, season, number, status, publish date)
- **Scripts**: Episode scripts with versioning (episode_id, content, version, last_edited_by)
- **Agenda Events**: Calendar events (title, description, start/end dates, type, participants, color)
- **Budget Entries**: Financial transactions (concept, amount, type, category, date, responsible, status)
- **Budget Templates**: Reusable budget item groups (name, items array)
- **Billing**: Invoices/receivables (client, amount, due date, status, invoice number, subscription plan)
- **Metrics**: Analytics snapshots (date, revenue, active episodes, new leads, storage used)
- **Whitelabel Config**: Branding settings (logo, colors, company name, subdomain)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Backend starts successfully in under 5 seconds with message showing port 3001
- **SC-002**: Frontend builds and starts in under 30 seconds without TypeScript errors
- **SC-003**: All 11 database tables created successfully via drizzle-kit push
- **SC-004**: Swagger UI loads at `/swagger` with all 6 module endpoints documented
- **SC-005**: Dashboard page loads and displays at least 4 KPI cards without errors
- **SC-006**: All GET endpoints return HTTP 200 with valid JSON (no 500 errors)
- **SC-007**: Zero console errors in browser when loading dashboard page
- **SC-008**: Environment variable errors display clear messages indicating which variable is missing
- **SC-009**: API fetch errors display user-friendly toast notifications in frontend
- **SC-010**: Developer can complete full setup (install, migrate, start) in under 5 minutes following README

## Assumptions

- Developer has Bun runtime installed (v1.3.6+)
- PostgreSQL 15+ is available via Docker or local installation
- Developer has Node.js 18+ for frontend tooling
- `.env` file will be created with DATABASE_URL before running
- Frontend expects backend running on `http://localhost:3001` by default
- Database is empty on first run (no existing data to migrate)

## Dependencies

- **PostgreSQL**: Database server (provided via docker-compose.yml)
- **Bun**: JavaScript runtime for both backend and frontend
- **Drizzle ORM**: Database migrations and queries
- **ElysiaJS**: Backend web framework
- **Next.js 16**: Frontend React framework
- **Shadcn/UI**: Component library for frontend

## Known Issues (Identified During Analysis)

### Critical Issues

1. **Wrong entry point**: `index.ts` root has `console.log("Hello via Bun!")` but `src/index.ts` has the actual Elysia app
2. **TypeScript errors in controllers**: Controllers use `as any` for enum casts instead of proper types
3. **Missing `.env.example`**: No template for required environment variables
4. **Dashboard controller date comparison**: Comparing dates incorrectly (string vs date)
5. **Schema relations missing**: Drizzle schema doesn't define relations between tables
6. **Frontend API error handling**: Toast hook may not be properly initialized

### Moderate Issues

1. **Agenda query bug**: `and(...whereClause)` fails when whereClause is empty
2. **Budget summary type casting**: `Number()` casting of SQL sum results is fragile
3. **Whitelabel config**: Uses `sql` template instead of proper query builder
4. **Missing error middleware**: No global error handler for unhandled exceptions
5. **Date handling**: Mixing Date objects and ISO strings inconsistently

### Minor Issues

1. **No .gitignore for .env**: Should ensure .env is never committed
2. **Missing README documentation**: No setup instructions for new developers
3. **No health check endpoint**: Missing `/health` endpoint for monitoring
4. **Inconsistent naming**: Some files use `.controller.ts`, could be `.routes.ts`
