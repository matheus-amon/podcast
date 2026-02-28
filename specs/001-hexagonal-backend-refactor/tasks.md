# Tasks: Refatoração para Arquitetura Hexagonal e Remoção do Frontend

**Input**: Design documents from `/specs/001-hexagonal-backend-refactor/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Testes são OPCIONAIS - esta refatoração foca em preservar testes existentes. Novos testes serão criados conforme necessário.

**Organization**: Tarefas organizadas por User Story para permitir implementação e teste independentes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependências)
- **[Story]**: Qual user story esta tarefa pertence (US1, US2, US3)
- Incluir caminhos exatos de arquivos nas descrições

---

## Phase 1: Setup (Infraestrutura Compartilhada)

**Purpose**: Criar estrutura de diretórios da nova arquitetura e configurar ambiente

- [x] T001 Criar diretórios da arquitetura hexagonal em `apps/api/src/`: `domain/`, `application/`, `infrastructure/`
- [x] T002 [P] Criar subdiretórios por módulo em `apps/api/src/domain/`: `leads/`, `agenda/`, `budget/`, `billing/`, `dashboard/`, `whitelabel/`
- [x] T003 [P] Criar subdiretórios por módulo em `apps/api/src/application/` e `apps/api/src/infrastructure/`
- [x] T004 [P] Configurar tsconfig paths para imports em `apps/api/tsconfig.json`
- [x] T005 [P] Criar estrutura de testes: `apps/api/tests/unit/`, `apps/api/tests/integration/`, `apps/api/tests/e2e/`

---

## Phase 2: Foundational (Pré-requisitos Bloqueantes)

**Purpose**: Infraestrutura core que DEVE estar pronta antes de QUALQUER user story

**⚠️ CRÍTICO**: Nenhuma user story pode começar até esta fase estar completa

- [x] T006 [P] Criar entities base compartilhadas em `apps/api/src/domain/common/entities.ts`
- [x] T007 [P] Criar value objects compartilhados em `apps/api/src/domain/common/value-objects.ts`
- [x] T008 [P] Criar ports de repositório base em `apps/api/src/domain/common/ports/`
- [x] T009 [P] Manter middleware de erro existente em `apps/api/src/middleware/error.middleware.ts`
- [x] T010 [P] Manter middleware de logger existente em `apps/api/src/middleware/logger.middleware.ts`
- [x] T011 [P] Manter schema do Drizzle inalterado em `apps/api/src/db/schema.ts`
- [x] T012 [P] Manter conexão DB existente em `apps/api/src/db/index.ts`

**Checkpoint**: Fundação pronta - implementação das user stories pode começar

---

## Phase 3: User Story 1 - Desenvolvedor consegue adicionar nova feature sem quebrar features existentes (Priority: P1) 🎯 MVP

**Goal**: Implementar arquitetura hexagonal completa para o módulo Leads (piloto), demonstrando que DAG funciona

**Independent Test**: Desenvolvedor consegue identificar ports do módulo Leads e criar novo caso de uso sem modificar código existente

### Implementation for User Story 1

- [x] T013 [P] [US1] Criar entity Lead em `apps/api/src/domain/leads/entities/lead.entity.ts`
- [x] T014 [P] [US1] Criar value object Email em `apps/api/src/domain/leads/value-objects/email.vo.ts`
- [x] T015 [P] [US1] Criar enum LeadStatus em `apps/api/src/domain/leads/value-objects/lead-status.enum.ts`
- [x] T016 [P] [US1] Criar LeadRepositoryPort em `apps/api/src/domain/leads/ports/lead-repository.port.ts`
- [x] T017 [P] [US1] Criar LeadServicePort em `apps/api/src/domain/leads/ports/lead-service.port.ts`
- [x] T018 [US1] Criar CreateLeadUseCase em `apps/api/src/application/leads/use-cases/create-lead.use-case.ts`
- [x] T019 [US1] Criar UpdateLeadUseCase em `apps/api/src/application/leads/use-cases/update-lead.use-case.ts`
- [x] T020 [US1] Criar DeleteLeadUseCase em `apps/api/src/application/leads/use-cases/delete-lead.use-case.ts`
- [x] T021 [US1] Criar GetLeadsUseCase em `apps/api/src/application/leads/use-cases/get-leads.use-case.ts`
- [x] T022 [P] [US1] Criar PostgresLeadRepository em `apps/api/src/infrastructure/database/adapters/lead-repository.adapter.ts`
- [x] T023 [P] [US1] Criar LeadController em `apps/api/src/infrastructure/http/adapters/lead.controller.ts`
- [x] T024 [US1] Migrar rotas do controller legado para novo controller em `apps/api/src/index.ts`
- [x] T025 [US1] Testar endpoints do módulo Leads (GET, POST, PUT, DELETE)
- [ ] T026 [US1] Documentar arquitetura do módulo Leads em `docs/hexagonal-architecture.md`

**Checkpoint**: Módulo Leads totalmente refatorado e testável independentemente - MVP da arquitetura hexagonal

---

## Phase 4: User Story 2 - Sistema mantém todas as funcionalidades atuais após refatoração (Priority: P2)

**Goal**: Refatorar módulos restantes (Agenda, Budget, Billing, Dashboard, Whitelabel) preservando contratos de API

**Independent Test**: Todos os endpoints de API existentes continuam respondendo com os mesmos contratos

### Implementation for User Story 2 - Módulo Agenda

- [ ] T027 [P] [US2] Criar entity AgendaEvent em `apps/api/src/domain/agenda/entities/agenda-event.entity.ts`
- [ ] T028 [P] [US2] Criar value objects DateRange e EventStatus em `apps/api/src/domain/agenda/value-objects/`
- [ ] T029 [P] [US2] Criar AgendaRepositoryPort e AgendaServicePort em `apps/api/src/domain/agenda/ports/`
- [ ] T030 [US2] Criar use cases de Agenda em `apps/api/src/application/agenda/use-cases/`
- [ ] T031 [P] [US2] Criar PostgresAgendaRepository em `apps/api/src/infrastructure/database/adapters/agenda-repository.adapter.ts`
- [ ] T032 [P] [US2] Criar AgendaController em `apps/api/src/infrastructure/http/adapters/agenda.controller.ts`
- [ ] T033 [US2] Migrar rotas de Agenda e testar endpoints

### Implementation for User Story 2 - Módulo Budget

- [ ] T034 [P] [US2] Criar entities Budget e BudgetItem em `apps/api/src/domain/budget/entities/`
- [ ] T035 [P] [US2] Criar value object Money em `apps/api/src/domain/budget/value-objects/money.vo.ts`
- [ ] T036 [P] [US2] Criar BudgetRepositoryPort e BudgetServicePort em `apps/api/src/domain/budget/ports/`
- [ ] T037 [US2] Criar use cases de Budget em `apps/api/src/application/budget/use-cases/`
- [ ] T038 [P] [US2] Criar PostgresBudgetRepository em `apps/api/src/infrastructure/database/adapters/budget-repository.adapter.ts`
- [ ] T039 [P] [US2] Criar BudgetController em `apps/api/src/infrastructure/http/adapters/budget.controller.ts`
- [ ] T040 [US2] Migrar rotas de Budget e testar endpoints

### Implementation for User Story 2 - Módulo Billing

- [ ] T041 [P] [US2] Criar entities Invoice e Payment em `apps/api/src/domain/billing/entities/`
- [ ] T042 [P] [US2] Criar InvoiceRepositoryPort, PaymentRepositoryPort, BillingServicePort em `apps/api/src/domain/billing/ports/`
- [ ] T043 [US2] Criar use cases de Billing em `apps/api/src/application/billing/use-cases/`
- [ ] T044 [P] [US2] Criar PostgresInvoiceRepository e PostgresPaymentRepository em `apps/api/src/infrastructure/database/adapters/`
- [ ] T045 [P] [US2] Criar BillingController em `apps/api/src/infrastructure/http/adapters/billing.controller.ts`
- [ ] T046 [US2] Migrar rotas de Billing e testar endpoints

### Implementation for User Story 2 - Módulo Dashboard

- [ ] T047 [P] [US2] Criar entity DashboardMetric em `apps/api/src/domain/dashboard/entities/`
- [ ] T048 [P] [US2] Criar DashboardRepositoryPort e DashboardServicePort em `apps/api/src/domain/dashboard/ports/`
- [ ] T049 [US2] Criar use cases de Dashboard em `apps/api/src/application/dashboard/use-cases/`
- [ ] T050 [P] [US2] Criar DashboardRepository (leitura dos módulos) em `apps/api/src/infrastructure/database/adapters/dashboard-repository.adapter.ts`
- [ ] T051 [P] [US2] Criar DashboardController em `apps/api/src/infrastructure/http/adapters/dashboard.controller.ts`
- [ ] T052 [US2] Migrar rotas de Dashboard e testar endpoints

### Implementation for User Story 2 - Módulo Whitelabel

- [ ] T053 [P] [US2] Criar entity WhitelabelConfig e value object Address em `apps/api/src/domain/whitelabel/`
- [ ] T054 [P] [US2] Criar WhitelabelRepositoryPort e WhitelabelServicePort em `apps/api/src/domain/whitelabel/ports/`
- [ ] T055 [US2] Criar use cases de Whitelabel em `apps/api/src/application/whitelabel/use-cases/`
- [ ] T056 [P] [US2] Criar PostgresWhitelabelRepository em `apps/api/src/infrastructure/database/adapters/whitelabel-repository.adapter.ts`
- [ ] T057 [P] [US2] Criar WhitelabelController em `apps/api/src/infrastructure/http/adapters/whitelabel.controller.ts`
- [ ] T058 [US2] Migrar rotas de Whitelabel e testar endpoints

**Checkpoint**: Todos os 6 módulos refatorados - todos os endpoints funcionais

---

## Phase 5: User Story 3 - Frontend é completamente removido do repositório (Priority: P3)

**Goal**: Remover código frontend e limpar configurações de monorepo

**Independent Test**: Diretório `apps/web` não existe mais e build do backend funciona sem referências ao frontend

### Implementation for User Story 3

- [ ] T059 [US3] Remover diretório `apps/web/` completamente
- [ ] T060 [US3] Atualizar `package.json` raiz para remover scripts do frontend
- [ ] T061 [US3] Atualizar `docker-compose.yml` se houver referências ao frontend
- [ ] T062 [US3] Avaliar diretório `packages/`: remover se vazio ou apenas frontend
- [ ] T063 [US3] Atualizar `.gitignore` se necessário
- [ ] T064 [US3] Atualizar README.md para remover referências ao frontend
- [ ] T065 [US3] Atualizar documentação em `docs/` para remover referências ao frontend

**Checkpoint**: Frontend removido - repositório contém apenas backend

---

## Phase 6: Limpeza e Validação Final

**Purpose**: Remover código legado, validar DAG e garantir qualidade

- [ ] T066 [P] Remover diretório legado `apps/api/src/modules/` após migração completa
- [ ] T067 [P] Verificar zero dependências circulares (análise estática de imports)
- [ ] T068 [P] Rodar todos os testes existentes e garantir 100% de aprovação
- [ ] T069 [P] Testar todos os endpoints via Swagger UI (`http://localhost:3000/swagger`)
- [ ] T070 [P] Validar health check (`http://localhost:3000/health`)
- [ ] T071 [P] Atualizar diagrama de arquitetura em `docs/hexagonal-architecture.md`
- [ ] T072 [P] Revisar documentação com 2 desenvolvedores (SC-006)
- [ ] T073 [P] Atualizar `quickstart.md` com nova estrutura
- [ ] T074 [P] Commit final e preparação para merge

