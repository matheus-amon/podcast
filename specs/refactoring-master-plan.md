# Plano Mestre de Refatoração - Módulos Restantes

**Data**: 2026-03-01  
**Feature**: Refatoração completa para arquitetura hexagonal  
**Status**: Planejado

---

## 📋 Visão Geral

Refatorar 5 módulos restantes (Agenda, Budget, Billing, Dashboard, Whitelabel) da estrutura legada para arquitetura hexagonal, seguindo o padrão validado no módulo Leads.

---

## 🎯 Ordem de Refatoração

### Prioridade 1: Módulos Core (Funcionalidade Básica)

1. **Agenda** (004-refactor-agenda) - 1 semana
2. **Budget** (005-refactor-budget) - 1 semana

### Prioridade 2: Módulos de Negócio (Receita)

3. **Billing** (006-refactor-billing) - 1 semana

### Prioridade 3: Módulos de Suporte (Analytics/Config)

4. **Dashboard** (007-refactor-dashboard) - 3-4 dias
5. **Whitelabel** (008-refactor-whitelabel) - 3-4 dias

**Tempo Total Estimado**: 4-5 semanas

---

## 📊 Status por Módulo

| Módulo | Branch | Spec | Entidades | Use Cases | Repository | Controller | Testes | Status |
|--------|--------|------|-----------|-----------|------------|------------|--------|--------|
| **Leads** | ✅ 001 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **Completo** |
| **Agenda** | ✅ 004 | ✅ | 🟡 Parcial | ❌ | ❌ | ❌ | 🟡 Parcial | **Iniciado** |
| **Budget** | ✅ 005 | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | **Planejado** |
| **Billing** | ✅ 006 | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | **Planejado** |
| **Dashboard** | ✅ 007 | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | **Planejado** |
| **Whitelabel** | ✅ 008 | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | **Planejado** |

---

## 🔧 Estrutura de Cada Refatoração

Cada módulo seguirá o mesmo padrão:

### Phase 1: Domain Layer
- [ ] Entities (reutilizar se já existir)
- [ ] Value Objects
- [ ] Enums
- [ ] Ports (Repository, Service)

### Phase 2: Application Layer
- [ ] Use Case 1 (Create)
- [ ] Use Case 2 (Update)
- [ ] Use Case 3 (Delete)
- [ ] Use Case 4 (Get/List)
- [ ] Casos de uso específicos do módulo

### Phase 3: Infrastructure Layer
- [ ] Repository Adapter (Postgres)
- [ ] Controller Adapter (HTTP/Elysia)
- [ ] Mappers (DB → Domain)

### Phase 4: Testes (TDD)
- [ ] Testes unitários de Entity
- [ ] Testes unitários de Use Cases
- [ ] Testes de integração de Repository
- [ ] Testes de API (Controller)
- [ ] Validar 95%+ coverage

### Phase 5: Integração
- [ ] Registrar módulo no index.ts
- [ ] Testar endpoints via curl
- [ ] Validar zero erros TypeScript
- [ ] Remover código legado

---

## 📅 Cronograma Detalhado

### Semana 1: Módulo Agenda (004)

**Entregáveis**:
- ✅ Entity AgendaEvent (já existe 92.93%)
- ⏳ Use cases: CreateEvent, UpdateEvent, CancelEvent, ListEvents
- ⏳ PostgresAgendaRepository
- ⏳ AgendaController
- ⏳ Testes (95%+ coverage)
- ⏳ Endpoints funcionando

**Endpoints**:
- GET /api/agenda/events
- POST /api/agenda/events
- PUT /api/agenda/events/:id
- DELETE /api/agenda/events/:id
- POST /api/agenda/events/:id/cancel

### Semana 2: Módulo Budget (005)

**Entregáveis**:
- ⏳ Entities: Budget, BudgetItem
- ⏳ VO: Money (já existe)
- ⏳ Use cases: CreateBudget, UpdateBudget, ApproveBudget, ListBudgets
- ⏳ PostgresBudgetRepository
- ⏳ BudgetController
- ⏳ Testes (95%+ coverage)

**Endpoints**:
- GET /api/budget
- POST /api/budget
- PUT /api/budget/:id
- DELETE /api/budget/:id
- GET /api/budget/:id/items

### Semana 3: Módulo Billing (006)

**Entregáveis**:
- ⏳ Entities: Invoice, Payment
- ⏳ Use cases: GenerateInvoice, ProcessPayment, ListInvoices
- ⏳ PostgresInvoiceRepository, PostgresPaymentRepository
- ⏳ BillingController
- ⏳ Testes (95%+ coverage)

**Endpoints**:
- GET /api/billing/invoices
- POST /api/billing/invoices
- POST /api/billing/invoices/:id/payments
- GET /api/billing/invoices/:id

### Semana 4: Dashboard + Whitelabel (007 + 008)

**Dashboard**:
- ⏳ Entity: DashboardMetric
- ⏳ Use cases: GetMetrics, GetSummary
- ⏳ DashboardRepository (leitura de múltiplos módulos)
- ⏳ DashboardController
- ⏳ Testes

**Whitelabel**:
- ⏳ Entity: WhitelabelConfig
- ⏳ VO: Address (já existe)
- ⏳ Use cases: GetConfig, UpdateConfig
- ⏳ WhitelabelRepository
- ⏳ WhitelabelController
- ⏳ Testes

### Semana 5: Limpeza e Validação Final

**Atividades**:
- [ ] Remover diretório `modules/` (legado)
- [ ] Validar zero erros TypeScript
- [ ] Validar 100% dos endpoints funcionando
- [ ] Validar 95%+ coverage geral
- [ ] Atualizar documentação
- [ ] Code review final
- [ ] Merge para main

---

## 🎯 Definição de Pronto (por módulo)

Cada módulo é considerado completo quando:

- [ ] ✅ Entidades criadas e testadas
- [ ] ✅ Use cases implementados e testados
- [ ] ✅ Repository adapter implementado e testado
- [ ] ✅ Controller HTTP implementado e testado
- [ ] ✅ 95%+ coverage de testes
- [ ] ✅ Zero erros TypeScript
- [ ] ✅ Endpoints testados via curl
- [ ] ✅ Código legado removido
- [ ] ✅ Code review aprovado

---

## 📈 Métricas de Sucesso

| Métrica | Atual | Meta Final |
|---------|-------|------------|
| Módulos refatorados | 1/6 | 6/6 |
| Endpoints funcionais | 5/8 | 40+/40+ |
| Cobertura de testes | 92.93% | 95%+ |
| Erros TypeScript (prod) | 0 | 0 |
| Princípios SOLID | 1/6 | 6/6 |
| CRUDs funcionais | 1/6 | 6/6 |

---

## 🚀 Próximo Módulo: Agenda (004)

**Status**: Spec criada, pronto para `/speckit.plan`

**Tarefas Imediatas**:
1. Completar entity AgendaEvent (falta 0.07% para 100%)
2. Criar use cases (CreateEvent, UpdateEvent, CancelEvent, ListEvents)
3. Criar PostgresAgendaRepository
4. Criar AgendaController
5. Criar testes unitários e de integração
6. Validar endpoints via curl

**Branch**: `004-refactor-agenda`

---

**Documento Criado**: 2026-03-01  
**Última Atualização**: 2026-03-01  
**Próxima Ação**: Iniciar refatoração do módulo Agenda (004)
