# Tasks: Refatoração com TDD e Princípios SOLID

**Input**: Design documents from `/specs/002-fix-typescript-refactor/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Testes são OBRIGATÓRIOS - Feature exige TDD com 95%+ coverage

**Organization**: Tarefas organizadas por user story para permitir implementação e teste independentes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependências)
- **[Story]**: Qual user story esta tarefa pertence (US1, US2, US3)
- Incluir caminhos exatos de arquivos nas descrições

---

## Phase 1: Setup (Infraestrutura Compartilhada)

**Purpose**: Configurar infraestrutura de testes TDD e estrutura de diretórios

- [x] T001 [P] Criar bunfig.toml com coverage threshold de 95% em `apps/api/bunfig.toml`
- [x] T002 [P] Criar estrutura de diretórios de testes em `apps/api/tests/unit/`, `apps/api/tests/integration/`, `apps/api/tests/e2e/`
- [x] T003 [P] Criar arquivo de setup de testes em `apps/api/tests/setup.ts`
- [x] T004 [P] Configurar scripts de teste em `apps/api/package.json`
- [x] T005 [P] Criar utilities de teste (mocks, helpers) em `apps/api/tests/utils/`

---

## Phase 2: Foundational (Pré-requisitos Bloqueantes)

**Purpose**: Infraestrutura core que DEVE estar pronta antes de QUALQUER user story

**⚠️ CRÍTICO**: Nenhuma user story pode começar até esta fase estar completa

- [x] T006 [P] Fix implicit any types em `apps/api/src/db/index.ts` (export type explícito)
- [x] T007 [P] Criar types compartilhados em `apps/api/src/domain/common/types.ts`
- [x] T008 [P] Criar base entity test em `apps/api/tests/unit/domain/common/base-entity.test.ts`
- [x] T009 [P] Configurar database de teste em `apps/api/tests/utils/test-database.ts`
- [x] T010 [P] Criar mocks reutilizáveis em `apps/api/tests/mocks/`
- [x] T011 [P] Validar zero erros TypeScript em módulos compartilhados

**Checkpoint**: Fundação pronta - implementação das user stories pode começar

---

## Phase 3: User Story 1 - Compilar projeto sem erros de TypeScript (Priority: P1) 🎯 MVP

**Goal**: Corrigir todos os erros de TypeScript restantes, garantindo compilação limpa

**Independent Test**: `bun x tsc --noEmit` retorna 0 erros

### Tests for User Story 1

- [x] T012 [P] [US1] Criar teste de compilação TypeScript em `apps/api/tests/compilation.test.ts`
- [x] T013 [P] [US1] Identificar todos erros TypeScript restantes (rodar `tsc --noEmit`)

### Implementation for User Story 1 - Módulo Agenda

- [x] T014 [P] [US1] Fix implicit any em `apps/api/src/modules/agenda/agenda.controller.ts` (import type do db)
- [x] T015 [P] [US1] Criar types para Agenda em `apps/api/src/modules/agenda/agenda.types.ts`
- [x] T016 [US1] Corrigir type mismatches em `apps/api/src/modules/agenda/agenda.controller.ts`
- [x] T017 [US1] Validar módulo Agenda compila sem erros

### Implementation for User Story 1 - Módulo Budget

- [x] T018 [P] [US1] Fix implicit any em `apps/api/src/modules/budget/budget.controller.ts`
- [x] T019 [P] [US1] Criar types para Budget em `apps/api/src/modules/budget/budget.types.ts`
- [x] T020 [US1] Corrigir type mismatches em `apps/api/src/modules/budget/budget.controller.ts`
- [x] T021 [US1] Validar módulo Budget compila sem erros

### Implementation for User Story 1 - Módulo Billing

- [x] T022 [P] [US1] Fix implicit any em `apps/api/src/modules/billing/billing.controller.ts`
- [x] T023 [P] [US1] Criar types para Billing em `apps/api/src/modules/billing/billing.types.ts`
- [x] T024 [US1] Corrigir type mismatches em `apps/api/src/modules/billing/billing.controller.ts`
- [x] T025 [US1] Validar módulo Billing compila sem erros

### Implementation for User Story 1 - Módulo Dashboard

- [x] T026 [P] [US1] Fix implicit any em `apps/api/src/modules/dashboard/dashboard.controller.ts`
- [x] T027 [P] [US1] Criar types para Dashboard em `apps/api/src/modules/dashboard/dashboard.types.ts`
- [x] T028 [US1] Corrigir type mismatches em `apps/api/src/modules/dashboard/dashboard.controller.ts`
- [x] T029 [US1] Validar módulo Dashboard compila sem erros

### Implementation for User Story 1 - Módulo Whitelabel

- [x] T030 [P] [US1] Fix implicit any em `apps/api/src/modules/whitelabel/whitelabel.controller.ts`
- [x] T031 [P] [US1] Criar types para Whitelabel em `apps/api/src/modules/whitelabel/whitelabel.types.ts`
- [x] T032 [US1] Corrigir type mismatches em `apps/api/src/modules/whitelabel/whitelabel.controller.ts`
- [x] T033 [US1] Validar módulo Whitelabel compila sem erros

### Validation for User Story 1

- [x] T034 [US1] Rodar `bun x tsc --noEmit` e validar zero erros (código de produção)
- [x] T035 [US1] Rodar `bun test` e validar todos testes passam
- [x] T036 [US1] Documentar erros corrigidos em `docs/typescript-fixes.md`

**Checkpoint**: Projeto compila sem erros TypeScript - MVP entregue

---

## Phase 4: User Story 2 - Refatorar módulos para arquitetura hexagonal (Priority: P2)

**Goal**: Refatorar todos os módulos restantes (Agenda, Budget, Billing, Dashboard, Whitelabel) seguindo arquitetura hexagonal

**Independent Test**: Cada módulo tem estrutura domain/, application/, infrastructure/ separada

### Refatoração Módulo Agenda (TDD)

#### Tests First (Red)
- [x] T037 [P] [US2] Criar teste para Agenda entity em `apps/api/tests/unit/domain/agenda/agenda-event.test.ts`
- [ ] T038 [P] [US2] Criar teste para Agenda use cases em `apps/api/tests/unit/application/agenda/create-event.use-case.test.ts`
- [ ] T039 [P] [US2] Criar teste para Agenda repository em `apps/api/tests/integration/database/agenda-repository.test.ts`
- [ ] T040 [P] [US2] Criar teste para Agenda API em `apps/api/tests/integration/api/agenda.api.test.ts`

#### Implementation (Green)
- [x] T041 [P] [US2] Criar AgendaEvent entity em `apps/api/src/domain/agenda/entities/agenda-event.entity.ts`
- [x] T042 [P] [US2] Criar value objects (DateRange, EventType, EventStatus) em `apps/api/src/domain/agenda/value-objects/`
- [x] T043 [P] [US2] Criar AgendaRepositoryPort e AgendaServicePort em `apps/api/src/domain/agenda/ports/`
- [ ] T044 [US2] Criar use cases (CreateEvent, UpdateEvent, CancelEvent) em `apps/api/src/application/agenda/use-cases/`
- [ ] T045 [P] [US2] Criar PostgresAgendaRepository em `apps/api/src/infrastructure/database/adapters/agenda-repository.adapter.ts`
- [ ] T046 [P] [US2] Criar AgendaController em `apps/api/src/infrastructure/http/adapters/agenda.controller.ts`
- [ ] T047 [US2] Atualizar index.ts para usar novo módulo Agenda
- [ ] T048 [US2] Validar 95%+ coverage do módulo Agenda

#### Refactor
- [ ] T049 [US2] Refatorar Agenda entity (extrair value objects, melhorar validações)
- [ ] T050 [US2] Refatorar use cases (aplicar SRP, melhorar nomes)

### Refatoração Módulo Budget (TDD)

#### Tests First (Red)
- [ ] T051 [P] [US2] Criar testes para Budget entities em `apps/api/tests/unit/domain/budget/`
- [ ] T052 [P] [US2] Criar testes para Budget use cases em `apps/api/tests/unit/application/budget/`
- [ ] T053 [P] [US2] Criar testes para Budget repository em `apps/api/tests/integration/database/budget-repository.test.ts`
- [ ] T054 [P] [US2] Criar testes para Budget API em `apps/api/tests/integration/api/budget.api.test.ts`

#### Implementation (Green)
- [ ] T055 [P] [US2] Criar Budget e BudgetItem entities em `apps/api/src/domain/budget/entities/`
- [ ] T056 [P] [US2] Criar value objects (Money, BudgetStatus) em `apps/api/src/domain/budget/value-objects/`
- [ ] T057 [P] [US2] Criar BudgetRepositoryPort e BudgetServicePort em `apps/api/src/domain/budget/ports/`
- [ ] T058 [US2] Criar use cases de Budget em `apps/api/src/application/budget/use-cases/`
- [ ] T059 [P] [US2] Criar PostgresBudgetRepository em `apps/api/src/infrastructure/database/adapters/budget-repository.adapter.ts`
- [ ] T060 [P] [US2] Criar BudgetController em `apps/api/src/infrastructure/http/adapters/budget.controller.ts`
- [ ] T061 [US2] Atualizar index.ts para usar novo módulo Budget
- [ ] T062 [US2] Validar 95%+ coverage do módulo Budget

#### Refactor
- [ ] T063 [US2] Refatorar Budget entity e use cases

### Refatoração Módulo Billing (TDD)

#### Tests First (Red)
- [ ] T064 [P] [US2] Criar testes para Billing entities em `apps/api/tests/unit/domain/billing/`
- [ ] T065 [P] [US2] Criar testes para Billing use cases em `apps/api/tests/unit/application/billing/`
- [ ] T066 [P] [US2] Criar testes para Billing repository em `apps/api/tests/integration/database/billing-repository.test.ts`
- [ ] T067 [P] [US2] Criar testes para Billing API em `apps/api/tests/integration/api/billing.api.test.ts`

#### Implementation (Green)
- [ ] T068 [P] [US2] Criar Invoice e Payment entities em `apps/api/src/domain/billing/entities/`
- [ ] T069 [P] [US2] Criar value objects (InvoiceStatus, PaymentStatus) em `apps/api/src/domain/billing/value-objects/`
- [ ] T070 [P] [US2] Criar InvoiceRepositoryPort, PaymentRepositoryPort, BillingServicePort em `apps/api/src/domain/billing/ports/`
- [ ] T071 [US2] Criar use cases de Billing em `apps/api/src/application/billing/use-cases/`
- [ ] T072 [P] [US2] Criar PostgresInvoiceRepository e PostgresPaymentRepository em `apps/api/src/infrastructure/database/adapters/`
- [ ] T073 [P] [US2] Criar BillingController em `apps/api/src/infrastructure/http/adapters/billing.controller.ts`
- [ ] T074 [US2] Atualizar index.ts para usar novo módulo Billing
- [ ] T075 [US2] Validar 95%+ coverage do módulo Billing

#### Refactor
- [ ] T076 [US2] Refatorar Billing entities e use cases

### Refatoração Módulo Dashboard (TDD)

#### Tests First (Red)
- [ ] T077 [P] [US2] Criar testes para Dashboard entities em `apps/api/tests/unit/domain/dashboard/`
- [ ] T078 [P] [US2] Criar testes para Dashboard use cases em `apps/api/tests/unit/application/dashboard/`
- [ ] T079 [P] [US2] Criar testes para Dashboard API em `apps/api/tests/integration/api/dashboard.api.test.ts`

#### Implementation (Green)
- [ ] T080 [P] [US2] Criar DashboardMetric entity em `apps/api/src/domain/dashboard/entities/`
- [ ] T081 [P] [US2] Criar DashboardRepositoryPort e DashboardServicePort em `apps/api/src/domain/dashboard/ports/`
- [ ] T082 [US2] Criar use cases de Dashboard em `apps/api/src/application/dashboard/use-cases/`
- [ ] T083 [P] [US2] Criar DashboardRepository em `apps/api/src/infrastructure/database/adapters/dashboard-repository.adapter.ts`
- [ ] T084 [P] [US2] Criar DashboardController em `apps/api/src/infrastructure/http/adapters/dashboard.controller.ts`
- [ ] T085 [US2] Atualizar index.ts para usar novo módulo Dashboard
- [ ] T086 [US2] Validar 95%+ coverage do módulo Dashboard

#### Refactor
- [ ] T087 [US2] Refatorar Dashboard entities e use cases

### Refatoração Módulo Whitelabel (TDD)

#### Tests First (Red)
- [ ] T088 [P] [US2] Criar testes para Whitelabel entity em `apps/api/tests/unit/domain/whitelabel/`
- [ ] T089 [P] [US2] Criar testes para Whitelabel use cases em `apps/api/tests/unit/application/whitelabel/`
- [ ] T090 [P] [US2] Criar testes para Whitelabel API em `apps/api/tests/integration/api/whitelabel.api.test.ts`

#### Implementation (Green)
- [ ] T091 [P] [US2] Criar WhitelabelConfig entity e Address VO em `apps/api/src/domain/whitelabel/`
- [ ] T092 [P] [US2] Criar WhitelabelRepositoryPort e WhitelabelServicePort em `apps/api/src/domain/whitelabel/ports/`
- [ ] T093 [US2] Criar use cases de Whitelabel em `apps/api/src/application/whitelabel/use-cases/`
- [ ] T094 [P] [US2] Criar PostgresWhitelabelRepository em `apps/api/src/infrastructure/database/adapters/whitelabel-repository.adapter.ts`
- [ ] T095 [P] [US2] Criar WhitelabelController em `apps/api/src/infrastructure/http/adapters/whitelabel.controller.ts`
- [ ] T096 [US2] Atualizar index.ts para usar novo módulo Whitelabel
- [ ] T097 [US2] Validar 95%+ coverage do módulo Whitelabel

#### Refactor
- [ ] T098 [US2] Refatorar Whitelabel entities e use cases

### Cleanup

- [ ] T099 [US2] Remover diretório legado `apps/api/src/modules/agenda/`
- [ ] T100 [US2] Remover diretório legado `apps/api/src/modules/budget/`
- [ ] T101 [US2] Remover diretório legado `apps/api/src/modules/billing/`
- [ ] T102 [US2] Remover diretório legado `apps/api/src/modules/dashboard/`
- [ ] T103 [US2] Remover diretório legado `apps/api/src/modules/whitelabel/`

**Checkpoint**: Todos 5 módulos refatorados com arquitetura hexagonal

---

## Phase 5: User Story 3 - Aplicar princípios SOLID (Priority: P3)

**Goal**: Garantir que todo código segue princípios SOLID

**Independent Test**: Code review identifica zero violações SOLID críticas

### SOLID Validation

- [ ] T104 [US3] Criar checklist de validação SOLID em `docs/solid-checklist.md`
- [ ] T105 [US3] Revisar módulo Leads com checklist SOLID
- [ ] T106 [US3] Revisar módulo Agenda com checklist SOLID
- [ ] T107 [US3] Revisar módulo Budget com checklist SOLID
- [ ] T108 [US3] Revisar módulo Billing com checklist SOLID
- [ ] T109 [US3] Revisar módulo Dashboard com checklist SOLID
- [ ] T110 [US3] Revisar módulo Whitelabel com checklist SOLID

### SOLID Fixes

- [ ] T111 [US3] Corrigir violações SRP identificadas (uma classe, uma responsabilidade)
- [ ] T112 [US3] Corrigir violações OCP identificadas (aberto para extensão, fechado para modificação)
- [ ] T113 [US3] Corrigir violações LSP identificadas (substituição de subtipos)
- [ ] T114 [US3] Corrigir violações ISP identificadas (interfaces específicas)
- [ ] T115 [US3] Corrigir violações DIP identificadas (depender de abstrações)

### Documentation

- [ ] T116 [US3] Documentar padrões SOLID aplicados em `docs/solid-patterns.md`
- [ ] T117 [US3] Criar exemplos de código SOLID em `docs/solid-examples.md`

**Checkpoint**: Princípios SOLID aplicados e validados em todo o código

---

## Phase 6: Validação Final e Polish

**Purpose**: Validação final, documentação e preparação para merge

- [ ] T118 [P] Rodar `bun x tsc --noEmit` e validar zero erros
- [ ] T119 [P] Rodar `bun test --coverage` e validar 95%+ coverage
- [ ] T120 [P] Rodar todos testes de integração e validar 100% aprovação
- [ ] T121 [P] Rodar testes E2E de fluxos críticos
- [ ] T122 [P] Validar zero dependências circulares (análise estática)
- [ ] T123 [P] Validar todos endpoints funcionais (testar via Swagger)
- [ ] T124 [P] Atualizar README.md com nova estrutura
- [ ] T125 [P] Atualizar quickstart.md com comandos de teste
- [ ] T126 [P] Criar guia de refatoração em `docs/refactoring-guide.md`
- [ ] T127 [P] Documentar lições aprendidas em `docs/lessons-learned.md`
- [ ] T128 [P] Commit final e preparação para merge

**Checkpoint**: Refatoração completa - pronto para merge

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências - pode começar imediatamente
- **Foundational (Phase 2)**: Depende do Setup - BLOQUEIA todas as user stories
- **US1 (Phase 3)**: Depende da Foundational - MVP independente
- **US2 (Phase 4)**: Depende da US1 completa (zero erros TypeScript)
- **US3 (Phase 5)**: Depende da US2 completa (módulos refatorados)
- **Validation (Phase 6)**: Depende de todas user stories completas

### User Story Dependencies

- **US1 (P1)**: Pode começar após Phase 2 - Sem dependências de outras stories
- **US2 (P2)**: Depende da US1 - Precisa de código compilando para refatorar
- **US3 (P3)**: Depende da US2 - Precisa de módulos refatorados para validar SOLID

### Within Each User Story

- **TDD**: Testes (Red) → Implementação (Green) → Refatoração (Refactor)
- **Módulos**: Podem ser refatorados em paralelo por desenvolvedores diferentes

### Parallel Opportunities

- **Phase 1**: T001-T005 podem rodar em paralelo (5 devs)
- **Phase 2**: T006-T011 podem rodar em paralelo (6 devs)
- **Phase 3**: T014-T033 podem rodar em paralelo por módulo (5 devs)
- **Phase 4**: Cada módulo pode ser refatorado em paralelo (5 devs)
  - Dev A: Agenda (T037-T050)
  - Dev B: Budget (T051-T063)
  - Dev C: Billing (T064-T076)
  - Dev D: Dashboard (T077-T087)
  - Dev E: Whitelabel (T088-T098)
- **Phase 5**: T105-T110 podem rodar em paralelo (6 devs)
- **Phase 6**: T118-T127 podem rodar em paralelo (10 devs)

---

## Parallel Example: User Story 2 (Módulos Independentes)

```bash
# Com equipe de 5 desenvolvedores, cada um pega um módulo:
# Dev A: Agenda (T037-T050)
# Dev B: Budget (T051-T063)
# Dev C: Billing (T064-T076)
# Dev D: Dashboard (T077-T087)
# Dev E: Whitelabel (T088-T098)

