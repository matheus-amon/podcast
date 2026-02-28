# Quickstart: Desenvolvimento com Arquitetura Hexagonal

**Feature**: 001-hexagonal-backend-refactor  
**Created**: 2026-02-28  
**Status**: Complete

## Visão Geral

Guia rápido para configurar ambiente de desenvolvimento e entender a nova arquitetura hexagonal do backend.

---

## Pré-requisitos

- **Bun**: 1.3.6+
- **Docker**: 20.x+ (para PostgreSQL)
- **Git**: 2.x+
- **Node.js**: 20.x+ (opcional, para ferramentas)

---

## Setup Inicial (5-10 minutos)

### 1. Clonar e Instalar

```bash
# Navegar até o projeto
cd /home/amon/workspace/person/podcast-saas

# Instalar dependências do backend
cd apps/api
bun install
```

### 2. Configurar Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar .env com suas credenciais
# DATABASE_URL=postgresql://user:password@localhost:5432/podcast_saas
```

### 3. Subir Banco de Dados

```bash
# Voltar para raiz
cd ../..

# Subir PostgreSQL via Docker
docker-compose up -d

# Verificar se está rodando
docker-compose ps
```

### 4. Rodar Migrations

```bash
# Aplicar schema ao banco
cd apps/api
bun x drizzle-kit push

# Verificar tabelas
bun x drizzle-kit studio
```

### 5. Iniciar Servidor de Desenvolvimento

```bash
# Iniciar backend com hot-reload
bun run --watch src/index.ts

# Ou usar bun figo para auto-restart
bun --watch src/index.ts
```

**Servidor rodará em**: `http://localhost:3000`

---

## Verificação

### Testar Health Check

```bash
curl http://localhost:3000/health
```

**Resposta esperada**:
```json
{
  "status": "ok",
  "timestamp": "2026-02-28T12:00:00.000Z",
  "version": "1.0.0",
  "database": "connected"
}
```

### Testar Swagger UI

Acessar: `http://localhost:3000/swagger`

**Deve mostrar**: Documentação interativa de todos os endpoints

### Testar Endpoints

```bash
# Listar leads
curl http://localhost:3000/leads

# Listar agenda
curl http://localhost:3000/agenda

# Listar dashboard
curl http://localhost:3000/dashboard
```

---

## Estrutura de Diretórios (Nova Arquitetura)

```
apps/api/src/
├── domain/              # Regras de negócio (empresariais)
│   ├── leads/           # Entities, value objects, ports
│   ├── agenda/
│   └── ...
│
├── application/         # Casos de uso
│   ├── leads/           # Use cases (CreateLead, etc.)
│   ├── agenda/
│   └── ...
│
├── infrastructure/      # Implementações externas
│   ├── http/            # Controllers Elysia
│   ├── database/        # Repositórios Drizzle
│   └── ...
│
├── modules/             # Legado (será refatorado)
│   ├── leads/           # Controllers atuais
│   └── ...
│
├── middleware/          # Middleware global
│   ├── error.middleware.ts
│   └── logger.middleware.ts
│
├── db/                  # Database
│   ├── schema.ts        # Schema Drizzle (inalterado)
│   └── index.ts
│
└── index.ts             # Entry point (composition root)
```

---

## Regras de Dependência (DAG)

### Hierarquia de Camadas

```
┌─────────────────┐
│    Domain       │  ← Nível 0 (sem dependências)
├─────────────────┤
│  Application    │  ← Nível 1 (depende apenas de Domain)
├─────────────────┤
│ Infrastructure  │  ← Nível 2 (depende de Domain + Application)
└─────────────────┘
```

### O Que Pode Importar

```typescript
// ✅ PERMITIDO
// application/leads/use-cases/create-lead.ts
import { LeadRepositoryPort } from '../../domain/leads/ports/lead-repository.port';
import { Lead } from '../../domain/leads/entities/lead';

// ✅ PERMITIDO
// infrastructure/http/leads.controller.ts
import { CreateLeadUseCase } from '../../application/leads/use-cases/create-lead';

// ❌ PROIBIDO
// domain/leads/entities/lead.ts
import { LeadRepositoryPort } from '../../infrastructure/database/lead-repository'; 
// ERRO: Domain não pode depender de Infrastructure!

// ❌ PROIBIDO
// application/leads/use-case.ts
import { PostgresLeadRepository } from '../../infrastructure/database/lead-repository';
// ERRO: Application não pode depender de implementação concreta!
```

---

## Fluxo de Desenvolvimento

### Criar Nova Feature (Exemplo: Enviar Email ao Criar Lead)

#### 1. Definir Port (Domain)

```typescript
// domain/leads/ports/email-service.port.ts
export interface EmailServicePort {
  sendWelcomeEmail(lead: Lead): Promise<void>;
}
```

#### 2. Criar Use Case (Application)

```typescript
// application/leads/use-cases/create-lead.ts
export class CreateLeadUseCase {
  constructor(
    private leadRepository: LeadRepositoryPort,
    private emailService: EmailServicePort // Injeção de dependência
  ) {}

  async execute(data: CreateLeadDTO): Promise<Lead> {
    const lead = Lead.create(data);
    await this.leadRepository.create(lead);
    await this.emailService.sendWelcomeEmail(lead);
    return lead;
  }
}
```

