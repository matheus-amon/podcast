# 🚀 Plano de Implementação - Frontend Refactor

**Método**: Ralph Loop (Spec → Implement → Validate → Next)  
**Data**: 2026-03-03  
**Status**: ✅ Aprovado

---

## 📋 Visão Geral

Implementar frontend do Podcast SaaS módulo por módulo, garantindo qualidade e consistência antes de prosseguir.

### Método Ralph Loop

```
┌─────────────────┐
│  1. SPEC        │ → Definir requisitos, design, API
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  2. IMPLEMENT   │ → Codificar componente/módulo
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  3. VALIDATE    │ → Testar, validar design, QA
└────────┬────────┘
         │
         ▼
    ┌────┴────┐
    │  Next?  │ → Sim → Próximo módulo
    └────┬────┘   Não → Refinar
         │
         ▼
    [CONCLUÍDO]
```

---

## 📅 Ordem de Implementação

| # | Módulo | Prioridade | Complexidade | Estimativa |
|---|--------|------------|--------------|------------|
| 1 | **Setup + Design System** | 🔴 Critical | Baixa | 1 dia |
| 2 | **Dashboard** | 🔴 Critical | Média | 2 dias |
| 3 | **Leads + Kanban** | 🔴 Critical | Alta | 3 dias |
| 4 | **Agenda + Calendar** | 🔴 Critical | Alta | 3 dias |
| 5 | **Episodes** | 🟡 High | Média | 2 dias |
| 6 | **Budget** | 🟡 High | Média | 2 dias |
| 7 | **Billing** | 🟡 High | Média | 2 dias |
| 8 | **Settings** | 🟢 Low | Baixa | 1 dia |

**Total**: 16 dias (~3 semanas)

---

## 🔄 Loop Detalhado

### Loop 1: Setup + Design System ✅

**Spec**:
- [x] Next.js 16 + React 19 setup
- [x] TailwindCSS 4 + Shadcn/UI
- [x] TanStack Query + Zustand
- [x] React Hook Form + Zod
- [x] TanStack Table
- [x] React Big Calendar
- [x] Design System documentado

**Implement**:
- [ ] `bunx create-next-app@latest web --typescript --tailwind --app`
- [ ] `bunx shadcn-ui@latest init`
- [ ] Instalar dependências
- [ ] Configurar aliases
- [ ] Setup providers (Query, Toast)
- [ ] Criar API client
- [ ] Criar layout base (Sidebar + TopBar)

**Validate**:
- [ ] TypeScript compila sem erros
- [ ] Shadcn components funcionando
- [ ] API client conecta com backend
- [ ] Layout responsivo

**Output**: `apps/web/` funcional com base pronta

---

### Loop 2: Dashboard

**Spec**: [PRD-001 - Dashboard](./prd-001-dashboard.md)

**Componentes**:
- [ ] KPICard (4 unidades)
- [ ] RevenueChart (BarChart)
- [ ] ActivityFeed
- [ ] PageHeader
- [ ] EmptyState

**API Integration**:
- [ ] `GET /api/reports/dashboard`
- [ ] `GET /api/reports/financial/trend`
- [ ] `GET /api/reports/recent-activity`

**Validate**:
- [ ] KPIs exibindo corretamente
- [ ] Chart renderizando
- [ ] Activity feed com dados
- [ ] Loading states
- [ ] Error states
- [ ] Responsivo mobile

**Definition of Done**:
- [ ] Todos componentes testados
- [ ] API integration funcionando
- [ ] Design consistente
- [ ] Performance OK (< 2s load)

---

### Loop 3: Leads + Kanban

**Spec**: [PRD-002 - Leads](./prd-002-leads.md)

**Componentes**:
- [ ] KanbanBoard (custom)
- [ ] KanbanColumn
- [ ] KanbanCard
- [ ] LeadDialog (CRUD)
- [ ] LeadFilters
- [ ] LeadSearch

**API Integration**:
- [ ] `GET /api/leads`
- [ ] `POST /api/leads`
- [ ] `GET /api/leads/:id`
- [ ] `PUT /api/leads/:id`
- [ ] `DELETE /api/leads/:id`

**Features**:
- [ ] Drag-and-drop entre colunas
- [ ] Quick edit (inline)
- [ ] Filters (status, source, role)
- [ ] Search
- [ ] Pagination (se necessário)

**Validate**:
- [ ] Drag-and-drop funcionando
- [ ] CRUD completo
- [ ] Filters aplicando
- [ ] Search funcionando
- [ ] Responsivo

**Definition of Done**:
- [ ] Kanban fluido
- [ ] Sem bugs de drag-and-drop
- [ ] CRUD testado
- [ ] Performance OK

---

### Loop 4: Agenda + Calendar

**Spec**: [PRD-003 - Agenda](./prd-003-agenda.md)

**Componentes**:
- [ ] EventCalendar (Google Calendar style)
- [ ] EventDialog (CRUD)
- [ ] QuickAdd (click & drag)
- [ ] EventFilters
- [ ] ViewSelector (month/week/day/agenda)

**API Integration**:
- [ ] `GET /api/agenda/events`
- [ ] `POST /api/agenda/events`
- [ ] `PUT /api/agenda/events/:id`
- [ ] `DELETE /api/agenda/events/:id`
- [ ] `POST /api/agenda/events/:id/attendees`