# Todos podem trabalhar em paralelo pois:
# - Cada módulo tem suas próprias entities, ports, use cases, adapters
# - Não há dependência entre módulos (DAG)
# - Controllers são independentes
# - Tests são isolados por módulo
```

---

## Parallel Example: TDD Cycle

```bash
# Para cada módulo, seguir ciclo TDD:

# 1. RED: Escrever testes primeiro (T037-T040)
bun test agenda-event.test.ts  # Espera falhar

# 2. GREEN: Implementar mínimo para passar (T041-T047)
# Implementar entity, ports, use cases, adapters

# 3. REFACTOR: Melhorar código (T049-T050)
# Manter testes verdes

# 4. VALIDAR: 95%+ coverage
bun test --coverage
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Completar Phase 1: Setup (T001-T005)
2. Completar Phase 2: Foundational (T006-T011)
3. Completar Phase 3: US1 (T012-T036)
4. **PARAR E VALIDAR**: `bun x tsc --noEmit` retorna 0 erros
5. Deploy/demo se pronto

### Incremental Delivery

1. Setup + Foundational → Fundação pronta
2. US1 (Zero TypeScript errors) → Testar → Validar (MVP!)
3. US2 (Agenda refatorado) → Testar → Validar 95% coverage → Deploy/Demo
4. US2 (Budget refatorado) → Testar → Validar → Deploy/Demo
5. US2 (Billing refatorado) → Testar → Validar → Deploy/Demo
6. US2 (Dashboard refatorado) → Testar → Validar → Deploy/Demo
7. US2 (Whitelabel refatorado) → Testar → Validar → Deploy/Demo
8. US3 (SOLID validation) → Revisar → Documentar
9. Phase 6 (Validação final) → Merge

