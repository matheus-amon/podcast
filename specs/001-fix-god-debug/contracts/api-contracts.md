# API Contracts: Podcast SaaS POC

**Version**: 1.0.0
**Date**: 2026-02-18
**Source**: Generated from ElysiaJS routes with OpenAPI plugin

---

## Overview

Base URL: `http://localhost:3001/api`

All endpoints follow REST conventions:
- **Resource-based URLs**: `/leads`, `/agenda/events`, `/budget`
- **HTTP Verbs**: GET (read), POST (create), PUT/PATCH (update), DELETE (remove)
- **Status Codes**: 200 (success), 201 (created), 400 (bad request), 404 (not found), 500 (server error)
- **Error Format**:
  ```json
  {
    "error": {
      "code": "ERROR_CODE",
      "message": "Human-readable message",
      "details": {}
    }
  }
  ```

---

## Authentication

**Current Status**: Not implemented (POC phase)

**Future Implementation**: JWT-based authentication with refresh token rotation per Constitution.

---

## Endpoints

### Leads Module

Base: `/api/leads`

#### GET /leads
List all leads ordered by creation date (descending).

**Response**: `200 OK`
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "GUEST",
    "status": "PROSPECT",
    "company": "Acme Inc",
    "position": "CEO",
    "avatarUrl": "https://...",
    "bio": "Sample bio",
    "linkedinUrl": "https://linkedin.com/in/johndoe",
    "tags": ["podcast", "tech"],
    "notes": "Important contact",
    "lastContact": "2026-02-18T10:00:00Z",
    "createdAt": "2026-02-18T10:00:00Z"
  }
]
```

---

#### GET /leads/:id
Get a specific lead by ID.

**Parameters**:
- `id` (path, integer): Lead ID

**Response**: `200 OK`
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "GUEST",
  "status": "PROSPECT"
}
```

**Errors**:
- `404 Not Found` - Lead not found

---

#### POST /leads
Create a new lead.

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "role": "GUEST",
  "status": "PROSPECT",
  "company": "Acme Inc",
  "position": "CEO",
  "bio": "Sample bio",
  "linkedinUrl": "https://linkedin.com/in/johndoe",
  "avatarUrl": "https://...",
  "tags": ["podcast", "tech"],
  "notes": "Important contact"
}
```

**Required Fields**: `name`, `email`

**Response**: `201 Created`
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "GUEST",
  "status": "PROSPECT",
  "createdAt": "2026-02-18T10:00:00Z"
}
```

**Errors**:
- `400 Bad Request` - Invalid email format or missing required fields

---

#### PUT /leads/:id
Update an existing lead.

**Parameters**:
- `id` (path, integer): Lead ID

**Request Body** (all fields optional):
```json
{
  "name": "John Updated",
  "status": "CONTACTED",
  "company": "New Company"
}
```

**Response**: `200 OK`
```json
{
  "id": 1,
  "name": "John Updated",
  "email": "john@example.com",
  "status": "CONTACTED",
  "updatedAt": "2026-02-18T11:00:00Z"
}
```

**Errors**:
- `404 Not Found` - Lead not found

---

#### DELETE /leads/:id
Delete a lead.

**Parameters**:
- `id` (path, integer): Lead ID

**Response**: `200 OK`
```json
{
  "success": true
}
```

**Errors**:
- `404 Not Found` - Lead not found

---

#### GET /leads/:id/interactions
Get all interactions for a lead.

**Parameters**:
- `id` (path, integer): Lead ID

**Response**: `200 OK`
```json
[
  {
    "id": 1,
    "leadId": 1,
    "type": "EMAIL",
    "content": "Initial outreach email sent",
    "date": "2026-02-18T10:00:00Z",
    "createdAt": "2026-02-18T10:00:00Z"
  }
]
```

---

#### POST /leads/:id/interactions
Add an interaction to a lead.

**Parameters**:
- `id` (path, integer): Lead ID

