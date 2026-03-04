# PRD-001: Dashboard

**Data**: 2026-03-03  
**Prioridade**: 🔴 Critical  
**Status**: ✅ Aprovado

---

## 📋 Visão Geral

Dashboard principal do Podcast SaaS, fornecendo visão geral das métricas do negócio.

## 🎯 Objetivos

- Mostrar KPIs principais de forma clara
- Prover insights rápidos de receita
- Mostrar atividade recente
- Facilitar ações rápidas

## 👤 User Stories

### US-001: Ver KPIs Principais
**Como** usuário  
**Quero** ver métricas principais  
**Para** ter visão geral do negócio

**Aceite**:
- 4 KPI cards: Total Leads, Active Episodes, Monthly Revenue, Upcoming Events
- Cada card mostra valor, ícone e trend (quando aplicável)
- Click no card leva para página relacionada

### US-002: Ver Tendência de Receita
**Como** usuário  
**Quero** ver gráfico de receita  
**Para** entender performance financeira

**Aceite**:
- Bar chart com receita vs despesas (últimos 6 meses)
- Tooltip com valores
- Responsivo

### US-003: Ver Atividade Recente
**Como** usuário  
**Quero** ver atividade recente  
**Para** saber o que está acontecendo

**Aceite**:
- Lista com últimos leads e episódios
- Avatar + nome + timestamp relativo
- Click leva para detalhe

## 🎨 Design

### Layout
```
┌─────────────────────────────────────────┐
│  Dashboard Title            [Actions]   │
├─────────────────────────────────────────┤
│  [KPI 1] [KPI 2] [KPI 3] [KPI 4]       │
├─────────────────────────────────────────┤
│  ┌─────────────────┐ ┌───────────────┐ │
│  │  Revenue Chart  │ │   Activity    │ │
│  │                 │ │    Feed       │ │
│  │                 │ │               │ │
│  └─────────────────┘ └───────────────┘ │
└─────────────────────────────────────────┘
```

### Componentes
- KPICard x4
- RevenueChart (BarChart)
- ActivityFeed
- PageHeader
- EmptyState (se sem dados)

## 🔌 API

```typescript
GET /api/reports/dashboard
// Returns: { totalLeads, activeEpisodes, monthlyRevenue, upcomingEvents }

GET /api/reports/financial/trend?months=6
// Returns: [{ month, revenue, expenses }, ...]

GET /api/reports/recent-activity?limit=5
// Returns: { recentLeads: [...], recentEpisodes: [...] }
```

## ✅ Critérios de Aceite

- [ ] KPIs exibindo corretamente
- [ ] Chart renderizando dados
- [ ] Activity feed com dados
- [ ] Loading states
- [ ] Error states
- [ ] Empty states (se sem dados)
- [ ] Responsivo (mobile, tablet, desktop)
- [ ] Links funcionando
- [ ] Performance < 2s

---

**Próximo**: PRD-002 (Leads)
