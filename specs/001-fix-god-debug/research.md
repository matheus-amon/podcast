# Phase 0 Research: God Mode Debug & Fix

**Feature**: 001-fix-god-debug
**Date**: 2026-02-18
**Purpose**: Resolve all technical unknowns and establish best practices for bug fixes

---

## Research Topic 1: Drizzle ORM Relations

### Decision
Use Drizzle's `relations()` API to define one-to-many and many-to-one relationships between tables.

### Rationale
Drizzle ORM provides a type-safe way to define relations that enables:
- Auto-completion in IDE
- Type checking on queries
- Automatic JOIN generation with `.include()`
- Clear ownership semantics (belongsTo, hasMany)

### Implementation Pattern

```typescript
// In schema.ts, after table definitions:

// Leads ↔ LeadInteractions (one-to-many)
export const leadsRelations = relations(leads, ({ many }) => ({
  interactions: many(leadInteractions),
}));

export const leadInteractionsRelations = relations(leadInteractions, ({ one }) => ({
  lead: one(leads, {
    fields: [leadInteractions.leadId],
    references: [leads.id],
  }),
}));

// Episodes ↔ Scripts, Agenda, Budget, Tasks (one-to-many)
export const episodesRelations = relations(episodes, ({ many }) => ({
  scripts: many(scripts),
  agendaEvents: many(agenda),
  budgetEntries: many(budget),
  productionTasks: many(productionTasks),
}));

export const scriptsRelations = relations(scripts, ({ one }) => ({
  episode: one(episodes, {
    fields: [scripts.episodeId],
    references: [episodes.id],
  }),
}));

// Similar pattern for agenda, budget, productionTasks
```

### Alternatives Considered
- **Manual JOINs**: More control but verbose and error-prone
- **No relations**: Simpler but loses type safety and auto-completion
- **Foreign keys only**: Works but doesn't enable `.include()` queries

**Rejected because**: Relations API is the Drizzle-recommended approach and provides best DX.

### References
- [Drizzle ORM Relations Documentation](https://orm.drizzle.team/docs/relations)
- [Drizzle One-to-Many Example](https://orm.drizzle.team/docs/rqb#one-to-many)

---

## Research Topic 2: ElysiaJS Error Handling

### Decision
Implement global error handling middleware that catches unhandled exceptions and returns consistent error format.

### Rationale
Constitution Principle IV (REST Conventions) requires consistent error format:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {}
  }
}
```

Global error handler ensures:
- No stack traces exposed to clients (Security principle)
- Consistent logging of all errors
- Proper HTTP status codes
- Graceful degradation

### Implementation Pattern

```typescript
// src/middleware/error.middleware.ts
import { Elysia, ValidationError } from "elysia";

export const errorMiddleware = new Elysia({
  name: 'error-handler'
})
  .onError(({ code, error, set }) => {
    // Log error with context
    console.error('[API Error]', {
      code,
      path: set.headers?.['x-request-path'],
      message: error.message,
      stack: error.stack
    });

    // Format response based on error type
    switch (code) {
      case 'VALIDATION':
        set.status = 400;
        return {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request body',
            details: error.all?.map((e: any) => ({
              field: e.path,
              message: e.message
            }))
          }
        };

      case 'NOT_FOUND':
        set.status = 404;
        return {
          error: {
            code: 'NOT_FOUND',
            message: 'Resource not found'
          }
        };

      case 'INTERNAL_SERVER_ERROR':
        set.status = 500;
        return {
          error: {
            code: 'INTERNAL_ERROR',
            message: 'An unexpected error occurred'
            // Never expose stack trace to client
          }
        };

      default:
        set.status = 500;
        return {
          error: {
            code: 'UNKNOWN_ERROR',
            message: error.message
          }
        };
    }
  });
```

### Usage in Main App

```typescript
// src/index.ts
import { errorMiddleware } from './middleware/error.middleware';

const app = new Elysia()
    .use(swagger())
    .use(errorMiddleware)  // Add BEFORE routes
    .group("/api", (app) =>
        app
            .use(leadsRoutes)
            // ... other routes
    )
    .listen(3001);