**Checkpoint**: Refatoração completa - pronto para merge

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências - pode começar imediatamente
- **Foundational (Phase 2)**: Depende do Setup - BLOQUEIA todas as user stories
- **User Story 1 (Phase 3)**: Depende apenas da Foundational - MVP independente
- **User Story 2 (Phase 4)**: Depende da Foundational - pode rodar em paralelo com US1 (se houver equipe)
- **User Story 3 (Phase 5)**: Depende da US2 completa (todos os módulos refatorados)
- **Limpeza (Phase 6)**: Depende de todas as user stories completas

### User Story Dependencies

- **US1 (P1)**: Pode começar após Phase 2 - Sem dependências de outras stories
- **US2 (P2)**: Pode começar após Phase 2 - Independente da US1, mas usa mesma infraestrutura
- **US3 (P3)**: Depende da US2 completa (não faz sentido remover frontend antes de refatorar backend)

### Within Each User Story

- Models/Entities antes de Services
- Services antes de Controllers
- Core implementation antes de integração
- Story completa antes de próxima prioridade

### Parallel Opportunities

- **Phase 1**: T002, T003, T004, T005 podem rodar em paralelo
- **Phase 2**: T006, T007, T008, T009, T010, T011, T012 podem rodar em paralelo
- **Phase 3 (US1)**: T013, T014, T015, T016, T017 podem rodar em paralelo; T022, T023 podem rodar em paralelo
- **Phase 4 (US2)**: Módulos diferentes podem ser refatorados em paralelo por desenvolvedores diferentes
  - Agenda: T027-T033
  - Budget: T034-T040
  - Billing: T041-T046
  - Dashboard: T047-T052
  - Whitelabel: T053-T058