**Request Body**:
```json
{
  "content": "Had a great call discussing the podcast episode",
  "type": "CALL"
}
```

**Required Fields**: `content`

**Response**: `201 Created`
```json
{
  "id": 1,
  "leadId": 1,
  "type": "CALL",
  "content": "Had a great call discussing the podcast episode",
  "date": "2026-02-18T10:00:00Z",
  "createdAt": "2026-02-18T10:00:00Z"
}
```

**Side Effect**: Updates `lastContact` on lead record.

---

### Agenda Module

Base: `/api/agenda`

#### GET /agenda/events
Get calendar events with optional date filtering.

**Query Parameters**:
- `start` (optional, ISO date): Filter events starting after this date
- `end` (optional, ISO date): Filter events ending before this date

**Response**: `200 OK`
```json
[
  {
    "id": 1,
    "title": "Episode Recording: John Doe",
    "description": "Recording session for Episode 1",
    "startDate": "2026-02-20T14:00:00Z",
    "endDate": "2026-02-20T16:00:00Z",
    "type": "RECORDING",
    "leadId": 1,
    "episodeId": 1,
    "participants": ["john@example.com", "host@example.com"],
    "color": "#3B82F6",
    "createdAt": "2026-02-18T10:00:00Z"
  }
]
```

---

#### POST /agenda/events
Create a new calendar event.

**Request Body**:
```json
{
  "title": "Episode Recording",
  "description": "Recording session",
  "startDate": "2026-02-20T14:00:00Z",
  "endDate": "2026-02-20T16:00:00Z",
  "type": "RECORDING",
  "leadId": 1,
  "episodeId": 1,
  "participants": ["john@example.com"],
  "color": "#3B82F6"
}
```

**Required Fields**: `title`, `startDate`, `endDate`

**Response**: `201 Created`
```json
{
  "id": 1,
  "title": "Episode Recording",
  "startDate": "2026-02-20T14:00:00Z",
  "endDate": "2026-02-20T16:00:00Z",
  "type": "RECORDING"
}
```

**Errors**:
- `400 Bad Request` - end_date before start_date

---

#### GET /agenda/episodes
List all episodes.

**Response**: `200 OK`
```json
[
  {
    "id": 1,
    "title": "Episode 1: Introduction",
    "description": "First episode",
    "season": 1,
    "number": 1,
    "status": "PLANNED",
    "publishDate": "2026-03-01T00:00:00Z",
    "createdAt": "2026-02-18T10:00:00Z"
  }
]
```

---

#### POST /agenda/episodes
Create a new episode.

**Request Body**:
```json
{
  "title": "Episode 1: Introduction",
  "description": "First episode",
  "season": 1,
  "number": 1,
  "status": "PLANNED",
  "publishDate": "2026-03-01T00:00:00Z"
}
```

**Required Fields**: `title`

**Response**: `201 Created`

---

#### GET /agenda/episodes/:id
Get a specific episode.

**Response**: `200 OK`

**Errors**:
- `404 Not Found` - Episode not found

---

#### PUT /agenda/episodes/:id
Update an episode.

**Request Body** (all fields optional):
```json
{
  "status": "RECORDED",
  "publishDate": "2026-03-15T00:00:00Z"
}
```

**Response**: `200 OK`

---

#### GET /agenda/episodes/:id/script
Get script for an episode.

**Response**: `200 OK`
```json
{
  "id": 1,
  "episodeId": 1,
  "content": "# Episode Script\n\n## Introduction\n...",
  "version": 1,
  "lastEditedBy": "host@example.com",
  "updatedAt": "2026-02-18T10:00:00Z",
  "createdAt": "2026-02-18T10:00:00Z"
}
```

---

#### POST /agenda/episodes/:id/script
Create or update script for an episode.

**Request Body**:
```json
{
  "content": "# Episode Script\n\n## Introduction\nWelcome to the show..."
}
```

**Required Fields**: `content`

**Response**: `200 OK` or `201 Created`

