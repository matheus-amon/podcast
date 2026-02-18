<!--
SYNC IMPACT REPORT
==================
Version change: (none) → 1.0.0
Modified principles: (initial creation)
Added sections:
  - Core Principles (5 principles)
  - Development Workflow
  - Security & Compliance
  - Governance
Removed sections: (none)
Templates requiring updates:
  - .specify/templates/plan-template.md ✅ Constitution Check section aligns
  - .specify/templates/spec-template.md ✅ No conflicts
  - .specify/templates/tasks-template.md ✅ No conflicts
  - .specify/templates/commands/*.md ✅ No agent-specific references found
Follow-up TODOs: (none)
-->

# Podcast SaaS Constitution

## Core Principles

### I. API-First Backend

All features MUST be developed in the following order:

1. **API Contract First**: Define endpoints, request/response schemas in OpenAPI/Swagger
2. **Backend Implementation**: Implement API logic with ElysiaJS
3. **Database Schema**: Design and migrate database after API is functional
4. **UI Last**: Frontend consumes stable API

**Rationale**: This ensures backend stability before coupling to UI. API contracts serve as the source of truth, enabling parallel frontend work and reducing rework.

---

### II. E2E Testing

End-to-end tests are MANDATORY for all critical user flows:

- **Critical flows**: Agenda management, Lead conversion, Budget/Billing operations
- **Test coverage**: Full user journey from UI to database and back
- **CI integration**: E2E tests MUST pass before deployment

**Rationale**: E2E tests validate the complete system integration, catching issues that unit/integration tests miss. Focus on user-visible behavior ensures confidence in deployments.

---

### III. Minimalist Domain-Driven Design

Code organization follows simplified DDD principles:

- **Domain folders**: Organize by business capability (`agenda/`, `leads/`, `billing/`)
- **Separation**: Keep controllers, services, and repositories distinct within domains
- **Shared code**: Extract common utilities to `packages/shared` when used by 2+ domains
- **Avoid over-engineering**: No complex abstractions without clear, immediate need

**Rationale**: Domain organization improves discoverability and reduces cognitive load. Minimalist approach prevents premature optimization while maintaining clean architecture.

---

### IV. REST Conventions & OpenAPI

All APIs MUST follow REST conventions:

- **Naming**: Resource-based URLs (`/agendas`, `/leads`, `/budget`)
- **HTTP verbs**: GET (read), POST (create), PUT/PATCH (update), DELETE (remove)
- **Status codes**: 200 (success), 201 (created), 400 (bad request), 401/403 (auth), 404 (not found), 500 (server error)
- **Error format**: Consistent JSON structure `{ error: { code, message, details? } }`
- **Documentation**: All endpoints documented via Elysia OpenAPI plugin
- **Versioning**: Use `/v1/` prefix when breaking changes require versioning

**Rationale**: Conventions reduce cognitive load, improve API predictability, and enable auto-generated documentation for frontend consumers.

---

### V. Migration Discipline & Audit Logging

Database changes require strict discipline:

- **Migrations**: All schema changes via Drizzle Kit migrations
- **Review**: Migrations MUST be reviewed before applying to production
- **Audit fields**: All tables MUST include `created_at`, `updated_at` timestamps
- **Soft deletes**: Prefer soft deletes (`deleted_at`) for business-critical data

**Rationale**: Migration discipline prevents production incidents from schema drift. Audit logging enables debugging, compliance, and historical analysis.

---

## Development Workflow

### Git & Commits

- **Commit format**: Gitmoji Conventional Commits (`:emoji: type: description`)
- **Examples**:
  - `:sparkles: feat: add lead conversion endpoint`
  - `:bug: fix: agenda date parsing edge case`
  - `:memo: docs: update API authentication docs`
- **Branch naming**: `<number>-<type>-<description>` (e.g., `001-feat-agenda-api`)

### Code Review

- **PR requirements**: All changes require at least 1 review
- **CI checks**: Linting, type-checking, and E2E tests MUST pass
- **Constitution compliance**: Reviewers MUST verify adherence to these principles

### Environment Discipline

- **`.env` files**: NEVER commit `.env` files
- **Environment variables**: Use `.env.example` to document required variables
- **Secrets**: Store secrets in environment variables or secret manager, never in code

---

## Security & Compliance

All applications MUST implement:

- **Input validation**: Validate all user inputs at API boundaries (Zod or equivalent)
- **Rate limiting**: Apply rate limits to prevent abuse
- **CORS**: Configure strict CORS policies for API access
- **Authentication**: JWT-based auth with refresh token rotation
- **Authorization**: Role-based access control (RBAC) for sensitive operations
- **Error handling**: Never expose stack traces or internal errors to clients
- **Logging**: Structured logging with levels (error, warn, info, debug)

---

## Governance

**Amendment Process**:

1. Propose change via PR to `.specify/memory/constitution.md`
2. Document rationale in PR description
3. All stakeholders MUST review and approve
4. Update version according to semantic versioning
5. Merge and communicate changes to team

**Versioning Policy**:

- **MAJOR**: Backward-incompatible principle changes or removals
- **MINOR**: New principles or material expansions to existing guidance
- **PATCH**: Clarifications, wording improvements, typo fixes

**Compliance Review**:

- All PRs MUST be reviewed for constitution compliance
- Violations MUST be justified with explicit trade-off analysis
- Technical debt from violations MUST be tracked and addressed

**Version**: 1.0.0 | **Ratified**: 2026-02-18 | **Last Amended**: 2026-02-18
