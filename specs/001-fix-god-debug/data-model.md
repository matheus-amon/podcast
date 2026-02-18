# Data Model: God Mode Debug & Fix

**Feature**: 001-fix-god-debug
**Date**: 2026-02-18
**Purpose**: Document database schema with proper relations and type safety

---

## Overview

This document describes the fixed database schema for Podcast SaaS POC. All tables now include proper foreign key relations, type-safe enums, and audit fields.

**Database**: PostgreSQL 15
**ORM**: Drizzle ORM 0.45
**Total Tables**: 11

---

## Entity Relationship Diagram

```
┌─────────────────┐       ┌──────────────────────┐
│     leads       │       │      episodes        │
├─────────────────┤       ├──────────────────────┤
│ id (PK)         │       │ id (PK)              │
│ name            │       │ title                │
│ email           │       │ description          │
│ role (enum)     │       │ season               │
│ status (enum)   │       │ number               │
│ company         │       │ status (enum)        │
│ position        │       │ publish_date         │
│ avatar_url      │       │ created_at           │
│ bio             │       │ updated_at           │
│ linkedin_url    │       └──────────┬───────────┘
│ tags (jsonb)    │                  │
│ notes           │       ┌──────────┴───────────┐
│ last_contact    │       │                      │
│ created_at      │       │                      │
└────────┬────────┘       │                      │
         │                │                      │
         │ 1:N            │ 1:N                  │
         │                │                      │
         ▼                ▼                      │
┌──────────────────┐  ┌────────────────┐        │
│lead_interactions │  │    scripts     │        │
├──────────────────┤  ├────────────────┤        │
│ id (PK)          │  │ id (PK)        │        │
│ lead_id (FK)     │  │ episode_id(FK) │        │
│ type (enum)      │  │ content        │        │
│ content          │  │ version        │        │
│ date             │  │ last_edited_by │        │
│ created_at       │  │ updated_at     │        │
└──────────────────┘  │ created_at     │        │
                      └────────────────┘        │
                                                │
         ┌──────────────┬──────────────┬────────┴─────────┬──────────────┐
         │              │              │                  │              │
         │ 1:N          │ 1:N          │ 1:N              │ 1:N          │
         ▼              ▼              ▼                  ▼              ▼
┌─────────────┐  ┌────────────┐ ┌──────────────┐ ┌─────────────┐ ┌──────────────┐
│   agenda    │  │   budget   │ │billing       │ │production_  │ │   metrics    │
├─────────────┤  ├────────────┤ ├──────────────┤ ├─────────────┤ ├──────────────┤
│ id (PK)     │  │ id (PK)    │ │ id (PK)      │ │ id (PK)     │ │ id (PK)      │
│ title       │  │ concept    │ │ client_name  │ │ episode_id  │ │ date         │
│ description │  │ amount     │ │ amount       │ │ (FK)        │ │ revenue      │
│ start_date  │  │ type (enum)│ │ due_date     │ │ title       │ │ active_eps   │
│ end_date    │  │ category   │ │ status (enum)│ │ status      │ │ new_leads    │
│ type (enum) │  │ date       │ │ invoice_num  │ │ assignee    │ │ storage_used │
│ lead_id(FK) │  │ resp. (FK) │ │ sub. plan    │ │ due_date    │ │ created_at   │
│ episode_id  │  │ status     │ │ created_at   │ │ created_at  │ └──────────────┘
│ participants│  │ created_at │ └──────────────┘ └─────────────┘
│ color       │  └─────┬──────┘
│ created_at  │        │
└─────────────┘        │
                       │
                ┌──────┴──────────┐
                │ budget_templates│
                ├─────────────────┤
                │ id (PK)         │
                │ name            │
                │ items (jsonb)   │
                │ created_at      │
                └─────────────────┘

┌──────────────────┐
│ whitelabel_config│
├──────────────────┤
│ id (PK)          │
│ logo_url         │
│ primary_color    │
│ secondary_color  │
│ company_name     │
│ subdomain        │
│ updated_at       │
└──────────────────┘
```

