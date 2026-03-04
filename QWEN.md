## Qwen Added Memories
- Todas as interações e spec inclusive do specify tem que ser estritamente em pt-BR, você irá receber vários prompts em inglês mas o output sempre será em pt-BR.
- Frontend Stack: Next.js 16 + React 19, Shadcn/UI + TailwindCSS 4, Zustand (state), TanStack Query (data), React Hook Form + Zod (forms), TanStack Table (tables), React Big Calendar (Google Calendar-like), SPA tradicional, Inter font, Cinza+Azul cores, apenas light mode, bordas rounded-md, sombras subtle, density confortável
- Componentes customizados necessários: Kanban Board (Leads, drag-and-drop, colunas: PROSPECT→CONTACTED→CONFIRMED→RECORDED), Calendar (Google Calendar style, views: month/week/day/agenda, drag-and-drop, resize), Dashboard KPI Cards, Lead Card, Episode Card, Budget Card, Invoice Card
- Design System: Cores Slate+Azul (#3B82F6 primary), Tipografia Inter, Espaçamento confortável (p-8 pages, py-6 px-6 cards), Bordas rounded-md (~6px), Sombras subtle, Breakpoints: sm(640), md(768), lg(1024), xl(1280), 2xl(1536)
- Módulos frontend em ordem: 1.Dashboard, 2.Leads+Kanban, 3.Agenda+Calendar, 4.Episodes, 5.Budget, 6.Billing, 7.Settings - Usar método Ralph Loop (criar spec → implementar → validar → próximo)
- Documentação do frontend criada em: /docs/design-system/design-system.md (completo), /docs/architecture/ (ADRs 001-005), /docs/prds/ (PRDs por módulo), /docs/implementation-plan.md (Ralph Loop). PRDs detalhados: Dashboard, Leads, Agenda, Episodes, Budget, Billing, Settings

## Active Technologies
- TypeScript 5.x, Bun 1.3.6 + ElysiaJS 1.4, Drizzle ORM 0.45, Next.js 16, React 19 (001-fix-god-debug)
- PostgreSQL 15 (via docker-compose) (001-fix-god-debug)
- TypeScript 5.x + Bun 1.3.6, ElysiaJS 1.4, Drizzle ORM 0.45 (001-hexagonal-backend-refactor)

## Recent Changes
- 001-fix-god-debug: Added TypeScript 5.x, Bun 1.3.6 + ElysiaJS 1.4, Drizzle ORM 0.45, Next.js 16, React 19
