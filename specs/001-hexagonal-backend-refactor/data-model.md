# Data Model & Domain Entities: Arquitetura Hexagonal

**Feature**: 001-hexagonal-backend-refactor  
**Created**: 2026-02-28  
**Status**: Complete

## Visão Geral

Este documento define as entities, value objects, ports e relações de dados para cada módulo de negócio na arquitetura hexagonal.

---

## Módulo: Leads

### Entities

#### Lead
```typescript
interface Lead {
  id: string;              // UUID
  name: string;            // Nome completo
  email: Email;            // Value object
  phone: string;           // Telefone formatado
  status: LeadStatus;      // Enum: NEW, CONTACTED, QUALIFIED, CONVERTED, LOST
  source: string;          // Origem: website, referral, ads, etc.
  assignedTo: string;      // UUID do usuário responsável
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;        // Soft delete
}
```

### Value Objects

#### Email
```typescript
interface Email {
  value: string;           // Email validado
  isValid(): boolean;
}
```

### Ports

#### LeadRepositoryPort
```typescript
interface LeadRepositoryPort {
  findById(id: string): Promise<Lead | null>;
  findByEmail(email: Email): Promise<Lead | null>;
  findByStatus(status: LeadStatus): Promise<Lead[]>;
  findAll(filters?: LeadFilters): Promise<Lead[]>;
  create(lead: Lead): Promise<void>;
  update(lead: Lead): Promise<void>;
  softDelete(id: string): Promise<void>;
}
```

#### LeadServicePort
```typescript
interface LeadServicePort {
  assignToUser(leadId: string, userId: string): Promise<void>;
  changeStatus(leadId: string, status: LeadStatus): Promise<void>;
  qualifyLead(leadId: string, criteria: QualificationCriteria): Promise<void>;
}
```

### Validation Rules
- Email deve ser válido (RFC 5322)
- Phone deve seguir formato E.164 ou formato nacional
- Status não pode ser alterado diretamente (apenas via service)
- Nome é obrigatório (3-200 caracteres)

---

## Módulo: Agenda

### Entities

#### AgendaEvent
```typescript
interface AgendaEvent {
  id: string;              // UUID
  title: string;           // Título do evento
  description?: string;    // Descrição detalhada
  startAt: Date;           // Data/hora de início
  endAt: Date;             // Data/hora de término
  type: EventType;         // Enum: MEETING, CALL, TASK, DEADLINE, OTHER
  status: EventStatus;     // Enum: SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
  attendees: string[];     // UUIDs dos participantes
  relatedTo?: {
    type: 'lead' | 'budget' | 'billing';
    id: string;
  };
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
```

### Value Objects

#### DateRange
```typescript
interface DateRange {
  start: Date;
  end: Date;
  overlaps(other: DateRange): boolean;
  duration(): number;      // Em minutos
}
```

### Ports

#### AgendaRepositoryPort
```typescript
interface AgendaRepositoryPort {
  findById(id: string): Promise<AgendaEvent | null>;
  findByDateRange(range: DateRange): Promise<AgendaEvent[]>;
  findByAttendee(userId: string, range?: DateRange): Promise<AgendaEvent[]>;
  findByRelatedTo(type: string, id: string): Promise<AgendaEvent[]>;
  findAll(filters?: AgendaFilters): Promise<AgendaEvent[]>;
  create(event: AgendaEvent): Promise<void>;
  update(event: AgendaEvent): Promise<void>;
  softDelete(id: string): Promise<void>;
}
```

#### AgendaServicePort
```typescript
interface AgendaServicePort {
  checkAvailability(range: DateRange, attendees: string[]): Promise<boolean>;
  scheduleEvent(eventData: CreateEventDTO): Promise<AgendaEvent>;
  rescheduleEvent(eventId: string, newRange: DateRange): Promise<void>;
  cancelEvent(eventId: string, reason: string): Promise<void>;
  markAsCompleted(eventId: string): Promise<void>;
}
```

### Validation Rules
- endAt deve ser maior que startAt
- Não permitir eventos sobrepostos para mesmo participante
- Attendees devem existir no sistema
- Tipo e status são obrigatórios

---

## Módulo: Budget

### Entities

#### Budget
```typescript
interface Budget {
  id: string;              // UUID
  title: string;           // Título do orçamento
  description?: string;    // Descrição
  items: BudgetItem[];     // Lista de itens
  status: BudgetStatus;    // Enum: DRAFT, SENT, APPROVED, REJECTED, EXPIRED
  validUntil: Date;        // Validade da proposta
  totalAmount: Money;      // Value object
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
```

