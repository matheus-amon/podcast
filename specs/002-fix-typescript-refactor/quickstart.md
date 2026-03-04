# Quickstart: Desenvolvimento com TDD

**Feature**: 002-fix-typescript-refactor  
**Created**: 2026-02-28  
**Status**: Complete

## Visão Geral

Guia rápido para desenvolver com TDD (Test-Driven Development), garantindo 95%+ de cobertura de testes e aplicando princípios SOLID.

---

## Pré-requisitos

- **Bun**: 1.3.6+
- **Docker**: 20.x+ (para PostgreSQL)
- **Git**: 2.x+

---

## Setup Inicial (5 minutos)

### 1. Instalar Dependências

```bash
cd apps/api
bun install
```

### 2. Configurar Ambiente

```bash
cp .env.example .env
# Editar .env com suas credenciais
```

### 3. Subir Banco de Dados

```bash
cd ../..
docker compose up -d
```

### 4. Configurar Testes

```bash
# Verificar se bunfig.toml existe com coverage threshold
cat apps/api/bunfig.toml
```

---

## Comandos de Teste

### Rodar Todos os Testes

```bash
cd apps/api
bun test
```

### Rodar com Coverage

```bash
bun test --coverage
```

### Rodar Testes Específicos

```bash
# Por arquivo
bun test agenda.test.ts

# Por pattern
bun test --test-name-pattern "should create"
```

### Rodar em Watch Mode

```bash
bun test --watch
```

---

## Ciclo TDD (Red-Green-Refactor)

### Passo 1: RED - Escrever Teste (Falha)

```typescript
// tests/unit/domain/agenda/agenda-event.test.ts
import { describe, it, expect } from 'bun:test';
import { AgendaEvent } from '@/domain/agenda/entities/agenda-event';

describe('AgendaEvent', () => {
  describe('create', () => {
    it('should create valid event when data is valid', () => {
      const event = AgendaEvent.create({
        title: 'Recording Session',
        startAt: new Date('2026-03-01T10:00:00Z'),
        endAt: new Date('2026-03-01T11:00:00Z'),
        type: 'RECORDING',
      });

      expect(event).toBeDefined();
      expect(event.title).toBe('Recording Session');
      expect(event.status).toBe('SCHEDULED');
    });

    it('should throw error when end is before start', () => {
      expect(() => {
        AgendaEvent.create({
          title: 'Invalid Event',
          startAt: new Date('2026-03-01T11:00:00Z'),
          endAt: new Date('2026-03-01T10:00:00Z'), // Antes do start
          type: 'RECORDING',
        });
      }).toThrow('End date must be after start date');
    });
  });
});
```

**Resultado esperado**: ❌ Teste falha (entity ainda não existe)

### Passo 2: GREEN - Implementar (Passa)

```typescript
// src/domain/agenda/entities/agenda-event.ts
import { EventType, EventStatus } from '../value-objects/event-status.enum';

export interface CreateAgendaEventDTO {
  title: string;
  description?: string;
  startAt: Date;
  endAt: Date;
  type: EventType;
}

export class AgendaEvent {
  public readonly id: string;
  public title: string;
  public description?: string;
  public startAt: Date;
  public endAt: Date;
  public type: EventType;
  public status: EventStatus;
  public attendees: string[];
  public createdAt: Date;
  public updatedAt: Date;

  private constructor(props: CreateAgendaEventDTO) {
    // Validação: end deve ser depois de start
    if (props.endAt <= props.startAt) {
      throw new Error('End date must be after start date');
    }

    this.id = crypto.randomUUID();
    this.title = props.title;
    this.description = props.description;
    this.startAt = props.startAt;
    this.endAt = props.endAt;
    this.type = props.type;
    this.status = EventStatus.SCHEDULED;
    this.attendees = [];
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  static create(props: CreateAgendaEventDTO): AgendaEvent {
    return new AgendaEvent(props);
  }
}
```

**Resultado esperado**: ✅ Teste passa

### Passo 3: REFACTOR - Melhorar Código

```typescript
// Refatorar para extrair value objects
// Adicionar mais validações
// Melhorar nomes
// Manter testes verdes!
```

---

## Estrutura de Testes

```
apps/api/tests/
├── unit/
│   ├── domain/
│   │   ├── agenda/
│   │   │   └── agenda-event.test.ts
│   │   ├── budget/
│   │   └── billing/
│   ├── application/
│   │   ├── agenda/
│   │   │   └── create-event.use-case.test.ts
│   │   └── budget/
│   └── infrastructure/
│       └── database/
│           └── agenda-repository.adapter.test.ts
├── integration/
│   ├── api/
│   │   ├── agenda.test.ts
│   │   └── budget.test.ts
│   └── repository/
│       └── agenda-repository.integration.test.ts
└── e2e/
    └── flows/
        └── agenda-management.e2e.test.ts
```

