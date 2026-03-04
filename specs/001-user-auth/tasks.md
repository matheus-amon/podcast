# Tasks: User Authentication with JWT

**Input**: Design documents from `/specs/001-user-auth/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: TDD-FIRST - All tests MUST be written BEFORE implementation code

**Organization**: Tasks organized by user story for independent implementation and testing

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., [US1], [US2], [US3])
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `apps/api/src/`, `apps/api/tests/`
- **Frontend**: `apps/web/src/`, `apps/web/tests/`
- Paths shown below are absolute from repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create backend directory structure: apps/api/src/domain/user/, apps/api/src/application/user/, apps/api/src/infrastructure/
- [ ] T002 Create frontend directory structure: apps/web/src/components/auth/, apps/web/src/app/login/, apps/web/src/app/register/
- [ ] T003 [P] Install backend dependencies: bcryptjs, jsonwebtoken, @elysiajs/swagger
- [ ] T004 [P] Install frontend dependencies: react-hook-form, @hookform/resolvers, zod

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 Create User database schema in apps/api/src/db/schema.ts (users table + refresh_tokens table)
- [ ] T006 Run drizzle-kit push to apply migrations
- [ ] T007 [P] Create JWT utility in apps/api/src/lib/jwt.ts (sign, verify, refresh functions)
- [ ] T008 [P] Create password utility in apps/api/src/lib/password.ts (hash, compare functions)
- [ ] T009 Create rate limiter middleware in apps/api/src/middleware/rate-limit.ts
- [ ] T010 Setup auth middleware in apps/api/src/middleware/auth.ts (JWT validation)
- [ ] T011 Create auth types in apps/api/src/types/auth.ts (RegisterRequest, LoginRequest, AuthResponse)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Register New Account (Priority: P1) 🎯 MVP

**Goal**: Allow visitors to create account with email and password

**Independent Test**: User can register with valid email/password and receive JWT tokens

### Tests for User Story 1 (TDD-FIRST) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T012 [P] [US1] Create Email VO test in apps/api/src/domain/user/value-objects/email.vo.test.ts
- [ ] T013 [P] [US1] Create Password VO test in apps/api/src/domain/user/value-objects/password.vo.test.ts
- [ ] T014 [P] [US1] Create User Entity test in apps/api/src/domain/user/entities/user.entity.test.ts
- [ ] T015 [P] [US1] Create Register Use Case test in apps/api/src/application/user/use-cases/register-user.use-case.test.ts
- [ ] T016 [P] [US1] Create User Repository test in apps/api/tests/unit/infrastructure/user-repository.adapter.test.ts
- [ ] T017 [P] [US1] Create Auth Controller test (register endpoint) in apps/api/src/infrastructure/http/adapters/auth.controller.test.ts
- [ ] T018 [P] [US1] Create E2E registration test in apps/api/tests/e2e/auth.e2e.test.ts
- [ ] T019 [P] [US1] Create Register Form test in apps/web/src/components/auth/register-form.test.tsx
- [ ] T020 [P] [US1] Create Register Page test in apps/web/src/app/register/page.test.tsx

### Implementation for User Story 1

- [ ] T021 [P] [US1] Create Email VO in apps/api/src/domain/user/value-objects/email.vo.ts (depends on T012)
- [ ] T022 [P] [US1] Create Password VO in apps/api/src/domain/user/value-objects/password.vo.ts (depends on T013)
- [ ] T023 [P] [US1] Create User Entity in apps/api/src/domain/user/entities/user.entity.ts (depends on T014)
- [ ] T024 [US1] Create User Repository Port in apps/api/src/domain/user/ports/user-repository.port.ts (depends on T023)
- [ ] T025 [US1] Implement Register Use Case in apps/api/src/application/user/use-cases/register-user.use-case.ts (depends on T015, T023, T024)
- [ ] T026 [US1] Implement User Repository Adapter in apps/api/src/infrastructure/database/adapters/user-repository.adapter.ts (depends on T016, T025)
- [ ] T027 [US1] Implement POST /auth/register endpoint in apps/api/src/infrastructure/http/adapters/auth.controller.ts (depends on T017, T025, T026)
- [ ] T028 [US1] Add OpenAPI documentation for /auth/register in apps/api/src/infrastructure/http/adapters/auth.controller.ts
- [ ] T029 [US1] Implement Register Form component in apps/web/src/components/auth/register-form.tsx (depends on T019)
- [ ] T030 [US1] Implement Register Page in apps/web/src/app/register/page.tsx (depends on T020, T029)
- [ ] T031 [US1] Add success/error toast notifications for registration in apps/web/src/hooks/use-toast.ts
- [ ] T032 [US1] Add redirect to dashboard after successful registration

**Checkpoint**: User Story 1 fully functional - users can register with email/password

---

## Phase 4: User Story 2 - Login with Credentials (Priority: P1) 🎯 MVP

**Goal**: Allow registered users to login and access protected areas

**Independent Test**: Registered user can login with valid credentials and receive JWT tokens

### Tests for User Story 2 (TDD-FIRST) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T033 [P] [US2] Create Login Use Case test in apps/api/src/application/user/use-cases/login-user.use-case.test.ts
- [ ] T034 [P] [US2] Create Auth Controller test (login endpoint) in apps/api/src/infrastructure/http/adapters/auth.controller.test.ts
- [ ] T035 [P] [US2] Create E2E login flow test in apps/api/tests/e2e/auth.e2e.test.ts (extends T018)
- [ ] T036 [P] [US2] Create Login Form test in apps/web/src/components/auth/login-form.test.tsx
- [ ] T037 [P] [US2] Create Login Page test in apps/web/src/app/login/page.test.tsx
- [ ] T038 [P] [US2] Create use-auth hook test in apps/web/src/hooks/use-auth.test.ts

### Implementation for User Story 2

- [ ] T039 [US2] Implement Login Use Case in apps/api/src/application/user/use-cases/login-user.use-case.ts (depends on T033, T023, T024)
- [ ] T040 [US2] Implement RefreshToken Entity in apps/api/src/domain/user/entities/refresh-token.entity.ts
- [ ] T041 [US2] Implement RefreshToken Repository in apps/api/src/infrastructure/database/adapters/refresh-token-repository.adapter.ts (depends on T040)
- [ ] T042 [US2] Implement POST /auth/login endpoint in apps/api/src/infrastructure/http/adapters/auth.controller.ts (depends on T034, T039, T041)
- [ ] T043 [US2] Add OpenAPI documentation for /auth/login in apps/api/src/infrastructure/http/adapters/auth.controller.ts
- [ ] T044 [US2] Implement Login Form component in apps/web/src/components/auth/login-form.tsx (depends on T036)
- [ ] T045 [US2] Implement Login Page in apps/web/src/app/login/page.tsx (depends on T037, T044)
- [ ] T046 [US2] Implement use-auth hook in apps/web/src/hooks/use-auth.ts (depends on T038)
- [ ] T047 [US2] Implement JWT storage (HTTP-only cookies) in apps/web/src/lib/auth/cookies.ts
- [ ] T048 [US2] Add redirect to dashboard after successful login

**Checkpoint**: User Story 2 fully functional - users can login and receive JWT tokens

---

## Phase 5: User Story 3 - Logout (Priority: P2)

**Goal**: Allow logged-in users to securely logout

**Independent Test**: Logged-in user can logout and session is invalidated

### Tests for User Story 3 (TDD-FIRST) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T049 [P] [US3] Create Logout Use Case test in apps/api/src/application/user/use-cases/logout-user.use-case.test.ts
- [ ] T050 [P] [US3] Create Auth Controller test (logout endpoint) in apps/api/src/infrastructure/http/adapters/auth.controller.test.ts
- [ ] T051 [P] [US3] Create E2E logout test in apps/api/tests/e2e/auth.e2e.test.ts (extends T035)

### Implementation for User Story 3

- [ ] T052 [US3] Implement Logout Use Case in apps/api/src/application/user/use-cases/logout-user.use-case.ts (depends on T049, T041)
- [ ] T053 [US3] Implement POST /auth/logout endpoint in apps/api/src/infrastructure/http/adapters/auth.controller.ts (depends on T050, T052)
- [ ] T054 [US3] Implement refresh token revocation in apps/api/src/infrastructure/database/adapters/refresh-token-repository.adapter.ts
- [ ] T055 [US3] Add logout button to TopBar component in apps/web/src/components/top-bar.tsx
- [ ] T056 [US3] Implement logout function in use-auth hook in apps/web/src/hooks/use-auth.ts (depends on T046)
- [ ] T057 [US3] Add redirect to login after logout

**Checkpoint**: User Story 3 fully functional - users can logout securely

---

## Phase 6: User Story 4 - Protected Routes (Priority: P2)

**Goal**: Protect routes that require authentication

**Independent Test**: Unauthenticated users are redirected to login

### Tests for User Story 4 (TDD-FIRST) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T058 [P] [US4] Create Auth Guard test in apps/api/tests/unit/middleware/auth.middleware.test.ts
- [ ] T059 [P] [US4] Create Protected Route test in apps/web/src/app/dashboard/page.test.tsx
- [ ] T060 [P] [US4] Create E2E protected route test in apps/api/tests/e2e/auth.e2e.test.ts (extends T051)

### Implementation for User Story 4

- [ ] T061 [US4] Implement Auth Guard middleware in apps/api/src/middleware/auth-guard.ts (depends on T058, T007)
- [ ] T062 [US4] Apply auth guard to protected routes in apps/api/src/index.ts
- [ ] T063 [US4] Implement GET /auth/me endpoint in apps/api/src/infrastructure/http/adapters/auth.controller.ts (depends on T061)
- [ ] T064 [US4] Add OpenAPI documentation for /auth/me in apps/api/src/infrastructure/http/adapters/auth.controller.ts
- [ ] T065 [US4] Create auth guard HOC in apps/web/src/lib/auth/with-auth.tsx (depends on T059)
- [ ] T066 [US4] Apply auth guard to /dashboard route in apps/web/src/app/dashboard/page.tsx
- [ ] T067 [US4] Implement redirect to login for unauthenticated users in apps/web/src/lib/auth/guards.ts

**Checkpoint**: User Story 4 fully functional - protected routes require authentication

---

## Phase 7: User Story 5 - Session Persistence (Priority: P3)

**Goal**: Persist user session across page refreshes

**Independent Test**: User remains logged in after page refresh

### Tests for User Story 5 (TDD-FIRST) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T068 [P] [US5] Create Token Refresh test in apps/api/src/application/user/use-cases/refresh-token.use-case.test.ts
- [ ] T069 [P] [US5] Create E2E session persistence test in apps/api/tests/e2e/auth.e2e.test.ts (extends T060)

### Implementation for User Story 5

- [ ] T070 [US5] Implement Refresh Token Use Case in apps/api/src/application/user/use-cases/refresh-token.use-case.ts (depends on T068, T041)
- [ ] T071 [US5] Implement POST /auth/refresh endpoint in apps/api/src/infrastructure/http/adapters/auth.controller.ts (depends on T070)
- [ ] T072 [US5] Add OpenAPI documentation for /auth/refresh in apps/api/src/infrastructure/http/adapters/auth.controller.ts
- [ ] T073 [US5] Implement token refresh interceptor in apps/web/src/lib/auth/interceptors.ts
- [ ] T074 [US5] Add session persistence logic in use-auth hook in apps/web/src/hooks/use-auth.ts (depends on T046)
- [ ] T075 [US5] Implement automatic token refresh on 401 responses

**Checkpoint**: User Story 5 fully functional - sessions persist across page refreshes

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final polish, security hardening, and documentation

- [ ] T076 Add rate limiting to /auth/login endpoint (5 attempts per minute)
- [ ] T077 Add rate limiting to /auth/register endpoint (3 attempts per minute)
- [ ] T078 Implement password strength meter UI in apps/web/src/components/auth/register-form.tsx
- [ ] T079 Add "forgot password" link (placeholder for future feature)
- [ ] T080 Add comprehensive error messages for all auth failures
- [ ] T081 Add logging for security events (failed logins, registrations)
- [ ] T082 Update OpenAPI documentation with all auth endpoints
- [ ] T083 Create README.md for auth module in apps/api/src/modules/auth/README.md
- [ ] T084 Run full test suite: bun test (backend) + bun test (frontend)
- [ ] T085 Run coverage report: bun test --coverage (target: >95%)
- [ ] T086 Run TypeScript check: bun run tsc --noEmit
- [ ] T087 Run E2E tests: bun test apps/api/tests/e2e/auth.e2e.test.ts
- [ ] T088 Security audit: verify password hashing, JWT rotation, rate limiting
- [ ] T089 Performance test: login < 3s (95th percentile)
- [ ] T090 Update QWEN.md with auth implementation details

---

## Dependency Graph

```
Phase 1: Setup (T001-T004)
    ↓
