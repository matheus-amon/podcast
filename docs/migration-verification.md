# Migration Verification Guide

**Feature**: 001-fix-god-debug
**Date**: 2026-02-18
**Database**: PostgreSQL 15
**ORM**: Drizzle ORM 0.45

---

## Overview

This document provides verification steps for database migrations in the Podcast SaaS POC project. Use these commands to verify that all tables, indexes, enums, and foreign key constraints are created correctly.

---

## Quick Verification

### Run Migration

```bash
cd apps/api
bun x drizzle-kit push
```

**Expected Output**:
```
✓ Connected to database
✓ Creating table: leads
✓ Creating table: lead_interactions
✓ Creating table: episodes
✓ Creating table: scripts
✓ Creating table: agenda
✓ Creating table: production_tasks
✓ Creating table: budget
✓ Creating table: budget_templates
✓ Creating table: billing
✓ Creating table: metrics
✓ Creating table: whitelabel_config
✓ Schema pushed successfully
```

---

## Connect to Database

```bash
docker compose exec db psql -U postgres -d podcast_saas
```

---

## Verify Tables (11 Total)

```sql
\dt
```

**Expected Tables**:
| Schema | Name              | Type  | Owner    |
|--------|-------------------|-------|----------|
| public | agenda            | table | postgres |
| public | billing           | table | postgres |
| public | budget            | table | postgres |
| public | budget_templates  | table | postgres |
| public | episodes          | table | postgres |
| public | lead_interactions | table | postgres |
| public | leads             | table | postgres |
| public | metrics           | table | postgres |
| public | production_tasks  | table | postgres |
| public | scripts           | table | postgres |
| public | whitelabel_config | table | postgres |

---

## Verify Enums (9 Total)

```sql
SELECT typname FROM pg_type WHERE typtype = 'e' ORDER BY typname;
```

**Expected Enums**:
1. `billing_status` - PAID, PENDING, OVERDUE
2. `budget_status` - PLANNED, APPROVED, PAID, PENDING
3. `budget_type` - INCOME, EXPENSE
4. `episode_status` - PLANNED, SCRIPTING, RECORDED, EDITING, PUBLISHED
5. `event_type` - RECORDING, RELEASE, MEETING, OTHER
6. `lead_interaction_type` - EMAIL, CALL, MESSAGE, MEETING, OTHER
7. `lead_status` - PROSPECT, CONTACTED, CONFIRMED, RECORDED
8. `role` - GUEST, HOST, PRODUCER
9. `task_status` - TODO, IN_PROGRESS, DONE

---

## Verify Indexes (18 Custom Indexes + Primary Keys)

```sql
\di
```

**Expected Custom Indexes**:

### Leads (3 indexes)
- `idx_leads_email` - Unique lookup by email
- `idx_leads_status` - Filter by status
- `idx_leads_created_at` - Order by creation date (DESC)

### Lead Interactions (2 indexes)
- `idx_lead_interactions_lead_id` - Foreign key lookup
- `idx_lead_interactions_date` - Order by date (DESC)

### Episodes (2 indexes)
- `idx_episodes_status` - Filter by status
- `idx_episodes_publish_date` - Order by publish date (DESC)

### Agenda (3 indexes)
- `idx_agenda_start_date` - Order by start date (DESC)
- `idx_agenda_lead_id` - Foreign key lookup
- `idx_agenda_episode_id` - Foreign key lookup

### Production Tasks (2 indexes)
- `idx_production_tasks_episode_id` - Foreign key lookup
- `idx_production_tasks_status` - Filter by status

### Budget (4 indexes)
- `idx_budget_type` - Filter by type (INCOME/EXPENSE)
- `idx_budget_category` - Filter by category
- `idx_budget_date` - Order by date (DESC)
- `idx_budget_episode_id` - Foreign key lookup

### Billing (2 indexes)
- `idx_billing_status` - Filter by status
- `idx_billing_due_date` - Order by due date

---

## Verify Foreign Key Constraints (6 Total)

```sql
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name;
```

**Expected Foreign Keys**:

