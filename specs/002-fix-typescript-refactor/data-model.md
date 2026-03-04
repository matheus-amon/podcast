# Data Model & Domain Entities: Módulos Refatorados

**Feature**: 002-fix-typescript-refactor  
**Created**: 2026-02-28  
**Status**: Complete

## Visão Geral

Este documento define as entities, value objects, ports e relações de dados para cada módulo a ser refatorado com TDD.

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
  type: EventType;         // Enum: RECORDING, RELEASE, MEETING, OTHER
  status: EventStatus;     // Enum: SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
  attendees: string[];     // UUIDs dos participantes
  relatedTo?: {
    type: 'lead' | 'episode';
    id: string;
  };
  color?: string;          // Cor para UI (hex)
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;        // Soft delete
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

#### EventType
```typescript
enum EventType {
  RECORDING = 'RECORDING',
  RELEASE = 'RELEASE',
  MEETING = 'MEETING',
  OTHER = 'OTHER',
}
```

#### EventStatus
```typescript
enum EventStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}
```

### Ports

#### AgendaRepositoryPort
```typescript
interface AgendaRepositoryPort {
  findById(id: string): Promise<AgendaEvent | null>;
  findByDateRange(range: DateRange): Promise<AgendaEvent[]>;
  findByAttendee(userId: string, range?: DateRange): Promise<AgendaEvent[]>;
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
  status: BudgetStatus;    // Enum: PLANNED, APPROVED, PAID, PENDING
  validUntil: Date;        // Validade da proposta
  totalAmount: Money;      // Valor total
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
```

#### BudgetItem
```typescript
interface BudgetItem {
  id: string;              // UUID
  description: string;     // Descrição do item
  quantity: number;        // Quantidade
  unitPrice: Money;        // Preço unitário
  totalPrice: Money;       // Preço total
}
```

### Value Objects

#### Money
```typescript
interface Money {
  amount: number;          // Valor em centavos
  currency: string;        // ISO 4217: BRL, USD
  add(other: Money): Money;
  multiply(factor: number): Money;
  toString(): string;      // Formato: "R$ 1.000,00"
}
```

#### BudgetStatus
```typescript
enum BudgetStatus {
  PLANNED = 'PLANNED',
  APPROVED = 'APPROVED',
  PAID = 'PAID',
  PENDING = 'PENDING',
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
  approve(budgetId: string): Promise<void>;
  reject(budgetId: string, reason: string): Promise<void>;
}
```

### Validation Rules
- Items não podem ter quantidade ou preço negativo
- Total deve ser calculado automaticamente
- validUntil deve ser maior que data atual

---

## Módulo: Billing

### Entities

#### Invoice
```typescript
interface Invoice {
  id: string;              // UUID
  budgetId: string;        // Referência ao orçamento
  number: string;          // Número sequencial
  status: InvoiceStatus;   // Enum: PAID, PENDING, OVERDUE
  dueDate: Date;           // Data de vencimento
  paidAt?: Date;           // Data de pagamento
  amount: Money;           // Valor total
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
```

#### Payment
```typescript
interface Payment {
  id: string;              // UUID
  invoiceId: string;       // Referência à invoice
  amount: Money;           // Valor pago
  paidAt: Date;            // Data do pagamento
  method: string;          // Método: pix, credit_card, boleto
  transactionId?: string;  // ID da transação
  status: PaymentStatus;   // Enum: COMPLETED, PENDING, FAILED, REFUNDED
  createdAt: Date;
}
```

### Value Objects

#### InvoiceStatus
```typescript
enum InvoiceStatus {
  PAID = 'PAID',
  PENDING = 'PENDING',
  OVERDUE = 'OVERDUE',
}
```

#### PaymentStatus
```typescript
enum PaymentStatus {
  COMPLETED = 'COMPLETED',
  PENDING = 'PENDING',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}
```

### Ports

#### InvoiceRepositoryPort
```typescript
interface InvoiceRepositoryPort {
  findById(id: string): Promise<Invoice | null>;
  findByNumber(number: string): Promise<Invoice | null>;
  findByStatus(status: InvoiceStatus): Promise<Invoice[]>;
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
}
```

### Validation Rules
- Número da invoice deve ser único e sequencial
- Valor da invoice deve bater com orçamento aprovado
- Pagamento não pode exceder valor da invoice

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
- Métricas devem ser calculadas em tempo real

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
budget ↛ agenda (independentes)
```

---

## TDD Test Structure

### Para Cada Entity

```typescript
describe('AgendaEvent', () => {
  describe('create', () => {
    it('should create valid event', () => {
      // Test
    });

    it('should throw error when end is before start', () => {
      // Test
    });
  });

  describe('cancel', () => {
    it('should change status to cancelled', () => {
      // Test
    });
  });
});
```

### Para Cada Use Case

```typescript
describe('CreateEventUseCase', () => {
  it('should create event when data is valid', async () => {
    // Test
  });

  it('should throw error when attendee is not available', async () => {
    // Test
  });
});
```

### Para Cada Repository

```typescript
describe('PostgresAgendaRepository', () => {
  describe('findById', () => {
    it('should return event when exists', async () => {
      // Integration test
    });

    it('should return null when not found', async () => {
      // Integration test
    });
  });
});
```

---

**Referências**:
- Feature Spec: [spec.md](./spec.md)
- Research: [research.md](./research.md)
- Plan: [plan.md](./plan.md)