- **Phase 6**: T066, T067, T068, T069, T070, T071, T072, T073 podem rodar em paralelo

---

## Parallel Example: User Story 1

```bash
# Lançar entities e ports em paralelo:
Task: "Criar entity Lead em apps/api/src/domain/leads/entities/lead.entity.ts"
Task: "Criar value object Email em apps/api/src/domain/leads/value-objects/email.vo.ts"
Task: "Criar LeadRepositoryPort em apps/api/src/domain/leads/ports/lead-repository.port.ts"
Task: "Criar LeadServicePort em apps/api/src/domain/leads/ports/lead-service.port.ts"

# Lançar adapters em paralelo (após use cases):
Task: "Criar PostgresLeadRepository em apps/api/src/infrastructure/database/adapters/lead-repository.adapter.ts"
Task: "Criar LeadController em apps/api/src/infrastructure/http/adapters/lead.controller.ts"
```

---

## Parallel Example: User Story 2 (Módulos Independentes)

```bash
# Com equipe de 5 desenvolvedores, cada um pega um módulo:
# Dev A: Agenda (T027-T033)
# Dev B: Budget (T034-T040)
# Dev C: Billing (T041-T046)
# Dev D: Dashboard (T047-T052)
# Dev E: Whitelabel (T053-T058)

# Todos podem trabalhar em paralelo pois:
# - Cada módulo tem seus próprios entities, ports, use cases, adapters
# - Não há dependência entre módulos (DAG)
# - Controllers são independentes
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Completar Phase 1: Setup
2. Completar Phase 2: Foundational (CRÍTICO - bloqueia tudo)
3. Completar Phase 3: User Story 1 (Módulo Leads)
4. **PARAR E VALIDAR**: Testar módulo Leads independentemente
5. Validar que DAG funciona (desenvolvedor entende ports e cria use case sem modificar existente)
6. Documentar lições aprendidas

### Incremental Delivery

1. Setup + Foundational → Fundação pronta
2. US1 (Leads) → Testar → Validar arquitetura (MVP!)
3. US2 (Agenda + Budget + Billing + Dashboard + Whitelabel) → Testar cada módulo → Validar todos endpoints
4. US3 (Remover frontend) → Validar build limpo
5. Phase 6 (Limpeza) → Validar zero dependências circulares
6. Cada fase adiciona valor sem quebrar fases anteriores

### Parallel Team Strategy

Com equipe de 6 desenvolvedores:

1. Time completa Setup + Foundational junto (T001-T012)
2. Dev Senior: US1 (Leads) - módulo piloto para estabelecer padrão
3. Após US1 completa, paralelo:
   - Dev A: Agenda
   - Dev B: Budget
   - Dev C: Billing
   - Dev D: Dashboard
   - Dev E: Whitelabel
4. Dev Senior: US3 (remoção frontend) + coordenação
5. Time junto: Phase 6 (validação final)

---

## Task Summary

| Fase | Tarefas | User Story | Prioridade |
|------|---------|------------|------------|
| Phase 1: Setup | 5 | - | - |
| Phase 2: Foundational | 7 | - | - |
| Phase 3: US1 | 14 | Desenvolvedor consegue adicionar feature | P1 (MVP) |
| Phase 4: US2 | 32 | Manter funcionalidades existentes | P2 |
| Phase 5: US3 | 7 | Remover frontend | P3 |
| Phase 6: Limpeza | 9 | - | - |
| **Total** | **74** | **3 Stories** | **P1, P2, P3** |

---

## Notes

- [P] tasks = arquivos diferentes, sem dependências
- [Story] label mapeia tarefa para user story específica
- Cada user story deve ser completável e testável independentemente
- Commit após cada tarefa ou grupo lógico
- Parar em checkpoints para validar independentemente
- Evitar: tarefas vagas, conflitos de mesmo arquivo, dependências cruzadas

---

**Próximo Passo**: Iniciar implementação pela Phase 1 (Setup)