Phase 2: Foundational (T005-T011)
    ↓
Phase 3: US1 - Register (T012-T032) ← MVP
    ↓
Phase 4: US2 - Login (T033-T048)
    ↓
Phase 5: US3 - Logout (T049-T057)
    ↓
Phase 6: US4 - Protected Routes (T058-T067)
    ↓
Phase 7: US5 - Session Persistence (T068-T075)
    ↓
Phase 8: Polish (T076-T090)
```

---

## Parallel Execution Opportunities

### Within Phases (Parallel Tasks Marked with [P])

**Phase 1**:
- T003 (backend deps) + T004 (frontend deps) can run in parallel

**Phase 2**:
- T007 (JWT util) + T008 (password util) + T009 (rate limit) can run in parallel

**Phase 3 (US1)**:
- T012-T020 (all tests) can run in parallel
- T021-T023 (VOs + Entity) can run in parallel after tests pass
- T029-T030 (frontend) can run in parallel with backend

**Phase 4 (US2)**:
- T033-T038 (all tests) can run in parallel
- T044-T048 (frontend) can run in parallel with backend

### Across User Stories

**Independent Stories** (can be implemented in parallel by different developers):
- US1 (Register) → Must be first (foundational)
- US2 (Login) → Can start after US1 backend complete
- US3 (Logout) → Can start after US2 complete
- US4 (Protected Routes) → Can start after US2 complete (parallel with US3)
- US5 (Session Persistence) → Must be last (depends on all others)

---

## Implementation Strategy

### MVP Scope (User Story 1 Only)

For minimum viable product, implement only:
- T001-T011 (Setup + Foundation)
- T012-T032 (User Story 1 - Register)

**MVP delivers**: Users can register with email/password

### Incremental Delivery

**Increment 1** (US1 + US2):
- Full registration + login flow
- Users can register and login

**Increment 2** (US1 + US2 + US3):
- Add logout functionality
- Complete auth lifecycle

**Increment 3** (US1 + US2 + US3 + US4):
- Add protected routes
- Secure dashboard access

**Increment 4** (All Stories):
- Add session persistence
- Full-featured authentication

---

## Task Summary

| Phase | User Story | Task Count | Test Count | Implementation Count |
|-------|------------|------------|------------|---------------------|
| 1 | Setup | 4 | 0 | 4 |
| 2 | Foundational | 7 | 0 | 7 |
| 3 | US1 - Register | 21 | 9 | 12 |
| 4 | US2 - Login | 16 | 6 | 10 |
| 5 | US3 - Logout | 9 | 3 | 6 |
| 6 | US4 - Protected | 10 | 3 | 7 |
| 7 | US5 - Session | 8 | 2 | 6 |
| 8 | Polish | 15 | 0 | 15 |
| **Total** | **All** | **90** | **23** | **67** |

**Test Ratio**: 23/90 = 25.5% (TDD-first: tests written before implementation)

---

## Format Validation

✅ ALL tasks follow the checklist format:
- Checkbox: `- [ ]`
- Task ID: T001, T002, T003...
- [P] marker: For parallelizable tasks
- [Story] label: For user story phase tasks ([US1], [US2], etc.)
- File paths: Exact file paths for all implementation tasks

✅ All user stories are independently testable
✅ Dependencies clearly marked
✅ Parallel opportunities identified
✅ MVP scope defined
✅ Incremental delivery plan provided

---

**Ready for TDD implementation!** 🧪
