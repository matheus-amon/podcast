# Inventário de Componentes - Podcast SaaS

**Data**: 2026-03-03  
**Objetivo**: Mapear todos os componentes existentes para guiar a refatoração

---

## 📦 Componentes UI Base (Shadcn)

### Local: `apps/web/components/ui/`

| Componente | Arquivo | Status | Uso Principal |
|------------|---------|--------|---------------|
| Avatar | `avatar.tsx` | ✅ Documentado | Leads, Users |
| Badge | `badge.tsx` | ✅ Documentado | Status indicators |
| Button | `button.tsx` | ✅ Documentado | Global |
| Calendar | `calendar.tsx` | ⚠️ Precisa doc | Agenda, Dates |
| Card | `card.tsx` | ✅ Documentado | Global |
| Dialog | `dialog.tsx` | ✅ Documentado | Modals, Forms |
| Input | `input.tsx` | ✅ Documentado | Forms |
| Label | `label.tsx` | ✅ Documentado | Forms |
| Popover | `popover.tsx` | ⚠️ Precisa doc | Dropdowns |
| Select | `select.tsx` | ✅ Documentado | Forms |
| Separator | `separator.tsx` | ⚠️ Precisa doc | Layout |
| Sheet | `sheet.tsx` | ⚠️ Precisa doc | Mobile nav |
| Sidebar | `sidebar.tsx` | ✅ Documentado | Navigation |
| Skeleton | `skeleton.tsx` | ⚠️ Precisa doc | Loading states |
| Table | `table.tsx` | ✅ Documentado | Data lists |
| Tabs | `tabs.tsx` | ⚠️ Precisa doc | Tabbed content |
| Textarea | `textarea.tsx` | ⚠️ Precisa doc | Forms |
| Toast | `toast.tsx` + `toaster.tsx` | ✅ Documentado | Notifications |
| Tooltip | `tooltip.tsx` | ⚠️ Precisa doc | Hints |

---

## 🧩 Componentes Customizados

### Local: `apps/web/components/`

| Componente | Arquivo | Status | Descrição |
|------------|---------|--------|-----------|
| AppSidebar | `app-sidebar.tsx` | ✅ Documentado | Sidebar de navegação principal |
| TopBar | `top-bar.tsx` | ⚠️ Precisa doc | Barra superior (breadcrumbs, user menu) |
| EmptyState | `empty-state.tsx` | ✅ Documentado | Estado vazio genérico |
| EmptyStateCompact | `empty-state.tsx` | ✅ Documentado | Estado vazio compacto (inline) |

---

## 📄 Páginas Existentes

### Local: `apps/web/app/`

| Página | Rota | Módulo | Status |
|--------|------|--------|--------|
| Dashboard | `/` | Dashboard | ✅ Mapeada |
| Agenda | `/agenda` | Agenda | ⚠️ Precisa analisar |
| Analytics | `/analytics` | Analytics | ⚠️ Precisa analisar |
| Billing | `/billing` | Billing | ⚠️ Precisa analisar |
| Budget | `/budget` | Budget | ⚠️ Precisa analisar |
| Episodes | `/episodes` | Episodes | ⚠️ Precisa analisar |
| Episodes Detail | `/episodes/[id]` | Episodes | ⚠️ Precisa analisar |
| Finance | `/finance` | Finance | ⚠️ Precisa analisar |
| Leads | `/leads` | Leads | ✅ Mapeada |
| Leads Detail | `/leads/[id]` | Leads | ⚠️ Precisa analisar |
| Media | `/media` | Media | ⚠️ Precisa analisar |
| Settings | `/settings` | Settings | ⚠️ Precisa analisar |

---

## 🎯 Padrões por Módulo

### Dashboard (`/`)

**Componentes usados**:
- Card (KPI cards)
- BarChart (Recharts)
- Avatar, Badge
- Button, Link
- EmptyState

**API endpoints**:
- `GET /api/dashboard/metrics`
- `GET /api/dashboard/charts/revenue`
- `GET /api/dashboard/recent-activity`

**Layout**:
- Page header com ações
- 4 KPI cards em grid
- Revenue chart (col-span-4)
- Recent activity (col-span-3)

---

### Leads (`/leads`)

**Componentes usados**:
- Table, Card
- Badge, Avatar
- Button, Input, Dialog
- Select, Label
- EmptyStateCompact

**API endpoints**:
- `GET /api/leads` - Listar leads
- `POST /api/leads` - Criar lead
- `GET /api/leads/:id` - Detalhes (na página de detalhe)
- `PUT /api/leads/:id` - Atualizar (na página de detalhe)
- `DELETE /api/leads/:id` - Deletar

**Layout**:
- Page header com search + botão "Add Lead"
- Dialog para criação
- Table com colunas: Guest, Status, Role, Last Contact, Actions
- Row clicável para detalhes

