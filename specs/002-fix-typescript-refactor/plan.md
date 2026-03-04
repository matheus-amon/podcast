# Implementation Plan: Refatoração com TDD e Princípios SOLID

**Branch**: `002-fix-typescript-refactor` | **Date**: 2026-02-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-fix-typescript-refactor/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Refatorar código legado e corrigir bugs de TypeScript aplicando TDD (Test-Driven Development) com mínimo de 95% de cobertura de testes, seguindo princípios SOLID e arquitetura hexagonal. Abordagem: testes primeiro, depois implementação, validação quando todos testes passarem.

## Technical Context

**Language/Version**: TypeScript 5.x
**Primary Dependencies**: Bun 1.3.6, ElysiaJS 1.4, Drizzle ORM 0.45
**Storage**: PostgreSQL 15 (via docker-compose)
**Testing**: Bun test (nativo) - TDD approach com 95%+ coverage
**Target Platform**: Linux server (produção), desenvolvimento local via Docker
**Project Type**: backend-only (monorepo: apps/api)
**Performance Goals**: Build <30s, testes <5min, 95%+ code coverage
**Constraints**: Zero regressão de endpoints, TypeScript strict mode sem erros, módulos legados refatorados um por vez
**Scale/Scope**: 5 módulos para refatorar (Agenda, Budget, Billing, Dashboard, Whitelabel), ~2000 LOC legado

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Gate 1: API-First Backend ✅
- **Principle**: API → Database → UI
- **Justification**: Refatoração mantém contratos de API existentes. TDD foca em testes de API antes de implementar.
- **Status**: PASS - Alinhado com princípio I

### Gate 2: E2E Testing ✅
- **Principle**: E2E tests obrigatórios para fluxos críticos
- **Justification**: TDD com 95% coverage inclui unitários, integração e E2E. Fluxos críticos (Agenda, Budget, Billing) terão testes E2E.
- **Status**: PASS - Alinhado com princípio II (teste mandatório)

### Gate 3: Minimalist DDD ✅
- **Principle**: Domain folders, separação controller/service/repository
- **Justificação**: Refatoração aplica DDD minimalista com arquitetura hexagonal. TDD garante que cada módulo tenha responsabilidades claras.
- **Status**: PASS - Alinhado com princípio III

### Gate 4: REST Conventions & OpenAPI ✅
- **Principle**: REST padrão, OpenAPI documentado
- **Justificação**: Refatoração não altera contratos de API. Testes de contrato validam conformidade REST.
- **Status**: PASS - Alinhado com princípio IV

### Gate 5: Migration Discipline & Audit Logging ✅
- **Principle**: Migrations via Drizzle Kit, audit fields
- **Justificação**: Schema não será alterado. Testes validam persistência e audit logging.
- **Status**: PASS - Alinhado com princípio V

**Overall**: ✅ PASS - Todas as gates aprovadas. TDD é compatível com a constituição.

## Project Structure

### Documentation (this feature)

```text
specs/002-fix-typescript-refactor/
├── plan.md              # Este arquivo
├── research.md          # Phase 0 output (TDD best practices, SOLID patterns)
├── data-model.md        # Phase 1 output (entidades dos módulos)
├── quickstart.md        # Phase 1 output (setup e rodar testes)
├── contracts/           # Phase 1 output (API contracts existentes)
└── tasks.md             # Phase 2 output (criado por /speckit.tasks)
```

### Source Code (repository root)