---

## Table Definitions

### Leads

CRM contacts for podcast guests and collaborators.

```typescript
leads: {
  id: serial PK
  name: text NOT NULL
  email: text NOT NULL
  role: role_enum DEFAULT 'GUEST'  // GUEST | HOST | PRODUCER
  status: lead_status_enum DEFAULT 'PROSPECT'  // PROSPECT | CONTACTED | CONFIRMED | RECORDED
  company: text
  position: text
  avatar_url: text
  bio: text
  linkedin_url: text
  tags: jsonb  // Array of strings
  notes: text
  last_contact: timestamp
  created_at: timestamp DEFAULT NOW()
}
```

**Relations**:
- `has many` lead_interactions
- `has many` agenda events (as lead_id)

**Validation Rules**:
- Email must be valid format
- Role must be one of: GUEST, HOST, PRODUCER
- Status must be one of: PROSPECT, CONTACTED, CONFIRMED, RECORDED

---

### Lead Interactions

History of communications with leads.

```typescript
lead_interactions: {
  id: serial PK
  lead_id: integer FK → leads.id NOT NULL
  type: lead_interaction_type_enum DEFAULT 'OTHER'  // EMAIL | CALL | MESSAGE | MEETING | OTHER
  content: text NOT NULL
  date: timestamp DEFAULT NOW()
  created_at: timestamp DEFAULT NOW()
}
```

**Relations**:
- `belongs to` leads (lead_id)

**Validation Rules**:
- lead_id must reference existing lead
- Type must be one of: EMAIL, CALL, MESSAGE, MEETING, OTHER

---

### Episodes

Podcast content/episodes.

```typescript
episodes: {
  id: serial PK
  title: text NOT NULL
  description: text
  season: integer DEFAULT 1
  number: integer
  status: episode_status_enum DEFAULT 'PLANNED'  // PLANNED | SCRIPTING | RECORDED | EDITING | PUBLISHED
  publish_date: timestamp
  created_at: timestamp DEFAULT NOW()
  updated_at: timestamp  // NEW: for audit
}
```

**Relations**:
- `has one` scripts
- `has many` agenda events (as episode_id)
- `has many` budget entries
- `has many` production tasks

**Validation Rules**:
- Status must be one of: PLANNED, SCRIPTING, RECORDED, EDITING, PUBLISHED
- Season must be positive integer
- Number should be unique within season

---

### Scripts

Episode scripts with versioning.

```typescript
scripts: {
  id: serial PK
  episode_id: integer FK → episodes.id NOT NULL
  content: text  // Markdown content
  version: integer DEFAULT 1
  last_edited_by: text
  updated_at: timestamp DEFAULT NOW()
  created_at: timestamp DEFAULT NOW()
}
```

**Relations**:
- `belongs to` episodes (episode_id)

**Validation Rules**:
- episode_id must reference existing episode
- Version must be positive integer

---

### Agenda

Calendar events and recordings.

```typescript
agenda: {
  id: serial PK
  title: text NOT NULL
  description: text
  start_date: timestamp NOT NULL
  end_date: timestamp NOT NULL
  type: event_type_enum DEFAULT 'MEETING'  // RECORDING | RELEASE | MEETING | OTHER
  lead_id: integer FK → leads.id
  episode_id: integer FK → episodes.id
  participants: jsonb  // Array of emails or names
  color: text DEFAULT '#3B82F6'
  created_at: timestamp DEFAULT NOW()
}
```

**Relations**:
- `belongs to` leads (lead_id, optional)
- `belongs to` episodes (episode_id, optional)

**Validation Rules**:
- end_date must be after start_date
- Type must be one of: RECORDING, RELEASE, MEETING, OTHER
- Color must be valid hex color code

---

### Production Tasks

Tasks for episode production workflow.

```typescript
production_tasks: {
  id: serial PK
  episode_id: integer FK → episodes.id
  title: text NOT NULL
  status: task_status_enum DEFAULT 'TODO'  // TODO | IN_PROGRESS | DONE
  assignee: text
  due_date: timestamp
  created_at: timestamp DEFAULT NOW()
}
```