**Status badges**:
- `CONFIRMED` → variant: default
- `RECORDED` → variant: default
- `CONTACTED` → variant: secondary
- `PROSPECT` → variant: outline

---

### Agenda (`/agenda`)

**Componentes prováveis**:
- Calendar (Shadcn)
- Card, Dialog
- Button, Input
- Select, Label

**API endpoints** (a confirmar):
- `GET /api/agenda/events`
- `POST /api/agenda/events`
- `PUT /api/agenda/events/:id`
- `DELETE /api/agenda/events/:id`

---

### Budget (`/budget`)

**Componentes prováveis**:
- Table, Card
- Badge (status)
- Dialog (CRUD)
- Chart (receita vs despesa)

**API endpoints**:
- `GET /api/budget`
- `POST /api/budget`
- `GET /api/budget/summary`

---

### Billing (`/billing`)

**Componentes prováveis**:
- Table, Card
- Badge (status: PAID, PENDING, OVERDUE)
- Dialog
- Invoice card

**API endpoints**:
- `GET /api/billing/invoices`
- `POST /api/billing/invoices`
- `POST /api/billing/payments`

---

### Episodes (`/episodes`)

**Componentes prováveis**:
- Table, Card
- Badge (status)
- Avatar (guests)
- Dialog (CRUD)

**API endpoints**:
- `GET /api/episodes`
- `GET /api/episodes/:id`

---

## 🔗 Hooks Customizados

### Local: `apps/web/hooks/`

| Hook | Arquivo | Propósito |
|------|---------|-----------|
| `useToast` | `use-toast.ts` | Toast notifications |
| `useSidebar` | (provável) | Sidebar state |

---

## 🛠️ Utils

### Local: `apps/web/lib/`

| Util | Arquivo | Propósito |
|------|---------|-----------|
| `cn` | `utils.ts` | ClassNames merge (clsx + tailwind-merge) |
| `fetchAPI` | `api.ts` | API client wrapper |

---

## 📊 Charts (Recharts)

### Componentes de Gráfico

**Usados no Dashboard**:

```tsx
import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts"

<ResponsiveContainer width="100%" height={350}>
  <BarChart data={data}>
    <XAxis dataKey="name" stroke="#888888" fontSize={12} />
    <YAxis stroke="#888888" fontSize={12} />
    <Tooltip />
    <Bar dataKey="revenue" fill="#adfa1d" />
    <Bar dataKey="expenses" fill="#ef4444" />
  </BarChart>
</ResponsiveContainer>
```

**Cores dos charts**:
- Revenue: `#adfa1d` (lime-400)
- Expenses: `#ef4444` (red-500)

---

## 🎨 Temas por Módulo

| Módulo | Cor Primária | Ícone |
|--------|--------------|-------|
| Dashboard | Blue (`#3B82F6`) | `Home` |
| Leads | Blue | `Users` |
| Agenda | Blue | `Calendar` |
| Episodes | Blue | `Mic` |
| Finance | Blue | `Wallet` |
| Billing | Blue | `DollarSign` |
| Settings | Blue | `Settings` |

---

## 📋 Checklist para Refatoração

### Fase 1: Setup
- [ ] Criar novo projeto Next.js 16 + React 19
- [ ] Configurar TailwindCSS 4
- [ ] Instalar Shadcn/UI
- [ ] Configurar aliases (@/components, @/lib, etc.)
- [ ] Copiar tokens de cores do DESIGN-SYSTEM.md

### Fase 2: Componentes Base
- [ ] Recriar Button (com variantes)
- [ ] Recriar Card
- [ ] Recriar Input
- [ ] Recriar Table
- [ ] Recriar Badge
- [ ] Recriar Avatar
- [ ] Recriar Dialog
- [ ] Recriar Select
- [ ] Recriar Sidebar
- [ ] Recriar Toast

### Fase 3: Componentes Customizados
- [ ] AppSidebar
- [ ] TopBar
- [ ] EmptyState (genérico + compact)
- [ ] LeadCard (novo)
- [ ] EpisodeCard (novo)
- [ ] BudgetCard (novo)

### Fase 4: Páginas
- [ ] Dashboard (/)
- [ ] Leads (/leads)
- [ ] Agenda (/agenda)
- [ ] Episodes (/episodes)
- [ ] Budget (/budget)
- [ ] Billing (/billing)
- [ ] Settings (/settings)

### Fase 5: Integração
- [ ] Configurar API client
- [ ] Conectar com backend (localhost:3001)
- [ ] Testar todos os fluxos
- [ ] Adicionar error boundaries
- [ ] Adicionar loading skeletons

---

**Próximo passo**: Aguardar confirmação para apagar `apps/web/` e iniciar refatoração do zero.