---

#### GET /agenda/episodes/:id/tasks
List production tasks for an episode.

**Response**: `200 OK`
```json
[
  {
    "id": 1,
    "episodeId": 1,
    "title": "Book editing",
    "status": "TODO",
    "assignee": "editor@example.com",
    "dueDate": "2026-02-25T00:00:00Z",
    "createdAt": "2026-02-18T10:00:00Z"
  }
]
```

---

#### POST /agenda/episodes/:id/tasks
Create a production task.

**Request Body**:
```json
{
  "title": "Book editing",
  "assignee": "editor@example.com",
  "dueDate": "2026-02-25T00:00:00Z"
}
```

**Required Fields**: `title`

**Response**: `201 Created`

---

#### PUT /agenda/tasks/:id
Update a task status.

**Request Body**:
```json
{
  "status": "IN_PROGRESS"
}
```

**Required Fields**: `status` (TODO, IN_PROGRESS, DONE)

**Response**: `200 OK`

---

### Budget Module

Base: `/api/budget`

#### GET /budget
List all budget entries.

**Response**: `200 OK`
```json
[
  {
    "id": 1,
    "concept": "Equipment Purchase",
    "amount": 1500.00,
    "type": "EXPENSE",
    "category": "Equipment",
    "date": "2026-02-18",
    "responsible": "Producer",
    "status": "APPROVED",
    "connectedEpisodeId": 1,
    "createdAt": "2026-02-18T10:00:00Z"
  }
]
```

---

#### GET /budget/summary
Get budget summary with totals.

**Response**: `200 OK`
```json
{
  "totalIncome": 5000.00,
  "totalExpense": 1500.00,
  "balance": 3500.00
}
```

---

#### POST /budget
Create a budget entry.

**Request Body**:
```json
{
  "concept": "Equipment Purchase",
  "amount": 1500.00,
  "type": "EXPENSE",
  "category": "Equipment",
  "date": "2026-02-18",
  "responsible": "Producer",
  "status": "PENDING",
  "connectedEpisodeId": 1
}
```

**Required Fields**: `concept`, `amount`, `type`, `category`

**Response**: `201 Created`

---

#### PUT /budget/:id
Update a budget entry.

**Request Body** (all fields optional):
```json
{
  "status": "PAID",
  "amount": 1400.00
}
```

**Response**: `200 OK`

---

#### DELETE /budget/:id
Delete a budget entry.

**Response**: `200 OK`

---

#### GET /budget/templates
List budget templates.

**Response**: `200 OK`
```json
[
  {
    "id": 1,
    "name": "Standard Episode Costs",
    "items": [
      {
        "concept": "Editor Payment",
        "amount": 300.00,
        "type": "EXPENSE",
        "category": "Production"
      }
    ],
    "createdAt": "2026-02-18T10:00:00Z"
  }
]
```

---

#### POST /budget/templates
Create a budget template.

**Request Body**:
```json
{
  "name": "Standard Episode Costs",
  "items": [
    {
      "concept": "Editor Payment",
      "amount": 300.00,
      "type": "EXPENSE",
      "category": "Production"
    }
  ]
}
```

**Required Fields**: `name`, `items`

**Response**: `201 Created`

---

#### POST /budget/templates/:id/apply
Apply a template (creates budget entries from template items).

**Response**: `201 Created`
```json
[
  {
    "id": 2,
    "concept": "Editor Payment",
    "amount": 300.00,
    "type": "EXPENSE",
    "category": "Production",
    "status": "PLANNED",
    "date": "2026-02-18"
  }
]
```

---

### Billing Module

Base: `/api/billing`

#### GET /billing
List all invoices.

**Response**: `200 OK`
```json
[
  {
    "id": 1,
    "clientName": "Acme Inc",
    "amount": 1000.00,
    "dueDate": "2026-03-01",
    "status": "PENDING",
    "invoiceNumber": "INV-2026-001",
    "subscriptionPlan": "PRO",
    "createdAt": "2026-02-18T10:00:00Z"
  }
]
```

