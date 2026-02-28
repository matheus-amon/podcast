# Implementation Plan: Refatoração para Arquitetura Hexagonal e Remoção do Frontend

**Branch**: `001-hexagonal-backend-refactor` | **Date**: 2026-02-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-hexagonal-backend-refactor/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Refatorar o backend atual para arquitetura hexagonal (ports e adapters) com dependências em DAG para garantir que novas features não quebrem funcionalidades existentes, e remover completamente o frontend (`apps/web`) para iniciar do zero em spec separada. A stack tecnológica permanece: Bun 1.3.6 + ElysiaJS 1.4 + Drizzle ORM 0.45 + TypeScript 5.x + PostgreSQL 15.

## Technical Context

**Language/Version**: TypeScript 5.x
**Primary Dependencies**: Bun 1.3.6, ElysiaJS 1.4, Drizzle ORM 0.45
**Storage**: PostgreSQL 15 (via docker-compose)
**Testing**: Bun test (nativo) + testes de integração E2E
**Target Platform**: Linux server (produção), desenvolvimento local via Docker
**Project Type**: backend-only (frontend removido)
**Performance Goals**: Build <30s, endpoints <200ms p95, 1000 req/s
**Constraints**: Manter todos os endpoints existentes funcionais, zero dependências circulares, DAG estrito entre módulos
**Scale/Scope**: 6 módulos de negócio (leads, agenda, budget, billing, dashboard, whitelabel), ~2000 LOC backend

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Gate 1: API-First Backend ✅
- **Principle**: API → Database → UI
- **Justification**: Esta refatoração foca APENAS no backend (API). Frontend será removido e desenvolvido em spec separada.
- **Status**: PASS - Alinhado com princípio I

### Gate 2: E2E Testing ⚠️
- **Principle**: E2E tests obrigatórios para fluxos críticos
- **Justification**: Refatoração deve preservar testes existentes. Novos testes de integração serão necessários para validar arquitetura hexagonal.
- **Status**: PASS COM RESALVA - Testes atuais serão mantidos, novos testes serão criados na fase de implementação

### Gate 3: Minimalist DDD ✅
- **Principle**: Domain folders, separação controller/service/repository, evitar over-engineering
- **Justification**: Arquitetura hexagonal é evolução natural do DDD minimalista já adotado. Ports = interfaces de domínio, Adapters = implementations.
- **Status**: PASS - Alinhado com princípio III

### Gate 4: REST Conventions & OpenAPI ✅
- **Principle**: REST padrão, OpenAPI documentado
- **Justification**: Refatoração NÃO altera contratos de API. Endpoints permanecem os mesmos.
- **Status**: PASS - Alinhado com princípio IV

### Gate 5: Migration Discipline & Audit Logging ✅
- **Principle**: Migrations via Drizzle Kit, audit fields
- **Justification**: Schema do banco NÃO será alterado nesta refatoração.
- **Status**: PASS - Alinhado com princípio V

**Overall**: ✅ PASS - Todas as gates aprovadas. Refatoração é compatível com a constituição.

## Project Structure

### Documentation (this feature)

```text
specs/001-hexagonal-backend-refactor/
├── plan.md              # Este arquivo
├── research.md          # Phase 0 output (arquitetura hexagonal + DAG)
├── data-model.md        # Phase 1 output (entidades de domínio)
├── quickstart.md        # Phase 1 output (setup backend)
├── contracts/           # Phase 1 output (OpenAPI endpoints)
└── tasks.md             # Phase 2 output (criado por /speckit.tasks)
```

### Source Code (repository root)