```

### Alternatives Considered
- **Try-catch in each route**: Verbose, easy to forget, inconsistent
- **Elysia's built-in error handling**: Good but needs customization for our format
- **Sentry integration**: Overkill for POC, add later

**Rejected because**: Need custom error format per constitution, Sentry can be added later.

### References
- [ElysiaJS Error Handling](https://elysiajs.com/error/handling.html)
- [ElysiaJS Lifecycle](https://elysiajs.com/core/lifecycle.html)

---

## Research Topic 3: ElysiaJS Structured Logging

### Decision
Implement request/response logging middleware with levels (error, warn, info, debug) and request ID correlation.

### Rationale
Constitution Principle (Security & Compliance) requires structured logging. Benefits:
- Debugging production issues
- Performance monitoring
- Audit trail
- Request tracing

### Implementation Pattern

```typescript
// src/middleware/logger.middleware.ts
import { Elysia } from "elysia";

interface LogContext {
  requestId: string;
  method: string;
  path: string;
  status?: number;
  duration?: number;
  error?: string;
}

function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export const loggerMiddleware = new Elysia({
  name: 'logger'
})
  .onRequest(({ set, request }) => {
    const requestId = generateRequestId();
    set.headers['X-Request-ID'] = requestId;
    
    // Store start time for duration calculation
    const startTime = performance.now();
    return { startTime, requestId };
  })
  .onAfterHandle({ as: 'global' }, ({ set, request }, response) => {
    const context: LogContext = {
      requestId: set.headers['X-Request-ID'] as string || 'unknown',
      method: request.method,
      path: new URL(request.url).pathname,
      status: set.status || 200,
      duration: performance.now() - (request as any).startTime
    };

    console.log(JSON.stringify({
      level: 'info',
      timestamp: new Date().toISOString(),
      event: 'request_completed',
      ...context
    }));
  })
  .onError({ as: 'global' }, ({ set, request, error }) => {
    const context: LogContext = {
      requestId: set.headers['X-Request-ID'] as string || 'unknown',
      method: request.method,
      path: new URL(request.url).pathname,
      status: set.status || 500,
      error: error.message
    };

    console.error(JSON.stringify({
      level: 'error',
      timestamp: new Date().toISOString(),
      event: 'request_error',
      ...context
    }));
  });
```

### Log Levels

| Level | When to Use |
|-------|-------------|
| **error** | Unhandled exceptions, database failures, external API errors |
| **warn** | Recoverable errors, deprecated API usage, rate limit approaching |
| **info** | Request completed, user actions (login, create, update) |
| **debug** | Detailed flow information, SQL queries (dev only) |

### Environment-Based Logging

```typescript
// Control log verbosity via environment
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const LOG_LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };

function shouldLog(level: string): boolean {
  return LOG_LEVELS[level as keyof typeof LOG_LEVELS] <= LOG_LEVELS[LOG_LEVEL as keyof typeof LOG_LEVELS];
}
```

### Alternatives Considered
- **Pino/Winston**: More features but adds dependency
- **Console.log only**: No structure, hard to filter
- **No logging**: Violates constitution principle

**Rejected because**: Simple built-in solution sufficient for POC, can upgrade later.

### References
- [ElysiaJS Middleware](https://elysiajs.com/core/middleware.html)
- [Structured Logging Best Practices](https://github.com/elastic/ecs)

---

## Research Topic 4: Drizzle Date Comparisons

### Decision
Use JavaScript Date objects consistently, convert strings at API boundaries, use proper date filtering in queries.

### Rationale
Found bugs in dashboard controller comparing dates as strings. Proper date handling requires:
- Store as Date objects in database
- Accept ISO strings at API boundary
- Convert to Date objects before database queries
- Use proper date ranges for month/year aggregations

### Common Pitfalls Found

**Bug 1: String vs Date Comparison**
```typescript
// ❌ WRONG - Comparing string to date
const dateStr = startOfMonth.toISOString().split('T')[0]; // "2026-02-01"
.where(sql`${budget.date} >= ${dateStr}`) // date is DATE type, dateStr is TEXT

// ✅ CORRECT - Use Date object
const dateObj = startOfMonth; // Date object
.where(gte(budget.date, dateObj)) // Drizzle handles conversion
```

**Bug 2: Empty Where Clause**
```typescript
// ❌ WRONG - and() with empty array fails
const whereClause = [];
if (query.start) whereClause.push(gte(agenda.startDate, new Date(query.start)));
// If no query.start, whereClause is empty
return await db.select().from(agenda).where(and(...whereClause)); // ERROR