---

#### GET /billing/summary
Get billing summary.

**Response**: `200 OK`
```json
{
  "totalBilled": 5000.00,
  "totalPaid": 2000.00,
  "totalPending": 2500.00,
  "totalOverdue": 500.00
}
```

---

#### POST /billing
Create an invoice.

**Request Body**:
```json
{
  "clientName": "Acme Inc",
  "amount": 1000.00,
  "dueDate": "2026-03-01",
  "invoiceNumber": "INV-2026-001",
  "subscriptionPlan": "PRO"
}
```

**Required Fields**: `clientName`, `amount`, `dueDate`

**Response**: `201 Created`

---

#### PUT /billing/:id
Update an invoice.

**Request Body** (all fields optional):
```json
{
  "status": "PAID",
  "amount": 900.00
}
```

**Response**: `200 OK`

---

#### DELETE /billing/:id
Delete an invoice.

**Response**: `200 OK`

---

### Dashboard Module

Base: `/api/dashboard`

#### GET /dashboard/metrics
Get dashboard KPI metrics.

**Response**: `200 OK`
```json
{
  "totalLeads": 15,
  "activeEpisodes": 3,
  "monthlyRevenue": 4500.00,
  "upcomingEvents": 5
}
```

---

#### GET /dashboard/charts/revenue
Get revenue chart data.

**Response**: `200 OK`
```json
[
  { "name": "Jan", "revenue": 4000, "expenses": 2400 },
  { "name": "Feb", "revenue": 3000, "expenses": 1398 },
  { "name": "Current", "revenue": 4500, "expenses": 1500 }
]
```

---

#### GET /dashboard/recent-activity
Get recent activity (leads and episodes).

**Response**: `200 OK`
```json
{
  "recentLeads": [
    {
      "id": 5,
      "name": "Jane Smith",
      "company": "Tech Corp",
      "avatarUrl": "https://...",
      "createdAt": "2026-02-17T10:00:00Z"
    }
  ],
  "recentEpisodes": [
    {
      "id": 3,
      "title": "Episode 3: Advanced Topics",
      "season": 1,
      "status": "SCRIPTING",
      "createdAt": "2026-02-16T10:00:00Z"
    }
  ]
}
```

---

### Whitelabel Module

Base: `/api/whitelabel`

#### GET /whitelabel/config
Get whitelabel configuration.

**Response**: `200 OK`
```json
{
  "id": 1,
  "logoUrl": "https://example.com/logo.png",
  "primaryColor": "#3B82F6",
  "secondaryColor": "#1E40AF",
  "companyName": "Podcast SaaS",
  "subdomain": "mypodcast",
  "updatedAt": "2026-02-18T10:00:00Z"
}
```

---

#### POST /whitelabel/config
Update whitelabel configuration.

**Request Body** (all fields optional):
```json
{
  "logoUrl": "https://example.com/new-logo.png",
  "primaryColor": "#FF5733",
  "companyName": "My Podcast Platform"
}
```

**Response**: `200 OK`

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request body or parameters |
| `NOT_FOUND` | 404 | Resource not found |
| `INTERNAL_ERROR` | 500 | Unexpected server error |
| `UNKNOWN_ERROR` | 500 | Unspecified error |

---

## Rate Limiting

**Current Status**: Not implemented (POC phase)

**Future Implementation**: Rate limiting per Constitution Security requirements.

Suggested limits:
- 100 requests/minute for authenticated users
- 20 requests/minute for unauthenticated endpoints

---

## Versioning

**Current Version**: v1 (implicit, no prefix)

**Future Versions**: Use `/v1/` prefix for breaking changes:
```
GET /v1/api/leads
```

---

**API Contracts Status**: ✅ Documented
**OpenAPI Spec**: Available at `/swagger` when backend is running
**Constitution Compliance**: REST conventions followed
