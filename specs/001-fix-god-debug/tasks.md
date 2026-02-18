# Tasks: God Mode Debug & Fix

**Input**: Design documents from `/specs/001-fix-god-debug/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Tests are OPTIONAL for this bug-fix feature. Focus is on making existing code work.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `apps/api/src/`, `apps/web/app/`
- Paths shown below use actual project structure

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 [P] Create .env.example in apps/api with DATABASE_URL template
- [ ] T002 [P] Update .gitignore to ensure .env files are never committed
- [ ] T003 [P] Verify bun.lock and node_modules in .gitignore for both apps

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 [P] Add Drizzle relations to apps/api/src/db/schema.ts (leads, episodes, agenda, budget, tasks)
- [ ] T005 [P] Create error middleware in apps/api/src/middleware/error.middleware.ts
- [ ] T006 [P] Create logger middleware in apps/api/src/middleware/logger.middleware.ts
- [ ] T007 Register error and logger middleware in apps/api/src/index.ts
- [ ] T008 Fix entry point: update apps/api/index.ts to export from src/index.ts or remove it
- [ ] T009 [P] Add updated_at field to episodes table in apps/api/src/db/schema.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Backend Runs Successfully (Priority: P1) 🎯 MVP

**Goal**: Backend API starts without errors and connects to database

**Independent Test**: Run `bun install && bun run src/index.ts` in apps/api and see success message with Swagger at `/swagger`

### Implementation for User Story 1

- [ ] T010 [P] [US1] Fix database connection error handling in apps/api/src/db/index.ts
- [ ] T011 [US1] Add startup health check endpoint GET /health in apps/api/src/index.ts
- [ ] T012 [US1] Add proper error messages for missing DATABASE_URL in apps/api/src/db/index.ts
- [ ] T013 [US1] Update apps/api/README.md with setup instructions from quickstart.md
- [ ] T014 [US1] Test backend startup: verify Swagger loads at http://localhost:3001/swagger

**Checkpoint**: At this point, User Story 1 is complete - backend starts successfully with Swagger

---

## Phase 4: User Story 2 - Frontend Runs Successfully (Priority: P1)

**Goal**: Frontend dev server starts and dashboard loads without errors

**Independent Test**: Run `bun install && bun run dev` in apps/web and access http://localhost:3000 without React errors

### Implementation for User Story 2

- [ ] T015 [P] [US2] Fix API fetch error handling in apps/web/lib/api.ts (better error messages)
- [ ] T016 [P] [US2] Add empty state component in apps/web/components/empty-state.tsx
- [ ] T017 [US2] Update dashboard page apps/web/app/page.tsx to handle empty states
- [ ] T018 [US2] Verify toast hook initialization in apps/web/hooks/use-toast.ts
- [ ] T019 [US2] Add error boundary in apps/web/app/error.tsx for graceful React error handling
- [ ] T020 [US2] Test frontend: verify dashboard loads with 4 KPI cards and no console errors

**Checkpoint**: At this point, User Stories 1 AND 2 are complete - full stack runs without errors

---

## Phase 5: User Story 3 - Database Migrations Apply Successfully (Priority: P1)

**Goal**: Database schema with all 11 tables and relations created successfully

**Independent Test**: Run `bun x drizzle-kit push` in apps/api and all tables are created without errors

### Implementation for User Story 3

- [ ] T021 [P] [US3] Add indexes to frequently queried columns in apps/api/src/db/schema.ts
- [ ] T022 [US3] Test migration: run drizzle-kit push and verify all 11 tables created
- [ ] T023 [US3] Verify foreign key constraints exist for all relations
- [ ] T024 [US3] Create migration verification script or document in docs/

**Checkpoint**: At this point, database schema is complete with proper relations

---

## Phase 6: User Story 4 - API Endpoints Return Data Without Errors (Priority: P2)

**Goal**: All API endpoints respond with HTTP 200 and valid JSON

**Independent Test**: Each GET endpoint returns valid JSON data without 500 errors

### Critical Bug Fixes

- [ ] T025 [P] [US4] Fix Agenda empty whereClause bug in apps/api/src/modules/agenda/agenda.controller.ts
- [ ] T026 [P] [US4] Fix Dashboard date comparison bug in apps/api/src/modules/dashboard/dashboard.controller.ts
- [ ] T027 [P] [US4] Fix Budget summary type casting in apps/api/src/modules/budget/budget.controller.ts
- [ ] T028 [P] [US4] Replace `as any` with proper enum types in apps/api/src/modules/leads/leads.controller.ts
- [ ] T029 [P] [US4] Replace `as any` with proper enum types in apps/api/src/modules/agenda/agenda.controller.ts
- [ ] T030 [P] [US4] Replace `as any` with proper enum types in apps/api/src/modules/budget/budget.controller.ts
- [ ] T031 [P] [US4] Replace `as any` with proper enum types in apps/api/src/modules/billing/billing.controller.ts
- [ ] T032 [US4] Fix Whitelabel config to use query builder instead of sql template in apps/api/src/modules/whitelabel/whitelabel.controller.ts
- [ ] T033 [US4] Standardize error response format across all controllers
- [ ] T034 [US4] Test all GET endpoints: /api/leads, /api/agenda/events, /api/budget, /api/billing, /api/dashboard/metrics

**Checkpoint**: All API endpoints return HTTP 200 with valid JSON

---

## Phase 7: User Story 5 - Frontend Pages Load Without Errors (Priority: P2)

**Goal**: All frontend pages render without React errors

**Independent Test**: Each route (/leads, /agenda, /finance, /budget, /settings) loads without console errors

### Implementation for User Story 5

- [ ] T035 [P] [US5] Add empty states to leads page apps/web/app/leads/page.tsx
- [ ] T036 [P] [US5] Add empty states to agenda page apps/web/app/agenda/page.tsx
- [ ] T037 [P] [US5] Add empty states to finance page apps/web/app/finance/page.tsx
- [ ] T038 [P] [US5] Add empty states to budget page apps/web/app/budget/page.tsx
- [ ] T039 [US5] Verify all pages handle API errors gracefully with toast notifications
- [ ] T040 [US5] Test all pages: /leads, /agenda, /finance, /budget, /settings - verify zero console errors

**Checkpoint**: All user stories complete - full application functional

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T041 [P] Add health check endpoint documentation to contracts/api-contracts.md
- [ ] T042 [P] Update main README.md with link to quickstart.md
- [ ] T043 Code cleanup: remove unused imports across all files
- [ ] T044 [P] Add Gitmoji to all commit messages created during implementation
- [ ] T045 Run quickstart.md validation: follow steps and verify setup completes in <10 minutes
- [ ] T046 [P] Add basic rate limiting middleware stub in apps/api/src/middleware/rate-limit.middleware.ts
- [ ] T047 [P] Add CORS configuration in apps/api/src/index.ts

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Backend startup - can start after Foundational - No dependencies on other stories
- **User Story 2 (P1)**: Frontend startup - can start after Foundational - Depends on US1 (backend must be running)
- **User Story 3 (P1)**: Database migrations - can start after Foundational - No dependencies on other stories
- **User Story 4 (P2)**: API endpoints - can start after Foundational - Depends on US3 (schema must exist)
- **User Story 5 (P2)**: Frontend pages - can start after Foundational - Depends on US2 and US4

### Within Each User Story

- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 1 (Setup)**: T001, T002, T003 can all run in parallel
- **Phase 2 (Foundational)**: T004, T005, T006, T008, T009 can run in parallel (different files)
- **Phase 3 (US1)**: T010 can run in parallel, T011-T014 sequential
- **Phase 4 (US2)**: T015, T016 can run in parallel, T017-T0020 sequential
- **Phase 5 (US3)**: T021 can run in parallel, T022-T024 sequential
- **Phase 6 (US4)**: T025, T026, T027, T028, T029, T030, T031, T032 can ALL run in parallel (different files!)
- **Phase 7 (US5)**: T035, T036, T037, T038 can run in parallel
- **Phase 8 (Polish)**: T041, T042, T044, T046, T047 can run in parallel

---

## Parallel Example: User Story 4 (Critical Bug Fixes)

```bash
# Launch all bug fixes in parallel (different files, no dependencies):
Task: "Fix Agenda empty whereClause bug in apps/api/src/modules/agenda/agenda.controller.ts"
Task: "Fix Dashboard date comparison bug in apps/api/src/modules/dashboard/dashboard.controller.ts"
Task: "Fix Budget summary type casting in apps/api/src/modules/budget/budget.controller.ts"
Task: "Replace as any with proper enum types in leads.controller.ts"
Task: "Replace as any with proper enum types in agenda.controller.ts"
Task: "Replace as any with proper enum types in budget.controller.ts"
Task: "Replace as any with proper enum types in billing.controller.ts"
Task: "Fix Whitelabel config query builder in whitelabel.controller.ts"
```

This is the **most parallelizable phase** - 8 bug fixes in 8 different files!

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T009)
3. Complete Phase 3: User Story 1 (T010-T014)
4. **STOP and VALIDATE**: Test backend startup
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Backend starts → Deploy/Demo (MVP!)
3. Add User Story 2 → Frontend loads → Deploy/Demo
4. Add User Story 3 → Migrations work → Deploy/Demo
5. Add User Story 4 → API endpoints work → Deploy/Demo
6. Add User Story 5 → All pages load → Deploy/Demo
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers/agents:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - **Backend Agent**: User Story 1, User Story 3, User Story 4 (critical bug fixes)
   - **Frontend Agent**: User Story 2, User Story 5 (empty states, error handling)
   - **DBA Agent**: User Story 3 (schema relations, indexes, migrations)
3. Phase 6 (US4) is HIGHLY parallelizable - 8 bugs can be fixed simultaneously!

---

## Task Summary

| Phase | Tasks | Count |
|-------|-------|-------|
| Phase 1: Setup | T001-T003 | 3 |
| Phase 2: Foundational | T004-T009 | 6 |
| Phase 3: US1 (Backend) | T010-T014 | 5 |
| Phase 4: US2 (Frontend) | T015-T020 | 6 |
| Phase 5: US3 (Migrations) | T021-T024 | 4 |
| Phase 6: US4 (API Bugs) | T025-T034 | 10 |
| Phase 7: US5 (Pages) | T035-T040 | 6 |
| Phase 8: Polish | T041-T047 | 7 |
| **Total** | | **47 tasks** |

### Parallel Opportunities

- **Maximum Parallelism**: Phase 6 (US4) - 8 tasks can run in parallel
- **Setup**: 3 tasks in parallel
- **Foundational**: 5 tasks in parallel
- **Polish**: 5 tasks in parallel

### MVP Scope (User Story 1 Only)

- **Minimum**: T001-T014 (14 tasks)
- **Deliverable**: Backend starts, Swagger works, database connects

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- **Phase 6 is the biggest win** - 8 critical bugs can be fixed in parallel
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

---

## Agent Assignment Suggestion

For maximum parallelism, assign agents as follows:

| Agent | Phases | Tasks |
|-------|--------|-------|
| **Backend Agent** | Phase 2, 3, 6 | T004-T009, T010-T014, T025-T034 (24 tasks) |
| **Frontend Agent** | Phase 4, 7 | T015-T020, T035-T040 (12 tasks) |
| **DBA Agent** | Phase 5 | T021-T024 (4 tasks) |
| **All Agents** | Phase 1, 8 | T001-T003, T041-T047 (10 tasks) |

**Total**: 47 tasks across 3 specialized agents

---

**Tasks Status**: ✅ Ready for implementation
**Estimated Effort**: Medium (47 tasks, 14 issues resolved)
**Parallelism**: High (Phase 6 has 8 parallel tasks)
**MVP**: 14 tasks (Phases 1-3)