#### BudgetItem
```typescript
interface BudgetItem {
  id: string;              // UUID (dentro do Budget)
  description: string;     // Descrição do item
  quantity: number;        // Quantidade
  unitPrice: Money;        // Preço unitário
  totalPrice: Money;       // Preço total (quantity * unitPrice)
}
```

### Value Objects

#### Money
```typescript
interface Money {
  amount: number;          // Valor em centavos (evitar float)
  currency: string;        // ISO 4217: BRL, USD, etc.
  add(other: Money): Money;
  multiply(factor: number): Money;
  toString(): string;      // Formato: "R$ 1.000,00"
}
```

### Ports

#### BudgetRepositoryPort
```typescript
interface BudgetRepositoryPort {
  findById(id: string): Promise<Budget | null>;
  findByStatus(status: BudgetStatus): Promise<Budget[]>;
  findAll(filters?: BudgetFilters): Promise<Budget[]>;
  create(budget: Budget): Promise<void>;
  update(budget: Budget): Promise<void>;
  softDelete(id: string): Promise<void>;
}
```

#### BudgetServicePort
```typescript
interface BudgetServicePort {
  calculateTotal(items: BudgetItem[]): Money;
  addItem(budgetId: string, item: BudgetItem): Promise<void>;
  removeItem(budgetId: string, itemId: string): Promise<void>;
  updateItem(budgetId: string, item: BudgetItem): Promise<void>;
  sendToClient(budgetId: string): Promise<void>;
  approve(budgetId: string): Promise<void>;
  reject(budgetId: string, reason: string): Promise<void>;
  expire(budgetId: string): Promise<void>;
}
```

### Validation Rules
- Items não podem ter quantidade ou preço negativo
- Total deve ser calculado automaticamente
- validUntil deve ser maior que data atual
- Status não pode ser alterado diretamente (apenas via service)

---

## Módulo: Billing

### Entities

#### Invoice
```typescript
interface Invoice {
  id: string;              // UUID
  budgetId: string;        // Referência ao orçamento aprovado
  number: string;          // Número da nota (sequencial)
  status: InvoiceStatus;   // Enum: PENDING, PAID, OVERDUE, CANCELLED
  dueDate: Date;           // Data de vencimento
  paidAt?: Date;           // Data de pagamento
  amount: Money;           // Valor total
  paymentMethod?: string;  // Método de pagamento
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
```

#### Payment
```typescript
interface Payment {
  id: string;              // UUID
  invoiceId: string;       // Referência à nota fiscal
  amount: Money;           // Valor pago
  paidAt: Date;            // Data do pagamento
  method: string;          // Método: credit_card, boleto, pix, etc.
  transactionId?: string;  // ID da transação no gateway
  status: PaymentStatus;   // Enum: PENDING, COMPLETED, FAILED, REFUNDED
  createdAt: Date;
}
```

### Ports

#### InvoiceRepositoryPort
```typescript
interface InvoiceRepositoryPort {
  findById(id: string): Promise<Invoice | null>;
  findByNumber(number: string): Promise<Invoice | null>;
  findByStatus(status: InvoiceStatus): Promise<Invoice[]>;
  findByBudgetId(budgetId: string): Promise<Invoice | null>;
  findAll(filters?: InvoiceFilters): Promise<Invoice[]>;
  create(invoice: Invoice): Promise<void>;
  update(invoice: Invoice): Promise<void>;
  softDelete(id: string): Promise<void>;
}
```

#### PaymentRepositoryPort
```typescript
interface PaymentRepositoryPort {
  findById(id: string): Promise<Payment | null>;
  findByInvoiceId(invoiceId: string): Promise<Payment[]>;
  create(payment: Payment): Promise<void>;
  update(payment: Payment): Promise<void>;
}
```

#### BillingServicePort
```typescript
interface BillingServicePort {
  generateInvoice(budgetId: string, dueDate: Date): Promise<Invoice>;
  markAsPaid(invoiceId: string, payment: CreatePaymentDTO): Promise<void>;
  markAsOverdue(invoiceId: string): Promise<void>;
  cancelInvoice(invoiceId: string, reason: string): Promise<void>;
  processPayment(invoiceId: string, paymentData: PaymentData): Promise<Payment>;
  refundPayment(paymentId: string, reason: string): Promise<void>;
}
```

### Validation Rules
- Número da nota deve ser único e sequencial
- Valor da invoice deve bater com orçamento aprovado
- Pagamento não pode exceder valor da invoice
- dueDate deve ser maior que data de criação

---

## Módulo: Dashboard

### Entities

#### DashboardMetric
```typescript
interface DashboardMetric {
  name: string;            // Identificador único
  label: string;           // Label para exibição
  value: number;           // Valor atual
  change: number;          // Variação (percentual)
  period: DateRange;       // Período de referência
  category: string;        // Categoria: leads, finance, agenda
}
```