| Table             | Column             | References Table | References Column |
|-------------------|--------------------|------------------|-------------------|
| agenda            | lead_id            | leads            | id                |
| agenda            | episode_id         | episodes         | id                |
| budget            | connected_episode_id | episodes       | id                |
| lead_interactions | lead_id            | leads            | id                |
| production_tasks  | episode_id         | episodes         | id                |
| scripts           | episode_id         | episodes         | id                |

---

## Test Referential Integrity

### Test 1: Try to delete a lead with interactions (should fail)

```sql
-- Create test data
INSERT INTO leads (name, email) VALUES ('Test Lead', 'test@example.com') RETURNING id;
-- Note the returned ID (e.g., 1)

INSERT INTO lead_interactions (lead_id, content) VALUES (1, 'Test interaction') RETURNING id;

-- Try to delete the lead (should fail)
DELETE FROM leads WHERE id = 1;
```

**Expected Error**:
```
ERROR:  update or delete on table "leads" violates foreign key constraint 
"lead_interactions_lead_id_leads_id_fk" on table "lead_interactions"
DETAIL:  Key (id)=(1) is still referenced from table "lead_interactions".
```

### Cleanup

```sql
DELETE FROM lead_interactions WHERE lead_id = 1;
DELETE FROM leads WHERE id = 1;
```

---

## Table Schema Details

### leads

```sql
\d leads
```

**Columns**:
- `id` (serial, PK)
- `name` (text, NOT NULL)
- `email` (text, NOT NULL)
- `role` (role_enum, DEFAULT 'GUEST')
- `status` (lead_status_enum, DEFAULT 'PROSPECT')
- `company` (text)
- `position` (text)
- `avatar_url` (text)
- `bio` (text)
- `linkedin_url` (text)
- `tags` (jsonb)
- `notes` (text)
- `last_contact` (timestamp)
- `created_at` (timestamp, DEFAULT NOW())

### lead_interactions

```sql
\d lead_interactions
```

**Columns**:
- `id` (serial, PK)
- `lead_id` (integer, FK → leads.id, NOT NULL)
- `type` (lead_interaction_type_enum, DEFAULT 'OTHER')
- `content` (text, NOT NULL)
- `date` (timestamp, DEFAULT NOW())
- `created_at` (timestamp, DEFAULT NOW())

### episodes

```sql
\d episodes
```

**Columns**:
- `id` (serial, PK)
- `title` (text, NOT NULL)
- `description` (text)
- `season` (integer, DEFAULT 1)
- `number` (integer)
- `status` (episode_status_enum, DEFAULT 'PLANNED')
- `publish_date` (timestamp)
- `created_at` (timestamp, DEFAULT NOW())
- `updated_at` (timestamp, DEFAULT NOW())

### scripts

```sql
\d scripts
```

**Columns**:
- `id` (serial, PK)
- `episode_id` (integer, FK → episodes.id, NOT NULL)
- `content` (text)
- `version` (integer, DEFAULT 1)
- `last_edited_by` (text)
- `updated_at` (timestamp, DEFAULT NOW())
- `created_at` (timestamp, DEFAULT NOW())

### agenda

```sql
\d agenda
```

**Columns**:
- `id` (serial, PK)
- `title` (text, NOT NULL)
- `description` (text)
- `start_date` (timestamp, NOT NULL)
- `end_date` (timestamp, NOT NULL)
- `type` (event_type_enum, DEFAULT 'MEETING')
- `lead_id` (integer, FK → leads.id)
- `episode_id` (integer, FK → episodes.id)
- `participants` (jsonb)
- `color` (text, DEFAULT '#3B82F6')
- `created_at` (timestamp, DEFAULT NOW())

### production_tasks

```sql
\d production_tasks
```

**Columns**:
- `id` (serial, PK)
- `episode_id` (integer, FK → episodes.id)
- `title` (text, NOT NULL)
- `status` (task_status_enum, DEFAULT 'TODO')
- `assignee` (text)
- `due_date` (timestamp)
- `created_at` (timestamp, DEFAULT NOW())

### budget

```sql
\d budget
```

