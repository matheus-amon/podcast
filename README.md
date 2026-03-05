# Podcast SaaS POC

Este projeto contém a POC (Prova de Conceito) para o SaaS de Gestão de Podcasts, focando nas funcionalidades de Agenda, Leads, Budget e Billing.

## Estrutura

- `apps/api`: Backend Bun + ElysiaJS + Drizzle.
- `apps/web`: Frontend Next.js + Shadcn/UI.

## Como Rodar

### 1. Backend

```bash
cd apps/api
bun install
bun run src/index.ts
```

O servidor estará rodando em `http://localhost:3001`.
Acesse o Swagger em `http://localhost:3001/swagger`.

**Nota:** Certifique-se de ter um banco de dados PostgreSQL rodando. Configure a URL em `apps/api/.env`.
Para aplicar as migrações (criar tabelas):

```bash
cd apps/api
bun x drizzle-kit push
```

### 2. Frontend

```bash
cd apps/web
bun install
bun run dev
```

Acesse a aplicação em `http://localhost:3000`.

## Funcionalidades

- **Agenda:** `apps/web/app/agenda`
- **Leads:** `apps/web/app/leads`
- **Finance:** `apps/web/app/finance` (Budget & Billing)
- **Settings:** `apps/web/app/settings` (Whitelabel)