### Ports

#### DashboardRepositoryPort
```typescript
interface DashboardRepositoryPort {
  getLeadMetrics(period: DateRange): Promise<LeadMetrics>;
  getFinancialMetrics(period: DateRange): Promise<FinancialMetrics>;
  getAgendaMetrics(period: DateRange): Promise<AgendaMetrics>;
  getConversionFunnel(period: DateRange): Promise<ConversionFunnel>;
}
```

#### DashboardServicePort
```typescript
interface DashboardServicePort {
  calculateMetrics(period: DateRange): Promise<DashboardMetric[]>;
  getSummary(filters?: DashboardFilters): Promise<DashboardSummary>;
  getTrend(metricName: string, period: DateRange): Promise<MetricTrend>;
  comparePeriods(current: DateRange, previous: DateRange): Promise<Comparison>;
}
```

### Validation Rules
- Período deve ser válido (start < end)
- Métricas devem ser calculadas em tempo real (não cacheadas por padrão)
- Dados devem respeitar soft deletes dos módulos origem

---

## Módulo: Whitelabel

### Entities

#### WhitelabelConfig
```typescript
interface WhitelabelConfig {
  id: string;              // UUID
  tenantId: string;        // Identificador do tenant
  logoUrl?: string;        // URL do logo
  primaryColor?: string;   // Cor primária (hex)
  secondaryColor?: string; // Cor secundária (hex)
  companyName: string;     // Razão social
  documentNumber?: string; // CNPJ/CPF
  address?: Address;       // Endereço completo
  contactEmail?: string;   // Email de contato
  contactPhone?: string;   // Telefone de contato
  createdAt: Date;
  updatedAt: Date;
}
```

### Value Objects

#### Address
```typescript
interface Address {
  street: string;
  number: string;
  complement?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}
```

### Ports

#### WhitelabelRepositoryPort
```typescript
interface WhitelabelRepositoryPort {
  findById(id: string): Promise<WhitelabelConfig | null>;
  findByTenantId(tenantId: string): Promise<WhitelabelConfig | null>;
  create(config: WhitelabelConfig): Promise<void>;
  update(config: WhitelabelConfig): Promise<void>;
}
```

#### WhitelabelServicePort
```typescript
interface WhitelabelServicePort {
  getConfig(tenantId: string): Promise<WhitelabelConfig>;
  updateConfig(tenantId: string, config: Partial<WhitelabelConfig>): Promise<void>;
  uploadLogo(tenantId: string, file: FileData): Promise<string>;
  validateConfig(config: WhitelabelConfig): Promise<ValidationResult>;
}
```

### Validation Rules
- tenantId deve ser único
- Email e telefone devem ser válidos
- Cores devem ser hex válido (#RRGGBB)
- companyName é obrigatório

---

## Relações entre Módulos (DAG)

```
┌─────────────────────────────────────────────────────────────┐
│                    DOMAIN LAYER (Nível 0)                    │
│  Sem dependências entre módulos. Cada módulo é independente. │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                 APPLICATION LAYER (Nível 1)                  │
│         Use cases dependem apenas de domain ports            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│               INFRASTRUCTURE LAYER (Nível 2)                 │
│  Adapters implementam ports e conectam com mundo externo     │
└─────────────────────────────────────────────────────────────┘
```

### Dependências Permitidas

```
dashboard → leads (leitura para métricas)
dashboard → budget (leitura para métricas)
dashboard → billing (leitura para métricas)
billing → budget (referência ao orçamento)

leads ↛ agenda (independentes)
leads ↛ budget (independentes)
budget ↛ agenda (independentes)
```

### Comunicação entre Módulos

Para casos onde um módulo precisa de dados de outro:
- **Leitura**: Usar ports do módulo origem (via DI)
- **Escrita**: Usar Domain Events (futuro, se necessário)

---

## Schema do Banco de Dados (Referência)

O schema atual do Drizzle permanece **inalterado**. Esta refatoração não modifica o banco de dados.

```typescript
// apps/api/src/db/schema.ts
// Tabelas existentes:
// - leads
// - agenda_events
// - budgets
// - budget_items
// - invoices
// - payments
// - dashboard_metrics (se existir)
// - whitelabel_configs
// - users
// - audit_logs
// - sessions
```

---

## Próximos Passos

1. **Contracts**: Gerar OpenAPI specs baseados nestes ports
2. **Quickstart**: Documentar como configurar ambiente de desenvolvimento
3. **Tasks**: Quebrar implementação em tarefas executáveis

---

**Referências**:
- Feature Spec: [spec.md](./spec.md)
- Research: [research.md](./research.md)
- Plan: [plan.md](./plan.md)