**Columns**:
- `id` (serial, PK)
- `concept` (text, NOT NULL)
- `amount` (double precision, NOT NULL)
- `type` (budget_type_enum, DEFAULT 'EXPENSE')
- `category` (text, NOT NULL)
- `date` (date, DEFAULT CURRENT_DATE)
- `responsible` (text)
- `status` (budget_status_enum, DEFAULT 'PENDING')
- `connected_episode_id` (integer, FK → episodes.id)
- `created_at` (timestamp, DEFAULT NOW())

### budget_templates

```sql
\d budget_templates
```

**Columns**:
- `id` (serial, PK)
- `name` (text, NOT NULL)
- `items` (jsonb)
- `created_at` (timestamp, DEFAULT NOW())

### billing

```sql
\d billing
```

**Columns**:
- `id` (serial, PK)
- `client_name` (text, NOT NULL)
- `amount` (double precision, NOT NULL)
- `due_date` (date, NOT NULL)
- `status` (billing_status_enum, DEFAULT 'PENDING')
- `invoice_number` (text)
- `subscription_plan` (text)
- `created_at` (timestamp, DEFAULT NOW())

### metrics

```sql
\d metrics
```

**Columns**:
- `id` (serial, PK)
- `date` (date, NOT NULL)
- `revenue` (double precision, DEFAULT 0)
- `active_episodes` (integer, DEFAULT 0)
- `new_leads` (integer, DEFAULT 0)
- `storage_used` (double precision, DEFAULT 0)
- `created_at` (timestamp, DEFAULT NOW())

### whitelabel_config

```sql
\d whitelabel_config
```

**Columns**:
- `id` (serial, PK)
- `logo_url` (text)
- `primary_color` (text, DEFAULT '#3B82F6')
- `secondary_color` (text, DEFAULT '#1E40AF')
- `company_name` (text, DEFAULT 'Podcast SaaS')
- `subdomain` (text)
- `updated_at` (timestamp, DEFAULT NOW())

---

## Automated Verification Script

Create a shell script for quick verification:

```bash
#!/bin/bash
# verify-migration.sh

echo "=== Migration Verification ==="
echo ""

echo "1. Checking tables..."
docker compose exec db psql -U postgres -d podcast_saas -c "\dt" | grep -c "public"
echo "   Expected: 11 tables"
echo ""

echo "2. Checking enums..."
docker compose exec db psql -U postgres -d podcast_saas -c "SELECT count(*) FROM pg_type WHERE typtype = 'e';"
echo "   Expected: 9 enums"
echo ""

echo "3. Checking custom indexes (excluding primary keys)..."
docker compose exec db psql -U postgres -d podcast_saas -c "SELECT count(*) FROM pg_indexes WHERE indexname LIKE 'idx_%';"
echo "   Expected: 18 indexes"
echo ""

echo "4. Checking foreign key constraints..."
docker compose exec db psql -U postgres -d podcast_saas -c "SELECT count(*) FROM information_schema.table_constraints WHERE constraint_type = 'FOREIGN KEY';"
echo "   Expected: 6 foreign keys"
echo ""

echo "=== Verification Complete ==="
```

---

## Troubleshooting

### Issue: Migration fails with connection error

**Solution**:
```bash
# Check if database is running
docker compose ps

# Restart database if needed
docker compose restart db

# Wait for database to be ready
sleep 5

# Retry migration
bun x drizzle-kit push
```

### Issue: Tables already exist

**Solution** (WARNING: Deletes all data):
```bash
# Reset database
docker compose exec db psql -U postgres -d podcast_saas -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Re-run migration
bun x drizzle-kit push
```

### Issue: Missing indexes

**Solution**:
```bash
# Drop and recreate indexes manually
docker compose exec db psql -U postgres -d podcast_saas -c "DROP INDEX IF EXISTS idx_leads_email;"
bun x drizzle-kit push
```

---

## Success Criteria

- ✅ All 11 tables created via `drizzle-kit push`
- ✅ All 9 enums created correctly
- ✅ All 18 custom indexes created (verify with `\di`)
- ✅ All 6 foreign key constraints exist
- ✅ Migration completes without errors
- ✅ Referential integrity enforced (tested)

---

**Verification Status**: ✅ Complete
**Last Verified**: 2026-02-18
