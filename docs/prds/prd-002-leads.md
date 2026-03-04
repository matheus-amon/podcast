# PRD-002: Leads + Kanban

**Data**: 2026-03-03  
**Prioridade**: 🔴 Critical  
**Status**: ⏳ Próximo

---

## 📋 Visão Geral

Sistema de Kanban para gerenciar leads (guests) do podcast com drag-and-drop.

## 🎯 Objetivos

- Visualizar leads em formato Kanban
- Mover leads entre status com drag-and-drop
- CRUD completo de leads
- Filters e search

## 👤 User Stories

### US-001: Ver Leads em Kanban
**Como** usuário  
**Quero** ver leads em colunas por status  
**Para** gerenciar pipeline visualmente

**Aceite**:
- 4 colunas: PROSPECT, CONTACTED, CONFIRMED, RECORDED
- Cards com avatar, nome, empresa, cargo
- Drag-and-drop entre colunas
- Contador de leads por coluna

### US-002: Criar Lead
**Como** usuário  
**Quero** criar novo lead  
**Para** adicionar ao pipeline

**Aceite**:
- Dialog com formulário
- Campos: name, email, company, position, role, status
- Validação com Zod
- Redireciona para coluna correta

### US-003: Mover Lead
**Como** usuário  
**Quero** mover lead entre colunas  
**Para** atualizar status

**Aceite**:
- Drag-and-drop intuitivo
- Atualiza status automaticamente
- Feedback visual durante drag
- Otimista update

## 🎨 Design

### Layout Kanban
```
┌─────────────────────────────────────────────────────────┐
│  Leads Pipeline              [Search] [Filters] [+Add] │
├─────────────────────────────────────────────────────────┤
│  [PROSPECT] [CONTACTED] [CONFIRMED] [RECORDED]        │
│  [5 cards]  [3 cards]   [2 cards]   [1 card]          │
│                                                         │
│  Cards arrastáveis entre colunas                       │
└─────────────────────────────────────────────────────────┘
```

### Card Content
- Avatar + Nome
- Empresa + Cargo
- Email + Phone (ícones)
- Última interação (relative time)
- Tags (opcional)

## 🔌 API

```typescript
GET /api/leads
POST /api/leads
GET /api/leads/:id
PUT /api/leads/:id
DELETE /api/leads/:id
```

## ✅ Critérios de Aceite

- [ ] Kanban funcionando
- [ ] Drag-and-drop fluido
- [ ] CRUD completo
- [ ] Filters aplicando
- [ ] Search funcionando
- [ ] Responsivo
- [ ] Performance OK

---

**Próximo**: Implementar no Loop 3