### Parallel Team Strategy

Com equipe de 6 desenvolvedores:

1. Time completa Setup + Foundational junto (T001-T011)
2. US1: Dividir módulos entre devs (T014-T033)
   - Dev A: Agenda
   - Dev B: Budget
   - Dev C: Billing
   - Dev D: Dashboard
   - Dev E: Whitelabel
   - Dev F: Coordenação + US3 checklist
3. US2: Mesma divisão, cada dev refatora seu módulo com TDD
4. US3: Time junto valida SOLID em code review
5. Phase 6: Time junto valida e prepara merge

---

## Task Summary

| Fase | Tarefas | User Story | Prioridade |
|------|---------|------------|------------|
| Phase 1: Setup | 5 | - | - |
| Phase 2: Foundational | 6 | - | - |
| Phase 3: US1 | 25 | Compilar sem erros | P1 (MVP) |
| Phase 4: US2 | 62 | Refatorar módulos | P2 |
| Phase 5: US3 | 14 | Aplicar SOLID | P3 |
| Phase 6: Validation | 11 | - | - |
| **Total** | **123** | **3 Stories** | **P1, P2, P3** |

---

## Notes

- [P] tasks = arquivos diferentes, sem dependências
- [Story] label mapeia tarefa para user story específica
- Cada user story deve ser completável e testável independentemente
- TDD: Seguir ciclo Red-Green-Refactor para cada módulo
- Commit após cada tarefa ou grupo lógico
- Parar em checkpoints para validar independentemente
- Evitar: tarefas vagas, same file conflicts, cross-story dependencies

---

**Próximo Passo**: Iniciar implementação pela Phase 1 (Setup)