---

## Configuração bunfig.toml

```toml
[test]
# Coverage threshold (95% mínimo)
coverage = true
coverageThreshold = { lines = 95, functions = 95, branches = 95 }

# Timeout para testes
testTimeout = 5000

# Setup file
preload = ["./tests/setup.ts"]
```

---

## Padrões de Teste

### Unit Test (Entity)

```typescript
describe('Budget', () => {
  describe('addItem', () => {
    it('should add item and recalculate total', () => {
      const budget = Budget.create({ title: 'Test Budget' });
      const item = { description: 'Item 1', quantity: 2, unitPrice: Money.fromReais(100) };

      budget.addItem(item);

      expect(budget.items).toHaveLength(1);
      expect(budget.totalAmount.cents).toBe(20000); // R$ 200,00
    });
  });
});
```

### Integration Test (Repository)

```typescript
describe('PostgresAgendaRepository', () => {
  let repository: AgendaRepositoryPort;
  let db: ParsedNeon;

  beforeAll(async () => {
    db = await setupTestDatabase();
    repository = new PostgresAgendaRepository(db);
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  it('should find event by id', async () => {
    const event = await repository.create(testEvent);
    const found = await repository.findById(event.id);

    expect(found).toBeDefined();
    expect(found?.id).toBe(event.id);
  });
});
```

### E2E Test (API Flow)

```typescript
describe('Agenda Management E2E', () => {
  it('should complete full agenda flow', async () => {
    // 1. Create event via API
    const createResponse = await fetch('/api/agenda', {
      method: 'POST',
      body: JSON.stringify({ title: 'Test', startAt, endAt, type: 'MEETING' }),
    });

    expect(createResponse.status).toBe(201);
    const event = await createResponse.json();

    // 2. Get event via API
    const getResponse = await fetch(`/api/agenda/${event.id}`);
    expect(getResponse.status).toBe(200);

    // 3. Update event via API
    const updateResponse = await fetch(`/api/agenda/${event.id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'COMPLETED' }),
    });

    expect(updateResponse.status).toBe(200);

    // 4. Delete event via API
    const deleteResponse = await fetch(`/api/agenda/${event.id}`, {
      method: 'DELETE',
    });

    expect(deleteResponse.status).toBe(204);
  });
});
```

---

## Validação de Coverage

### Rodar Coverage Report

```bash
bun test --coverage
```

### Verificar Threshold

```bash
# Deve mostrar:
# Coverage:
#   Lines: 95.2%
#   Functions: 96.1%
#   Branches: 95.0%
# ✅ All thresholds met!
```

### Se Coverage < 95%

```bash
# Identificar arquivos com baixa cobertura
bun test --coverage --reporter=verbose

# Adicionar testes para código faltante
# Refatorar se necessário
```

---

## Troubleshooting

### Problema: Testes falham sem motivo claro

**Solução**:
```bash
# Limpar banco de teste
bun run db:test:clean

# Rodar testes isoladamente
bun test agenda.test.ts --bail
```

### Problema: Coverage abaixo de 95%

**Solução**:
```bash
# Verificar quais arquivos estão abaixo
bun test --coverage --reporter=verbose | grep -A 5 "Coverage"

# Focar em lógica de negócio (não getters/setters)
# Mockar dependências externas
```

### Problema: Testes lentos

**Solução**:
```bash
# Identificar testes lentos
bun test --reporter=verbose --test-timeout=10000

# Usar mocks para testes unitários
# Manter integration tests rápidos (setup/teardown eficientes)
```

---

## Checklist TDD

Antes de commitar:

- [ ] Testes escritos antes da implementação
- [ ] Todos testes passam (verde)
- [ ] Coverage >= 95%
- [ ] Código refatorado (manter testes verdes)
- [ ] Zero erros TypeScript
- [ ] Commits seguem padrão (gitmoji)

---

## Próximos Passos

1. **Ler spec.md**: Entender requisitos da feature
2. **Ler data-model.md**: Conhecer entities e ports
3. **Seguir tasks.md**: Executar tarefas em ordem
4. **Aplicar TDD**: Teste → Implementação → Refatoração
5. **Validar**: Coverage >= 95%, zero erros TypeScript

---

**Referências**:
- **Feature Spec**: [spec.md](./spec.md)
- **Research**: [research.md](./research.md)
- **Data Model**: [data-model.md](./data-model.md)
- **Plan**: [plan.md](./plan.md)
- **Tasks**: [tasks.md](./tasks.md) (gerado por /speckit.tasks)

---

**Dica**: Manter este arquivo aberto durante desenvolvimento TDD!
