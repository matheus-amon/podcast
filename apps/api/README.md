# Podcast SaaS API

Backend API for Podcast SaaS POC built with Bun, ElysiaJS, and Drizzle ORM.

## Quick Start

### Prerequisites

- **Bun** v1.3.6+ - Install: `curl -fsSL https://bun.sh/install | bash`
- **Docker** v20+ - For PostgreSQL database
- **PostgreSQL** - Running via Docker Compose

### 1. Start Database

```bash
# From project root
docker-compose up -d

# Verify database is running
docker-compose ps
```

### 2. Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your database connection string
# Default: DATABASE_URL=postgresql://postgres:postgres@localhost:5432/podcast_saas
```

### 3. Install Dependencies

```bash
bun install
```

### 4. Run Migrations

```bash
bun x drizzle-kit push
```

### 5. Start Server

```bash
# Development (with auto-reload)
bun run --watch src/index.ts

# Production
bun run src/index.ts
```

Server will start at `http://localhost:3001`

## API Documentation

- **Swagger UI**: http://localhost:3001/swagger
- **Health Check**: http://localhost:3001/health

## Available Endpoints

### Core Resources

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/leads` | GET, POST | List/create leads |
| `/api/leads/:id` | GET, PUT, DELETE | Get/update/delete lead |
| `/api/leads/:id/interactions` | GET, POST | List/create interactions |
| `/api/agenda/events` | GET, POST | List/create calendar events |
| `/api/agenda/episodes` | GET, POST | List/create episodes |
| `/api/budget` | GET, POST | List/create budget entries |
| `/api/budget/summary` | GET | Get budget summary |
| `/api/billing` | GET, POST | List/create invoices |
| `/api/dashboard/metrics` | GET | Get dashboard KPIs |
| `/api/whitelabel/config` | GET, POST | Get/update branding |

### Health & Monitoring

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check endpoint |
| `/swagger` | GET | API documentation |

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | - | PostgreSQL connection string |
| `LOG_LEVEL` | No | info | Logging verbosity (error, warn, info, debug) |
| `PORT` | No | 3001 | Server port |

## Development

### Type Checking

```bash
bun run --bun tsc --noEmit
```

### Database Operations

```bash
# View schema in Drizzle Studio
bun x drizzle-kit studio

# Generate migrations
bun x drizzle-kit generate

# Apply migrations
bun x drizzle-kit migrate

# Reset database (WARNING: deletes all data)
docker-compose exec db psql -U postgres -d podcast_saas -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
bun x drizzle-kit push
```

## Project Structure

```
apps/api/
├── src/
│   ├── db/
│   │   ├── index.ts          # Database connection
│   │   └── schema.ts         # Drizzle schema & relations
│   ├── middleware/
│   │   ├── error.middleware.ts   # Global error handling
│   │   └── logger.middleware.ts  # Structured logging
│   ├── modules/
│   │   ├── agenda/         # Calendar & episodes
│   │   ├── billing/        # Invoices
│   │   ├── budget/         # Finance
│   │   ├── dashboard/      # KPIs & metrics
│   │   ├── leads/          # CRM
│   │   └── whitelabel/     # Branding config
│   └── index.ts            # Main entry point
├── .env.example            # Environment template
└── package.json
```

## Error Handling

All errors return a consistent format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {}
  }
}
```

Error codes:
- `VALIDATION_ERROR` (400) - Invalid request body
- `NOT_FOUND` (404) - Resource not found
- `INTERNAL_ERROR` (500) - Server error

## Logging

Structured JSON logging with request ID correlation:

```json
{
  "level": "info",
  "timestamp": "2026-02-18T12:00:00.000Z",
  "event": "request_completed",
  "requestId": "1234567890-abc",
  "method": "GET",
  "path": "/api/leads",
  "status": 200,
  "duration": 45.2
}
```

Set `LOG_LEVEL=debug` for verbose logging.

## Testing

```bash
# Test health endpoint
curl http://localhost:3001/health

# Test API endpoints
curl http://localhost:3001/api/leads

# Create a lead
curl -X POST http://localhost:3001/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "role": "GUEST",
    "status": "PROSPECT"
  }'
```

## Troubleshooting

### Cannot connect to database

1. Verify Docker container is running: `docker-compose ps`
2. Check DATABASE_URL format in `.env`
3. Test connection: `psql postgresql://postgres:postgres@localhost:5432/podcast_saas`

### Port 3001 already in use

Change port in `src/index.ts` or kill the process:
```bash
lsof -i :3001
kill -9 <PID>
```

### Module not found

Reinstall dependencies:
```bash
rm -rf node_modules bun.lock
bun install
```

## License

MIT