**Relations**:
- `belongs to` episodes (episode_id)

**Validation Rules**:
- Status must be one of: TODO, IN_PROGRESS, DONE
- due_date must be in future (for new tasks)

---

### Budget

Financial transactions (income and expenses).

```typescript
budget: {
  id: serial PK
  concept: text NOT NULL
  amount: double_precision NOT NULL
  type: budget_type_enum DEFAULT 'EXPENSE'  // INCOME | EXPENSE
  category: text NOT NULL  // Production, Marketing, Equipment, etc.
  date: date DEFAULT CURRENT_DATE
  responsible: text
  status: budget_status_enum DEFAULT 'PENDING'  // PLANNED | APPROVED | PAID | PENDING
  connected_episode_id: integer FK → episodes.id
  created_at: timestamp DEFAULT NOW()
}
```

**Relations**:
- `belongs to` episodes (connected_episode_id, optional)

**Validation Rules**:
- Amount must be positive
- Type must be one of: INCOME, EXPENSE
- Category cannot be empty
- Status must be one of: PLANNED, APPROVED, PAID, PENDING

---

### Budget Templates

Reusable budget item groups.

```typescript
budget_templates: {
  id: serial PK
  name: text NOT NULL
  items: jsonb NOT NULL  // Array of { concept, amount, type, category }
  created_at: timestamp DEFAULT NOW()
}
```

**Validation Rules**:
- Items array cannot be empty
- Each item must have: concept, amount, type, category

---

### Billing

Invoices and receivables.

```typescript
billing: {
  id: serial PK
  client_name: text NOT NULL
  amount: double_precision NOT NULL
  due_date: date NOT NULL
  status: billing_status_enum DEFAULT 'PENDING'  // PAID | PENDING | OVERDUE
  invoice_number: text
  subscription_plan: text  // BASIC, PRO, ENTERPRISE
  created_at: timestamp DEFAULT NOW()
}
```

**Validation Rules**:
- Amount must be positive
- Status must be one of: PAID, PENDING, OVERDUE
- Invoice number should be unique if provided

---

### Metrics

Analytics snapshots.

```typescript
metrics: {
  id: serial PK
  date: date NOT NULL
  revenue: double_precision DEFAULT 0
  active_episodes: integer DEFAULT 0
  new_leads: integer DEFAULT 0
  storage_used: double_precision DEFAULT 0  // in GB
  created_at: timestamp DEFAULT NOW()
}
```

**Validation Rules**:
- Date should be unique (one snapshot per day)
- All numeric fields must be non-negative

---

### Whitelabel Config

Branding and customization settings.

```typescript
whitelabel_config: {
  id: serial PK
  logo_url: text
  primary_color: text DEFAULT '#3B82F6'
  secondary_color: text DEFAULT '#1E40AF'
  company_name: text DEFAULT 'Podcast SaaS'
  subdomain: text
  updated_at: timestamp DEFAULT NOW()
}
```

**Validation Rules**:
- Colors must be valid hex color codes
- Only one row should exist (singleton table)

---

## Enums

```typescript
role_enum: 'GUEST' | 'HOST' | 'PRODUCER'
lead_status_enum: 'PROSPECT' | 'CONTACTED' | 'CONFIRMED' | 'RECORDED'
lead_interaction_type_enum: 'EMAIL' | 'CALL' | 'MESSAGE' | 'MEETING' | 'OTHER'
episode_status_enum: 'PLANNED' | 'SCRIPTING' | 'RECORDED' | 'EDITING' | 'PUBLISHED'
task_status_enum: 'TODO' | 'IN_PROGRESS' | 'DONE'
budget_type_enum: 'INCOME' | 'EXPENSE'
budget_status_enum: 'PLANNED' | 'APPROVED' | 'PAID' | 'PENDING'
billing_status_enum: 'PAID' | 'PENDING' | 'OVERDUE'
event_type_enum: 'RECORDING' | 'RELEASE' | 'MEETING' | 'OTHER'
```