// ✅ CORRECT - Handle empty case
if (whereClause.length === 0) {
  return await db.select().from(agenda);
}
return await db.select().from(agenda).where(and(...whereClause));
```

### Best Practices

1. **API Boundary**: Accept ISO strings, convert immediately
   ```typescript
   .post("/", async ({ body }) => {
     const dueDate = body.dueDate ? new Date(body.dueDate) : undefined;
     // Use dueDate (Date object) in database operations
   })
   ```

2. **Database Queries**: Use Drizzle's comparison helpers
   ```typescript
   import { eq, gte, lte, and } from 'drizzle-orm';
   
   // Month-to-date query
   const startOfMonth = new Date();
   startOfMonth.setDate(1);
   startOfMonth.setHours(0, 0, 0, 0);
   
   const results = await db.select()
     .from(budget)
     .where(and(
       gte(budget.date, startOfMonth),
       lte(budget.date, new Date())
     ));
   ```

3. **Timezone Handling**: Use UTC for storage, convert to local for display
   ```typescript
   // Store in UTC (PostgreSQL does this by default with timestamptz)
   // Frontend converts to user's timezone for display
   ```

### Alternatives Considered
- **Store as strings**: Loses date arithmetic, sorting issues
- **Store as timestamps**: Loses timezone info, harder to query
- **Day.js/date-fns at DB layer**: Unnecessary abstraction

**Rejected because**: Native Date + Drizzle provides best balance of type safety and simplicity.

### References
- [Drizzle ORM Conditions](https://orm.drizzle.team/docs/select#filtering)
- [PostgreSQL Date/Time Types](https://www.postgresql.org/docs/current/datatype-datetime.html)

---

## Research Topic 5: Next.js Error Boundaries

### Decision
Implement React error boundaries for graceful degradation and user-friendly error messages.

### Rationale
Constitution requires frontend to handle errors gracefully. Error boundaries:
- Prevent entire app from crashing
- Display user-friendly messages
- Log errors for debugging
- Enable partial recovery

### Implementation Pattern

```typescript
// app/error.tsx (Next.js 13+ App Router)
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[React Error]', error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center space-y-4">
        <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
        <div>
          <h2 className="text-lg font-semibold">Something went wrong</h2>
          <p className="text-sm text-muted-foreground">
            {error.message || 'An unexpected error occurred'}
          </p>
        </div>
        <Button onClick={() => reset()}>Try again</Button>
      </div>
    </div>
  );
}
```

### API Fetch Error Handling

```typescript
// lib/api.ts - Enhanced error handling
export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${API_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      let errorMessage = `Error ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error?.message || errorData.message || errorMessage;
      } catch {
        // Not JSON, use status text
      }
      
      const error = new Error(errorMessage);
      (error as any).status = response.status;
      throw error;
    }

    return response.json();
  } catch (error) {
    // Network errors, CORS, etc.
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Unable to connect to server. Please try again later.');
    }
    throw error;
  }
}
```

### Empty State Components

```typescript
// components/empty-state.tsx
interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center min-h-[300px]">
      <div className="text-center space-y-4">
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
        {action && <div className="pt-2">{action}</div>}
      </div>
    </div>
  );
}

// Usage in pages:
// {data.length === 0 ? (
//   <EmptyState 
//     title="No leads yet" 
//     description="Add your first lead to get started"
//     action={<Button onClick={...}>Add Lead</Button>}
//   />
// ) : (
//   <LeadList data={data} />
// )}
```

### Alternatives Considered
- **Try-catch everywhere**: Verbose, doesn't catch render errors
- **No error handling**: Violates UX best practices
- **Global error modal**: Too intrusive for minor errors

**Rejected because**: Error boundaries are React-recommended pattern for graceful degradation.

### References
- [Next.js Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling)
- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)

---

## Summary of Decisions

| Topic | Decision | Impact |
|-------|----------|--------|
| **Drizzle Relations** | Use `relations()` API | Schema updates required |
| **Error Handling** | Global middleware with consistent format | New middleware file |
| **Logging** | Structured JSON logging with levels | New middleware file |
| **Date Handling** | Date objects, Drizzle helpers | Fix existing bugs |
| **Error Boundaries** | Next.js error.tsx + fetch error handling | Frontend updates |

---

## Next Steps

1. ✅ Research complete - all technical unknowns resolved
2. ⏳ Proceed to Phase 1: Design & Contracts
   - Update `data-model.md` with relations
   - Export OpenAPI contracts
   - Write `quickstart.md`
3. ⏳ Update agent context with technologies
4. ⏳ Generate tasks with `/speckit.tasks`

---

**Research Status**: ✅ Complete
**All NEEDS CLARIFICATION Resolved**: Yes
**Ready for Phase 1**: Yes
