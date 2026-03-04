# Implementation Plan: User Authentication with JWT

**Branch**: `001-user-auth` | **Date**: 2026-03-03 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification for user authentication with JWT (login, cadastro, frontend + backend)

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Implementar autenticação completa de usuários com JWT para Podcast SaaS, incluindo:
- Backend: API de registro, login, logout com JWT (ElysiaJS + Bun)
- Frontend: Telas de login e cadastro (Next.js + React Hook Form)
- Segurança: Password hashing, rate limiting, protected routes
- **TDD-First**: Testes unitários E2E escritos ANTES da implementação

## Technical Context

**Language/Version**: TypeScript 5.x (Bun 1.3.6 runtime)
**Primary Dependencies**: 
  - Backend: ElysiaJS 1.4, bcryptjs, jsonwebtoken
  - Frontend: Next.js 16, React Hook Form 7.x, Zod 4.x
**Storage**: PostgreSQL 15 (via Drizzle ORM) - tabela `users`
**Testing**: 
  - Backend: Bun test (unitários) + E2E tests (obrigatório por constituição)
  - Frontend: Vitest + React Testing Library
**Target Platform**: Web application (monorepo apps/api + apps/web)
**Project Type**: Web application (frontend + backend)
**Performance Goals**: 
  - Login < 3 segundos (95% requests)
  - Registro < 2 minutos (user-facing)
  - 1000 req/s concurrent logins
**Constraints**: 
  - JWT refresh token rotation (segurança)
  - Rate limiting: 5 tentativas/minuto
  - Password hashing: bcrypt (10 rounds minimum)
**Scale/Scope**: 
  - 10k usuários concurrentes
  - 2 telas frontend (login, cadastro)
  - 4 endpoints backend (register, login, logout, me)

## Constitution Check

**GATE 1: API-First Backend** ✅ PASS
- [x] API contract defined first (OpenAPI/Swagger)
- [x] Backend implementation before frontend
- [x] Database schema after API functional
- [x] UI consumes stable API

**GATE 2: E2E Testing** ✅ PASS
- [x] E2E tests planned for critical flows (login, registro)
- [x] Full user journey from UI to database
- [x] CI integration planned

**GATE 3: REST Conventions** ✅ PASS
- [x] Resource-based URLs (`/auth/register`, `/auth/login`, `/auth/logout`)
- [x] Standard HTTP verbs (POST for create operations)
- [x] Consistent error format `{ error: { code, message } }`
- [x] OpenAPI documentation via Elysia plugin

**GATE 4: Security & Compliance** ✅ PASS
- [x] Input validation with Zod
- [x] Rate limiting planned
- [x] JWT with refresh token rotation
- [x] Password hashing (bcrypt)
- [x] No stack traces in errors

**GATE 5: TDD-First (User Requirement)** ✅ PASS
- [x] Tests written BEFORE implementation
- [x] Unit tests for entities/use cases
- [x] E2E tests for critical flows

## Project Structure

### Documentation (this feature)

```text
specs/001-user-auth/
├── plan.md              # This file
├── research.md          # Phase 0 output (TDD research)
├── data-model.md        # Phase 1 output (User entity)
├── quickstart.md        # Phase 1 output (setup guide)
├── contracts/           # Phase 1 output (OpenAPI specs)
└── tasks.md             # Phase 2 output (task breakdown)
```

### Source Code (repository root)

```text
backend (apps/api)/
├── src/
│   ├── domain/
│   │   └── user/
│   │       ├── entities/
│   │       │   └── user.entity.ts       # User entity + tests
│   │       ├── value-objects/
│   │       │   ├── email.vo.ts          # Email VO + tests
│   │       │   └── password.vo.ts       # Password VO + tests
│   │       └── ports/
│   │           └── user-repository.port.ts
│   ├── application/
│   │   └── user/
│   │       ├── use-cases/
│   │       │   ├── register-user.use-case.ts    # + tests FIRST
│   │       │   ├── login-user.use-case.ts       # + tests FIRST
│   │       │   └── logout-user.use-case.ts      # + tests FIRST
│   │       └── dtos/
│   ├── infrastructure/
│   │   ├── database/
│   │   │   └── user-repository.adapter.ts # + integration tests
│   │   └── http/
│   │       └── auth.controller.ts         # + contract tests
│   └── modules/
│       └── auth/
│           └── auth.module.ts
└── tests/
    ├── e2e/
    │   ├── auth.e2e.test.ts             # E2E tests FIRST
    │   └── fixtures/
    └── unit/
        └── domain/
            └── user/

frontend (apps/web)/
├── src/
│   ├── app/
│   │   ├── login/
│   │   │   └── page.tsx                 # + tests FIRST
│   │   └── register/
│   │       └── page.tsx                 # + tests FIRST
│   ├── components/
│   │   └── auth/
│   │       ├── login-form.tsx           # + tests FIRST
│   │       └── register-form.tsx        # + tests FIRST
│   ├── hooks/
│   │   └── use-auth.ts                  # + tests FIRST
│   └── lib/
│       └── auth/
│           ├── jwt.ts                   # + tests FIRST
│           └── session.ts               # + tests FIRST
└── tests/
    └── components/
        └── auth/
```

**Structure Decision**: Web application structure (backend + frontend) with TDD-first approach. Tests co-located with source files, E2E tests in dedicated directory.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
