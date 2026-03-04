# API Contracts: Podcast SaaS Backend

**Feature**: 001-hexagonal-backend-refactor  
**Created**: 2026-02-28  
**Status**: Complete

## Visão Geral

Estes contratos de API são preservados da implementação atual. A refatoração para arquitetura hexagonal **NÃO ALTERA** os contratos de API.

## Base URL

```
Development: http://localhost:3000
Production:  ${API_BASE_URL}
Version:     /v1 (quando necessário breaking changes)
```

## Autenticação

```typescript
Headers:
  Authorization: Bearer <JWT_TOKEN>
```

---

## Módulo: Leads

### GET /leads
**Descrição**: Listar todos os leads (com paginação e filtros)

**Request**:
```typescript
Query Parameters:
  - page?: number (default: 1)
  - limit?: number (default: 20)
  - status?: LeadStatus
  - assignedTo?: string
```

**Response** (200 OK):
```typescript
{
  data: {
    id: string;
    name: string;
    email: string;
    phone: string;
    status: LeadStatus;
    source: string;
    assignedTo: string;
    createdAt: string;
    updatedAt: string;
  }[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### GET /leads/:id
**Descrição**: Obter detalhes de um lead específico

**Response** (200 OK):
```typescript
{
  id: string;
  name: string;
  email: string;
  phone: string;
  status: LeadStatus;
  source: string;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
}
```

### POST /leads
**Descrição**: Criar novo lead

**Request Body**:
```typescript
{
  name: string;
  email: string;
  phone?: string;
  source?: string;
  assignedTo?: string;
}
```

**Response** (201 Created):
```typescript
{
  id: string;
  name: string;
  email: string;
  status: LeadStatus; // NEW
  createdAt: string;
}
```

### PUT /leads/:id
**Descrição**: Atualizar lead existente

**Request Body**:
```typescript
{
  name?: string;
  email?: string;
  phone?: string;
  status?: LeadStatus;
  assignedTo?: string;
}
```

**Response** (200 OK):
```typescript
{
  id: string;
  name: string;
  email: string;
  phone: string;
  status: LeadStatus;
  assignedTo: string;
  updatedAt: string;
}
```

### DELETE /leads/:id
**Descrição**: Remover lead (soft delete)

**Response** (204 No Content)

---

## Módulo: Agenda

### GET /agenda
**Descrição**: Listar eventos da agenda

**Request**:
```typescript
Query Parameters:
  - start?: string (ISO date)
  - end?: string (ISO date)
  - type?: EventType
  - status?: EventStatus
```

**Response** (200 OK):
```typescript
{
  id: string;
  title: string;
  description?: string;
  startAt: string;
  endAt: string;
  type: EventType;
  status: EventStatus;
  attendees: string[];
  relatedTo?: {
    type: 'lead' | 'budget' | 'billing';
    id: string;
  };
}[]
```

### POST /agenda
**Descrição**: Criar novo evento

**Request Body**:
```typescript
{
  title: string;
  description?: string;
  startAt: string;
  endAt: string;
  type: EventType;
  attendees?: string[];
  relatedTo?: {
    type: 'lead' | 'budget' | 'billing';
    id: string;
  };
}
```

**Response** (201 Created):
```typescript
{
  id: string;
  title: string;
  startAt: string;
  endAt: string;
  type: EventType;
  status: EventStatus; // SCHEDULED
}
```

### PUT /agenda/:id
**Descrição**: Atualizar evento

**Request Body**:
```typescript
{
  title?: string;
  description?: string;
  startAt?: string;
  endAt?: string;
  type?: EventType;
  status?: EventStatus;
  attendees?: string[];
}
```

**Response** (200 OK):
```typescript
{
  id: string;
  title: string;
  startAt: string;
  endAt: string;
  status: EventStatus;
  updatedAt: string;
}
```

### DELETE /agenda/:id
**Descrição**: Remover evento (soft delete)

**Response** (204 No Content)

---

## Módulo: Budget

### GET /budget
**Descrição**: Listar orçamentos

**Request**:
```typescript
Query Parameters:
  - status?: BudgetStatus
  - validUntil?: string (ISO date)