```text
apps/api/
├── src/
│   ├── domain/              # Domain layer (refatorado)
│   │   ├── common/          # Entities e ports compartilhados
│   │   ├── agenda/          # Domain: Agenda entities + ports
│   │   ├── budget/          # Domain: Budget entities + ports
│   │   ├── billing/         # Domain: Billing entities + ports
│   │   ├── dashboard/       # Domain: Dashboard entities + ports
│   │   └── whitelabel/      # Domain: Whitelabel entities + ports
│   │
│   ├── application/         # Application layer (refatorado)
│   │   ├── agenda/          # Use cases
│   │   ├── budget/          # Use cases
│   │   ├── billing/         # Use cases
│   │   ├── dashboard/       # Use cases
│   │   └── whitelabel/      # Use cases
│   │
│   ├── infrastructure/      # Infrastructure layer (refatorado)
│   │   ├── http/            # HTTP adapters (controllers)
│   │   ├── database/        # Database adapters (repositories)
│   │   └── external/        # External API adapters
│   │
│   ├── modules/             # Legado (será removido após refatoração)
│   │   ├── agenda/          # Controller atual → refatorar
│   │   ├── budget/          # Controller atual → refatorar
│   │   ├── billing/         # Controller atual → refatorar
│   │   ├── dashboard/       # Controller atual → refatorar
│   │   └── whitelabel/      # Controller atual → refatorar
│   │
│   ├── middleware/          # Middleware (error, logger, auth)
│   ├── db/                  # Database (schema, connection)
│   └── index.ts             # Entry point
│
├── tests/
│   ├── unit/                # Testes unitários (TDD: escritos primeiro)
│   │   ├── domain/          # Entity tests
│   │   ├── application/     # Use case tests
│   │   └── infrastructure/  # Adapter tests
│   ├── integration/         # Testes de integração (TDD: escritos segundo)
│   │   ├── api/             # API endpoint tests
│   │   └── repository/      # Repository integration tests
│   └── e2e/                 # Testes E2E (TDD: escritos terceiro)
│       └── flows/           # Critical user journey tests
│
├── package.json
├── tsconfig.json
└── bunfig.toml              # Test configuration (coverage threshold)

```

**Structure Decision**:
- TDD structure: testes escritos antes da implementação
- 95% coverage threshold configurado no bunfig.toml
- Módulos legados em `modules/` até serem refatorados
- Após refatoração de cada módulo, `modules/` é removido
- SOLID principles aplicados em cada camada

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| **TDD com 95% coverage** | Necessário para garantir qualidade da refatoração e prevenir regressões | Refatorar sem testes é arriscado e pode introduzir bugs silenciosos |
| **Refatoração módulo por módulo** | Necessário para manter sistema funcional durante transição | Big Bang refatoração é muito arriscada e longa sem entrega |
| **Testes E2E para fluxos críticos** | Mandatório pela constituição (principle II) | Apenas testes unitários não validam integração completa |

**Nota**: Estas "violações" de complexidade são justificadas porque:
1. TDD é investimento em qualidade a longo prazo
2. 95% coverage é padrão da indústria para código crítico
3. Refatoração incremental reduz risco de produção
4. Constituição exige E2E testing para fluxos críticos

## Phase 2: Implementation Tasks

**Status**: Ready for `/speckit.tasks` command

### Tarefas a Serem Criadas

A fase de implementação será quebrada nas seguintes tarefas (serão detalhadas em `tasks.md`):

#### Epic 1: Setup TDD Infrastructure
- [ ] Configurar bunfig.toml com 95% coverage threshold
- [ ] Criar estrutura de diretórios de testes (unit/, integration/, e2e/)
- [ ] Criar testes base para entidades e ports compartilhados

#### Epic 2: Módulo Agenda (TDD)
- [ ] Escrever testes unitários para Agenda entity
- [ ] Escrever testes para Agenda ports
- [ ] Implementar Agenda entity e ports (testes primeiro)
- [ ] Escrever testes de integração para Agenda repository
- [ ] Implementar Agenda repository adapter
- [ ] Escrever testes de API para Agenda endpoints
- [ ] Implementar Agenda controller
- [ ] Validar 95%+ coverage do módulo

#### Epic 3: Módulo Budget (TDD)
- [ ] Escrever testes unitários para Budget entities
- [ ] Implementar Budget entities e ports
- [ ] Escrever testes de integração para Budget repository
- [ ] Implementar Budget repository adapter
- [ ] Escrever testes de API para Budget endpoints
- [ ] Implementar Budget controller
- [ ] Validar 95%+ coverage do módulo

#### Epic 4: Módulos Billing, Dashboard, Whitelabel (TDD)
- [ ] Repetir padrão TDD para cada módulo
- [ ] Manter 95%+ coverage em todos

#### Epic 5: Limpeza e Validação Final
- [ ] Remover diretório modules/ (legado)
- [ ] Rodar todos os testes e validar 95%+ coverage geral
- [ ] Validar zero erros TypeScript
- [ ] Validar todos os endpoints funcionais

---

**Próximo Comando**: `/speckit.tasks` para quebrar em tarefas executáveis

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