**Features**:
- [ ] Views: Month, Week, Day, Agenda
- [ ] Drag-and-drop eventos
- [ ] Resize (mudar duração)
- [ ] Quick add (clicar e arrastar)
- [ ] Multi-day events
- [ ] Color coding por tipo
- [ ] Attendees

**Validate**:
- [ ] Calendar renderizando
- [ ] Drag-and-drop funcionando
- [ ] Resize funcionando
- [ ] CRUD eventos
- [ ] Views alternando
- [ ] Responsivo

**Definition of Done**:
- [ ] Calendar fluido como Google Calendar
- [ ] Sem bugs de drag-and-drop
- [ ] CRUD testado
- [ ] Performance OK

---

### Loop 5: Episodes

**Spec**: [PRD-004 - Episodes](./prd-004-episodes.md)

**Componentes**:
- [ ] EpisodeTable (TanStack)
- [ ] EpisodeDialog (CRUD)
- [ ] EpisodeCard (preview)
- [ ] EpisodeDetail (página)
- [ ] EpisodeFilters

**API Integration**:
- [ ] `GET /api/episodes`
- [ ] `GET /api/episodes/:id`

**Features**:
- [ ] Listagem em tabela
- [ ] Sorting por colunas
- [ ] Filtering por status
- [ ] Search
- [ ] Pagination
- [ ] Detail page

**Validate**:
- [ ] Table funcionando
- [ ] Sorting/filtering
- [ ] Detail page
- [ ] Responsivo

---

### Loop 6: Budget

**Spec**: [PRD-005 - Budget](./prd-005-budget.md)

**Componentes**:
- [ ] BudgetKPICards
- [ ] BudgetTable
- [ ] BudgetDialog
- [ ] BudgetChart (Revenue vs Expense)
- [ ] BudgetFilters

**API Integration**:
- [ ] `GET /api/budget`
- [ ] `GET /api/budget/summary`
- [ ] `POST /api/budget`
- [ ] `PUT /api/budget/:id`
- [ ] `DELETE /api/budget/:id`

**Features**:
- [ ] KPIs (total income, expense, balance)
- [ ] Chart (receita vs despesa)
- [ ] CRUD budgets
- [ ] Filters por tipo, categoria, data

---

### Loop 7: Billing

**Spec**: [PRD-006 - Billing](./prd-006-billing.md)

**Componentes**:
- [ ] InvoiceTable
- [ ] InvoiceDialog
- [ ] InvoiceCard
- [ ] PaymentDialog
- [ ] BillingFilters

**API Integration**:
- [ ] `GET /api/billing/invoices`
- [ ] `POST /api/billing/invoices`
- [ ] `POST /api/billing/payments`
- [ ] `PUT /api/billing/invoices/:id`

**Features**:
- [ ] Listagem de invoices
- [ ] CRUD invoices
- [ ] Processar pagamentos
- [ ] Status badges (PAID, PENDING, OVERDUE)

---

### Loop 8: Settings

**Spec**: [PRD-007 - Settings](./prd-007-settings.md)

**Componentes**:
- [ ] SettingsTabs (General, Appearance, Notifications)
- [ ] GeneralSettingsForm
- [ ] AppearanceSettings (theme, language)
- [ ] NotificationSettings

**API Integration**:
- [ ] `GET /api/whitelabel/config`
- [ ] `POST /api/whitelabel/config`

**Features**:
- [ ] Configurações gerais
- [ ] Appearance (quando tiver dark mode)
- [ ] Notifications

---

## ✅ Critérios de Aceite (Por Loop)

### Code Quality
- [ ] TypeScript sem erros
- [ ] ESLint sem warnings
- [ ] Componentes com props tipadas
- [ ] Hooks customizados quando necessário

### Design
- [ ] Seguir design-system.md
- [ ] Cores consistentes
- [ ] Espaçamento consistente
- [ ] Tipografia correta
- [ ] Responsivo (mobile, tablet, desktop)

### UX
- [ ] Loading states
- [ ] Error states
- [ ] Empty states
- [ ] Toast notifications
- [ ] Feedback de ações

### Performance
- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] Bundle size dentro do limite

### Testing
- [ ] Testar fluxos principais
- [ ] Testar error scenarios
- [ ] Testar responsividade
- [ ] Cross-browser (Chrome, Firefox, Safari)

---

## 📊 Tracking

### Status Atual

```
✅ Loop 1: Setup + Design System    → [✅] Spec [✅] Implement [✅] Validate
✅ Loop 2: Dashboard                → [✅] Spec [✅] Implement [✅] Validate
⏳ Loop 3: Leads + Kanban           → [✅] Spec [ ] Implement [ ] Validate
⏳ Loop 4: Agenda + Calendar        → [ ] Spec [ ] Implement [ ] Validate
⏳ Loop 5: Episodes                 → [ ] Spec [ ] Implement [ ] Validate
⏳ Loop 6: Budget                   → [ ] Spec [ ] Implement [ ] Validate
⏳ Loop 7: Billing                  → [ ] Spec [ ] Implement [ ] Validate
⏳ Loop 8: Settings                 → [ ] Spec [ ] Implement [ ] Validate
```

### Próxima Ação

**Próximo**: Loop 3 - Leads + Kanban

---

**Documento criado**: 2026-03-03  
**Última atualização**: 2026-03-03  
**Próximo**: Criar PRDs de cada módulo
