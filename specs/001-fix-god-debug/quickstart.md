# Quickstart Guide: Podcast SaaS POC

**Version**: 1.0.0
**Last Updated**: 2026-02-18
**Branch**: 001-fix-god-debug

---

## Overview

This guide walks you through setting up and running the Podcast SaaS POC locally. Expected setup time: **5-10 minutes**.

---

## Prerequisites

### Required Software

| Tool | Version | Purpose | Install Command |
|------|---------|---------|-----------------|
| **Bun** | v1.3.6+ | JavaScript runtime | `curl -fsSL https://bun.sh/install \| bash` |
| **Docker** | v20+ | Container runtime | [docker.com/get-started](https://www.docker.com/get-started/) |
| **Git** | v2.30+ | Version control | `sudo apt install git` or [git-scm.com](https://git-scm.com) |

### Verify Installation

```bash
# Check Bun version
bun --version
# Expected: 1.3.6 or higher

# Check Docker
docker --version
# Expected: 20.x or higher

# Check Node.js (bundled with Bun)
node --version
# Expected: v18+ or higher
```

---

## Step 1: Clone Repository

```bash
git clone <repository-url> podcast-saas
cd podcast-saas
```

---

## Step 2: Start PostgreSQL Database

```bash
# Start PostgreSQL via Docker Compose
docker-compose up -d

# Verify database is running
docker-compose ps
# Expected: postgres container should be "Up"

# Test database connection
docker-compose exec db psql -U postgres -d podcast_saas -c "SELECT 1;"
# Expected: returns "1"
```

**Troubleshooting**:
- If port 5432 is already in use, edit `docker-compose.yml` and change `"5432:5432"` to `"5433:5432"`
- If Docker fails, ensure Docker Desktop is running (Mac/Windows) or Docker service is started (Linux)

---

## Step 3: Configure Environment Variables

### Backend (.env)

```bash
# Create .env file in apps/api
cd apps/api
cat > .env << EOF
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/podcast_saas
LOG_LEVEL=info
PORT=3001
EOF
```

**Environment Variables**:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | - | PostgreSQL connection string |
| `LOG_LEVEL` | No | info | Logging verbosity (error, warn, info, debug) |
| `PORT` | No | 3001 | Backend server port |

### Frontend (Optional)

Frontend uses default API URL (`http://localhost:3001`). To customize:

```bash
# Create .env.local in apps/web (optional)
cd ../web
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3001
EOF
```

---

## Step 4: Install Dependencies

```bash
# Install backend dependencies
cd apps/api
bun install

# Install frontend dependencies
cd ../web
bun install
```

**Expected Output**:
- Backend: ~60 packages installed
- Frontend: ~300 packages installed

**Troubleshooting**:
- If you see peer dependency warnings, they can be ignored for POC
- If installation fails, try `bun install --force`

---

## Step 5: Run Database Migrations

```bash
cd apps/api
bun x drizzle-kit push
```

**Expected Output**:
```
🚀 drizzle-kit push
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

**Troubleshooting**:
- If you get connection error, verify DATABASE_URL in `.env`
- If table already exists errors appear, drop tables: `docker-compose exec db psql -U postgres -d podcast_saas -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"`

---

## Step 6: Start Backend Server

```bash
cd apps/api
bun run src/index.ts
```

**Expected Output**:
```
🦊 Elysia is running at localhost:3001
```

**Verify Backend**:
1. Open browser: `http://localhost:3001/swagger`
2. Swagger UI should load with all API endpoints documented
3. Try `GET /api/leads` - should return empty array `[]`

**Leave backend running in terminal 1**

---

## Step 7: Start Frontend (New Terminal)

```bash
# Open new terminal tab/window
cd apps/web
bun run dev
```

**Expected Output**:
```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
```

**Verify Frontend**:
1. Open browser: `http://localhost:3000`
2. Dashboard should load with 4 KPI cards:
   - Total Leads: 0
   - Active Episodes: 0
   - Monthly Revenue: $0
   - Upcoming Events: 0
3. Revenue chart should display (mock data for current month)

---

## Step 8: Test the Application

### Test API Endpoints

```bash
# Create a lead
curl -X POST http://localhost:3001/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "company": "Acme Inc",
    "role": "GUEST",
    "status": "PROSPECT"
  }'

# Get all leads
curl http://localhost:3001/api/leads

# Create an episode
curl -X POST http://localhost:3001/api/agenda/episodes \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Episode 1: Introduction",
    "season": 1,
    "number": 1,
    "status": "PLANNED"
  }'
```

### Test Frontend Navigation

1. **Dashboard** (`http://localhost:3000`) - Overview metrics
2. **Leads** (`http://localhost:3000/leads`) - CRM management
3. **Agenda** (`http://localhost:3000/agenda`) - Calendar and episodes
4. **Finance** (`http://localhost:3000/finance`) - Budget and billing
5. **Settings** (`http://localhost:3000/settings`) - Whitelabel config

---

## Development Workflow

### Daily Development

```bash
# Terminal 1 - Backend (auto-reloads on file changes)
cd apps/api
bun run --watch src/index.ts

# Terminal 2 - Frontend (auto-reloads on file changes)
cd apps/web
bun run dev
```

### Database Operations

```bash
# View schema
bun x drizzle-kit studio

# Generate new migration (after schema changes)
bun x drizzle-kit generate

# Apply migrations
bun x drizzle-kit migrate

# Reset database (WARNING: deletes all data)
docker-compose exec db psql -U postgres -d podcast_saas -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
bun x drizzle-kit push
```

### Testing

```bash
# Backend type checking
cd apps/api
bun run --bun tsc --noEmit

# Frontend linting
cd apps/web
bun run lint
```

---

## Common Issues & Solutions

### Issue: "Cannot connect to database"

**Solution**:
1. Verify Docker container is running: `docker-compose ps`
2. Check DATABASE_URL format: `postgresql://user:pass@host:port/dbname`
3. Test connection manually: `psql postgresql://postgres:postgres@localhost:5432/podcast_saas`

### Issue: "Port 3001 already in use"

**Solution**:
```bash
# Find process using port 3001
lsof -i :3001

# Kill process
kill -9 <PID>

# Or change port in apps/api/src/index.ts
```

### Issue: "Module not found" errors

**Solution**:
```bash
# Reinstall dependencies
cd apps/api && rm -rf node_modules bun.lock && bun install
cd apps/web && rm -rf node_modules bun.lock && bun install
```

### Issue: Swagger UI not loading

**Solution**:
1. Verify backend is running: `curl http://localhost:3001/swagger`
2. Check browser console for CORS errors
3. Ensure `@elysiajs/swagger` is installed: `bun install`

### Issue: Frontend shows "Unable to connect to server"

**Solution**:
1. Verify backend is running on port 3001
2. Check browser DevTools Network tab for failed requests
3. Verify no CORS errors in console
4. Try `curl http://localhost:3001/api/dashboard/metrics`

---

## Project Structure

```
podcast-saas/
├── apps/
│   ├── api/                 # Backend (Bun + ElysiaJS + Drizzle)
│   │   ├── src/
│   │   │   ├── db/          # Database connection & schema
│   │   │   ├── modules/     # Feature modules (leads, agenda, etc.)
│   │   │   └── index.ts     # Main entry point
│   │   ├── .env             # Environment variables
│   │   └── package.json
│   │
│   └── web/                 # Frontend (Next.js + Shadcn/UI)
│       ├── app/             # App Router pages
│       ├── components/      # Reusable components
│       ├── lib/             # Utilities
│       └── package.json
│
├── docker-compose.yml       # PostgreSQL configuration
└── README.md
```

---

## Next Steps

After successful setup:

1. **Explore API**: Browse `http://localhost:3001/swagger`
2. **Add Sample Data**: Use Swagger UI or curl to create leads, episodes
3. **Customize Whitelabel**: Go to Settings page
4. **Read Documentation**:
   - [Data Model](./data-model.md) - Database schema
   - [API Contracts](./contracts/) - OpenAPI specification
   - [Constitution](../../.specify/memory/constitution.md) - Project principles

---

## Getting Help

- **Error Messages**: Check logs in terminal where server is running
- **Database Issues**: Run `docker-compose logs db` for PostgreSQL logs
- **Backend Issues**: Run with debug logging: `LOG_LEVEL=debug bun run src/index.ts`
- **Frontend Issues**: Check browser DevTools Console and Network tabs

---

**Setup Status**: ✅ Complete
**Estimated Time**: 5-10 minutes
**Difficulty**: Beginner-friendly