```

**Response** (200 OK):
```typescript
{
  id: string;
  title: string;
  status: BudgetStatus;
  totalAmount: number;
  validUntil: string;
  createdAt: string;
  updatedAt: string;
}[]
```

### GET /budget/:id
**Descrição**: Obter orçamento com itens

**Response** (200 OK):
```typescript
{
  id: string;
  title: string;
  description?: string;
  items: {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  totalAmount: number;
  status: BudgetStatus;
  validUntil: string;
}
```

### POST /budget
**Descrição**: Criar orçamento

**Request Body**:
```typescript
{
  title: string;
  description?: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
  }[];
  validUntil: string;
}
```

**Response** (201 Created):
```typescript
{
  id: string;
  title: string;
  totalAmount: number;
  status: BudgetStatus; // DRAFT
}
```

### PUT /budget/:id
**Descrição**: Atualizar orçamento

**Request Body**:
```typescript
{
  title?: string;
  description?: string;
  items?: {
    id?: string;
    description: string;
    quantity: number;
    unitPrice: number;
  }[];
  status?: BudgetStatus;
  validUntil?: string;
}
```

**Response** (200 OK):
```typescript
{
  id: string;
  title: string;
  totalAmount: number;
  status: BudgetStatus;
  updatedAt: string;
}
```

### DELETE /budget/:id
**Descrição**: Remover orçamento

**Response** (204 No Content)

---

## Módulo: Billing

### GET /billing/invoices
**Descrição**: Listar notas fiscais

**Request**:
```typescript
Query Parameters:
  - status?: InvoiceStatus
  - dueDate?: string (ISO date)
```

**Response** (200 OK):
```typescript
{
  id: string;
  number: string;
  budgetId: string;
  status: InvoiceStatus;
  dueDate: string;
  amount: number;
  paidAt?: string;
}[]
```

### POST /billing/invoices
**Descrição**: Gerar nota fiscal

**Request Body**:
```typescript
{
  budgetId: string;
  dueDate: string;
}
```

**Response** (201 Created):
```typescript
{
  id: string;
  number: string;
  status: InvoiceStatus; // PENDING
  dueDate: string;
  amount: number;
}
```

### POST /billing/invoices/:id/payments
**Descrição**: Registrar pagamento

**Request Body**:
```typescript
{
  amount: number;
  method: string;
  transactionId?: string;
}
```

**Response** (201 Created):
```typescript
{
  id: string;
  amount: number;
  method: string;
  paidAt: string;
  status: PaymentStatus; // COMPLETED
}
```

---

## Módulo: Dashboard

### GET /dashboard
**Descrição**: Obter métricas do dashboard

**Request**:
```typescript
Query Parameters:
  - period?: string (default: '30d')
  - category?: 'leads' | 'finance' | 'agenda' | 'all'
```

**Response** (200 OK):
```typescript
{
  leads: {
    total: number;
    new: number;
    converted: number;
    conversionRate: number;
  };
  finance: {
    revenue: number;
    pending: number;
    overdue: number;
  };
  agenda: {
    totalEvents: number;
    upcomingEvents: number;
    completedEvents: number;
  };
  period: {
    start: string;
    end: string;
  };
}
```

---

## Módulo: Whitelabel

### GET /whitelabel
**Descrição**: Obter configuração de whitelabel

**Response** (200 OK):
```typescript
{
  id: string;
  tenantId: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  companyName: string;
  contactEmail?: string;
  contactPhone?: string;
}
```

### PUT /whitelabel
**Descrição**: Atualizar configuração

**Request Body**:
```typescript
{
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  companyName?: string;
  contactEmail?: string;
  contactPhone?: string;
}
```

**Response** (200 OK):
```typescript
{
  id: string;
  tenantId: string;
  logoUrl?: string;
  primaryColor?: string;
  updatedAt: string;
}
```

---

## Formato de Erro

Todos os erros seguem este formato:

```typescript
{
  error: {
    code: string;        // Código de erro máquina (ex: LEAD_NOT_FOUND)
    message: string;     // Mensagem legível
    details?: any;       // Detalhes adicionais (validações, etc.)
  };
}
```

### Códigos de Erro Comuns

| Código | HTTP Status | Descrição |
|--------|-------------|-----------|
| VALIDATION_ERROR | 400 | Erro de validação |
| UNAUTHORIZED | 401 | Não autenticado |
| FORBIDDEN | 403 | Sem permissão |
| NOT_FOUND | 404 | Recurso não encontrado |
| CONFLICT | 409 | Conflito (ex: email duplicado) |
| INTERNAL_ERROR | 500 | Erro interno do servidor |

---

## Health Check

### GET /health
**Descrição**: Verificar saúde da API

**Response** (200 OK):
```typescript
{
  status: 'ok';
  timestamp: string;
  version: string;
  database: 'connected' | 'disconnected';
}
```

### GET /swagger
**Descrição**: Swagger UI para documentação interativa

**Response**: HTML page

---

## Notas de Implementação

1. **Todos os endpoints devem ser documentados** via Elysia OpenAPI plugin
2. **Validação de input** deve ocorrer na boundary (controller)
3. **Respostas devem seguir formato consistente** (data envelope para collections)
4. **Paginação** usa padrão offset-limit com metadata
5. **Datas** sempre em formato ISO 8601 (UTC)

---

**Referências**:
- Feature Spec: [spec.md](./spec.md)
- Data Model: [data-model.md](./data-model.md)
- Research: [research.md](./research.md)