#### 3. Implementar Adapter (Infrastructure)

```typescript
// infrastructure/external/adapters/sendgrid-email.adapter.ts
export class SendGridEmailAdapter implements EmailServicePort {
  async sendWelcomeEmail(lead: Lead): Promise<void> {
    // Implementação com SendGrid API
  }
}
```

#### 4. Registrar no Entry Point

```typescript
// index.ts (composition root)
const emailService = new SendGridEmailAdapter(apiKey);
const leadRepository = new PostgresLeadRepository(db);
const createLeadUseCase = new CreateLeadUseCase(leadRepository, emailService);
const leadController = new LeadController(createLeadUseCase);

app.use(leadController.routes());
```

---

## Comandos Úteis

### Desenvolvimento

```bash
# Iniciar com watch (hot-reload)
bun --watch src/index.ts

# Iniciar servidor
bun run src/index.ts

# Type check
bun x tsc --noEmit
```

### Database

```bash
# Push schema (desenvolvimento)
bun x drizzle-kit push

# Gerar migration
bun x drizzle-kit generate

# Aplicar migrations
bun x drizzle-kit migrate

# Studio (GUI)
bun x drizzle-kit studio
```

### Testes

```bash
# Rodar todos os testes
bun test

# Rodar com watch
bun test --watch

# Rodar testes específicos
bun test leads.test.ts

# Coverage
bun test --coverage
```

### Build

```bash
# Build de produção
bun build src/index.ts --outdir dist --target bun

# Verificar tamanho do bundle
du -sh dist/
```

---

## Debugging

### Logs Estruturados

O sistema usa logging estruturado JSON:

```typescript
// Logger middleware registra todas as requisições
{
  "level": "info",
  "timestamp": "2026-02-28T12:00:00.000Z",
  "method": "POST",
  "path": "/leads",
  "status": 201,
  "duration": 45
}
```

### Error Handling

Erros são capturados pelo middleware global:

```typescript
// Controllers devem lançar erros de domínio
throw new DomainError('LEAD_NOT_FOUND', { id: leadId });

// Middleware formata resposta
{
  "error": {
    "code": "LEAD_NOT_FOUND",
    "message": "Lead não encontrado",
    "details": { "id": "123" }
  }
}
```

---

## Arquitetura Hexagonal: Resumo

### Ports (Interfaces)

Definem **O QUE** o sistema faz:

```typescript
// Exemplo: LeadRepositoryPort
interface LeadRepositoryPort {
  findById(id: string): Promise<Lead | null>;
  create(lead: Lead): Promise<void>;
  update(lead: Lead): Promise<void>;
}
```

### Adapters (Implementações)

Definem **COMO** o sistema faz:

```typescript
// Exemplo: PostgresLeadRepository
class PostgresLeadRepository implements LeadRepositoryPort {
  async findById(id: string): Promise<Lead | null> {
    // Implementação com Drizzle + PostgreSQL
  }
}
```

### Use Cases (Orquestração)

Orquestram fluxo de negócio:

```typescript
// Exemplo: CreateLeadUseCase
class CreateLeadUseCase {
  async execute(data: CreateLeadDTO): Promise<Lead> {
    // 1. Validar dados
    // 2. Criar entity
    // 3. Persistir via repository port
    // 4. Disparar eventos (email, notifications, etc.)
  }
}
```

---

## Troubleshooting

### Problema: Banco de dados não conecta

**Solução**:
```bash
# Verificar se Docker está rodando
docker-compose ps

# Verificar logs do PostgreSQL
docker-compose logs postgres

# Reiniciar container
docker-compose restart postgres
```

### Problema: Erro de migração

**Solução**:
```bash
# Resetar banco (desenvolvimento apenas!)
docker-compose down -v
docker-compose up -d
bun x drizzle-kit push
```

### Problema: Import circular detected

**Solução**:
- Verificar se domain está importando de infrastructure
- Refatorar para usar ports em vez de implementações concretas
- Usar o comando `bun x madge --circular src/` para identificar

### Problema: Endpoints não respondem

**Solução**:
```bash
# Verificar se servidor está rodando
curl http://localhost:3000/health

# Verificar logs do servidor
# Observar erros de inicialização

# Verificar se middleware de rotas está registrado
# Checar index.ts
```

---

## Próximos Passos

1. **Ler spec.md**: Entender requisitos da feature
2. **Ler data-model.md**: Conhecer entities e ports
3. **Ler api-contracts.md**: Revisar contratos de API
4. **Iniciar refatoração**: Seguir tasks.md

---

## Referências

- **Feature Spec**: [spec.md](./spec.md)
- **Research**: [research.md](./research.md)
- **Data Model**: [data-model.md](./data-model.md)
- **API Contracts**: [contracts/api-contracts.md](./contracts/api-contracts.md)
- **Plan**: [plan.md](./plan.md)

---

**Dica**: Manter este arquivo aberto durante o desenvolvimento para consulta rápida!