```text
apps/api/
├── src/
│   ├── domain/              # Nova: Domain layer (entities, value objects, ports)
│   │   ├── common/          # Entities e ports compartilhados
│   │   ├── leads/           # Domain: Leads entities + ports
│   │   ├── agenda/          # Domain: Agenda entities + ports
│   │   ├── budget/          # Domain: Budget entities + ports
│   │   ├── billing/         # Domain: Billing entities + ports
│   │   ├── dashboard/       # Domain: Dashboard entities + ports
│   │   └── whitelabel/      # Domain: Whitelabel entities + ports
│   │
│   ├── application/         # Nova: Application layer (use cases, services)
│   │   ├── leads/           # Use cases: CreateLead, UpdateLead, etc.
│   │   ├── agenda/          # Use cases: CreateEvent, ListEvents, etc.
│   │   ├── budget/          # Use cases: CreateBudget, CalculateTotal, etc.
│   │   ├── billing/         # Use cases: GenerateInvoice, ProcessPayment, etc.
│   │   ├── dashboard/       # Use cases: GetMetrics, GetStats, etc.
│   │   └── whitelabel/      # Use cases: GetConfig, UpdateConfig, etc.
│   │
│   ├── infrastructure/      # Nova: Infrastructure layer (adapters)
│   │   ├── http/            # HTTP adapters (Elysia controllers)
│   │   ├── database/        # Database adapters (Drizzle repositories)
│   │   ├── cache/           # Cache adapters (Redis, memory)
│   │   └── external/        # External API adapters
│   │
│   ├── modules/             # Legado: Será refatorado para domain/application
│   │   ├── leads/           # Controller atual → migrar para infrastructure/http
│   │   ├── agenda/          # Controller atual → migrar para infrastructure/http
│   │   ├── budget/          # Controller atual → migrar para infrastructure/http
│   │   ├── billing/         # Controller atual → migrar para infrastructure/http
│   │   ├── dashboard/       # Controller atual → migrar para infrastructure/http
│   │   └── whitelabel/      # Controller atual → migrar para infrastructure/http
│   │
│   ├── middleware/          # Middleware (error, logger, auth)
│   │   ├── error.middleware.ts
│   │   ├── logger.middleware.ts
│   │   └── auth.middleware.ts
│   │
│   ├── db/                  # Database (schema, migrations, connection)
│   │   ├── schema.ts        # Drizzle schema (inalterado)
│   │   └── index.ts         # DB connection
│   │
│   └── index.ts             # Entry point (composição DI)
│
├── tests/
│   ├── unit/                # Testes unitários (use cases, entities)
│   ├── integration/         # Testes de integração (adapters, repositories)
│   └── e2e/                 # Testes E2E (API completa)
│
├── package.json
└── tsconfig.json

packages/                    # Remover: Não haverá código compartilhado frontend/backend
└── (vazio ou removido)

apps/web/                    # REMOVIDO: Frontend será desenvolvido em spec separada
└── (diretório deletado)
```

**Structure Decision**: 
- Backend-only com arquitetura hexagonal em 3 camadas (domain, application, infrastructure)
- Frontend (`apps/web`) completamente removido
- `packages/` será avaliado: se vazio ou apenas frontend, remover
- Módulos atuais (`modules/`) serão refatorados gradualmente para nova estrutura
- DAG será garantido por convenção de imports e revisão de código

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| **Arquitetura hexagonal (3 camadas)** | Necessário para garantir DAG e prevenir que novas features quebrem existentes | Manter estrutura atual (modules/) não previne dependências circulares e dificulta testes unitários |
| **Ports e adapters para cada módulo** | Necessário para inversão de dependência e testabilidade | Usar Active Record (Drizzle direto) acopla domain com infrastructure, impedindo evolução independente |
| **Refatoração gradual (módulo por módulo)** | Necessário para reduzir risco e permitir rollback | Big Bang (refatorar tudo de uma vez) é arriscado, longo sem entrega, e impossível de fazer rollback |

**Nota**: Estas "violações" de complexidade são justificadas porque:
1. Arquitetura hexagonal é o **core requirement** desta feature (FR-001 a FR-004)
2. Sem ports/adapters, não há como garantir DAG estrito
3. Refatoração gradual é a única forma segura de migrar sistema em produção
4. Complexidade é **intrínseca ao problema**, não é over-engineering

## Phase 2: Implementation Tasks

**Status**: Ready for `/speckit.tasks` command

### Tarefas a Serem Criadas

A fase de implementação será quebrada nas seguintes tarefas (serão detalhadas em `tasks.md`):

#### Epic 1: Estrutura Base
- [ ] Criar diretórios: `domain/`, `application/`, `infrastructure/`
- [ ] Configurar tsconfig paths para imports
- [ ] Criar entities base do módulo Leads (piloto)

#### Epic 2: Módulo Leads (Piloto)
- [ ] Criar ports do módulo Leads
- [ ] Criar use cases do módulo Leads
- [ ] Criar adapters do módulo Leads
- [ ] Migrar controller atual para infrastructure/http
- [ ] Testar endpoints do módulo Leads

#### Epic 3: Módulos Restantes
- [ ] Refatorar módulo Agenda
- [ ] Refatorar módulo Budget
- [ ] Refatorar módulo Billing
- [ ] Refatorar módulo Dashboard
- [ ] Refatorar módulo Whitelabel

#### Epic 4: Limpeza
- [ ] Remover diretório `modules/` (legado)
- [ ] Remover diretório `apps/web/` (frontend)
- [ ] Limpar `packages/` (se vazio)
- [ ] Atualizar documentação

#### Epic 5: Validação
- [ ] Rodar todos os testes
- [ ] Verificar DAG (zero dependências circulares)
- [ ] Testar todos os endpoints
- [ ] Revisar documentação

---

**Próximo Comando**: `/speckit.tasks` para quebrar em tarefas executáveis