---

## Relations (Drizzle ORM)

```typescript
// leads.ts
export const leadsRelations = relations(leads, ({ many }) => ({
  interactions: many(leadInteractions),
  agendaEvents: many(agenda),
}));

// lead_interactions.ts
export const leadInteractionsRelations = relations(leadInteractions, ({ one }) => ({
  lead: one(leads, {
    fields: [leadInteractions.leadId],
    references: [leads.id],
  }),
}));

// episodes.ts
export const episodesRelations = relations(episodes, ({ many }) => ({
  scripts: many(scripts),
  agendaEvents: many(agenda),
  budgetEntries: many(budget),
  productionTasks: many(productionTasks),
}));

// scripts.ts
export const scriptsRelations = relations(scripts, ({ one }) => ({
  episode: one(episodes, {
    fields: [scripts.episodeId],
    references: [episodes.id],
  }),
}));

// agenda.ts
export const agendaRelations = relations(agenda, ({ one }) => ({
  lead: one(leads, {
    fields: [agenda.leadId],
    references: [leads.id],
  }),
  episode: one(episodes, {
    fields: [agenda.episodeId],
    references: [episodes.id],
  }),
}));

// budget.ts
export const budgetRelations = relations(budget, ({ one }) => ({
  episode: one(episodes, {
    fields: [budget.connectedEpisodeId],
    references: [episodes.id],
  }),
}));

// production_tasks.ts
export const productionTasksRelations = relations(productionTasks, ({ one }) => ({
  episode: one(episodes, {
    fields: [productionTasks.episodeId],
    references: [episodes.id],
  }),
}));
```

---

## Indexes (Recommended)

```sql
-- Performance indexes
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);

CREATE INDEX idx_lead_interactions_lead_id ON lead_interactions(lead_id);
CREATE INDEX idx_lead_interactions_date ON lead_interactions(date DESC);

CREATE INDEX idx_episodes_status ON episodes(status);
CREATE INDEX idx_episodes_publish_date ON episodes(publish_date DESC);

CREATE INDEX idx_agenda_start_date ON agenda(start_date DESC);
CREATE INDEX idx_agenda_lead_id ON agenda(lead_id);
CREATE INDEX idx_agenda_episode_id ON agenda(episode_id);

CREATE INDEX idx_budget_type ON budget(type);
CREATE INDEX idx_budget_category ON budget(category);
CREATE INDEX idx_budget_date ON budget(date DESC);
CREATE INDEX idx_budget_episode_id ON budget(connected_episode_id);

CREATE INDEX idx_billing_status ON billing(status);
CREATE INDEX idx_billing_due_date ON billing(due_date);

CREATE INDEX idx_production_tasks_episode_id ON production_tasks(episode_id);
CREATE INDEX idx_production_tasks_status ON production_tasks(status);
```

---

## Migration Strategy

**Approach**: Use Drizzle Kit push for POC, migrate to versioned migrations later.

```bash
# Development (current)
bun x drizzle-kit push

# Production (future)
bun x drizzle-kit generate
bun x drizzle-kit migrate
```

**Schema Changes Required**:
1. Add `updated_at` to episodes table
2. Add relations definitions to schema.ts
3. Add indexes for performance

---

## Audit Logging

All tables include audit fields:

| Field | Type | Default | Purpose |
|-------|------|---------|---------|
| `created_at` | timestamp | NOW() | When record was created |
| `updated_at` | timestamp | - | When record was last updated (manual or trigger) |
| `deleted_at` | timestamp | - | Soft delete timestamp (future enhancement) |

**Future Enhancement**: Add trigger for automatic `updated_at` updates:

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_episodes_updated_at
    BEFORE UPDATE ON episodes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

---

**Data Model Status**: ✅ Complete
**Relations Defined**: Yes
**Type Safety**: Full TypeScript types via Drizzle
**Ready for Implementation**: Yes
