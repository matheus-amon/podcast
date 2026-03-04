# Feature Specification: Refatoração do Módulo Agenda para Arquitetura Hexagonal

**Feature Branch**: `004-refactor-agenda`
**Created**: 2026-03-01
**Status**: Draft
**Input**: Refatorar módulo Agenda para arquitetura hexagonal com TDD, seguindo padrão do módulo Leads

## Resumo Executivo

Refatorar o módulo Agenda da estrutura legada (controller monolítico em `modules/agenda/`) para arquitetura hexagonal completa (domain/application/infrastructure), aplicando TDD com mínimo de 95% de cobertura de testes e princípios SOLID.

## User Scenarios & Testing

### User Story 1 - Desenvolvedor consegue gerenciar eventos de agenda via API (Priority: P1) 🎯 MVP

**Descrição**: Como usuário do sistema, quero criar, listar, atualizar e cancelar eventos de agenda através de endpoints RESTful para gerenciar minha agenda de forma eficiente.

**Por que esta prioridade**: Agenda é um módulo core do sistema, essencial para gestão de atividades.

**Teste Independente**: Endpoints GET, POST, PUT, DELETE em /api/agenda funcionando com respostas HTTP apropriadas.

**Cenários de Aceitação**:

1. **Dado** que não há eventos, **Quando** GET /api/agenda é chamado, **Então** retorna lista vazia com status 200.

2. **Dado** um evento válido, **Quando** POST /api/agenda/events é chamado, **Então** evento é criado com status 201.

3. **Dado** um evento existente, **Quando** PUT /api/agenda/events/:id é chamado, **Então** evento é atualizado com status 200.

4. **Dado** um evento existente, **Quando** DELETE /api/agenda/events/:id é chamado, **Então** evento é removido com status 204.

---

### User Story 2 - Sistema valida sobreposição de eventos (Priority: P2)

**Descrição**: Como usuário, quero que o sistema valide se não há sobreposição de horários ao criar ou reagenda eventos para evitar conflitos de agenda.

**Por que esta prioridade**: Previne double-booking e conflitos de horários.

**Teste Independente**: Tentativa de criar evento com horário sobreposto retorna erro 409 (Conflict).

**Cenários de Aceitação**:

1. **Dado** um evento existente das 10:00 às 11:00, **Quando** tento criar evento das 10:30 às 11:30, **Então** sistema retorna erro 409 Conflict.

2. **Dado** um evento existente das 10:00 às 11:00, **Quando** tento criar evento das 11:00 às 12:00, **Então** evento é criado (sem sobreposição).

---

### User Story 3 - Sistema gerencia participantes de eventos (Priority: P3)

**Descrição**: Como usuário, quero adicionar e remover participantes de eventos para gerenciar quem deve participar de cada atividade.

**Por que esta prioridade**: Funcionalidade importante para colaboração e gestão de equipe.

**Teste Independente**: Endpoints de adicionar/remover participantes funcionam corretamente.

**Cenários de Aceitação**:

1. **Dado** um evento sem participantes, **Quando** adiciono participante, **Então** participante é listado no evento.

2. **Dado** um evento com participante, **Quando** removo participante, **Então** participante não está mais listado.

---

## Requisitos Funcionais

### Functional Requirements

- **FR-001**: Sistema DEVE permitir criar eventos com título, descrição, startAt, endAt, type e status

- **FR-002**: Sistema DEVE validar que endAt é maior que startAt

- **FR-003**: Sistema DEVE validar que não há sobreposição de eventos para mesmos participantes

- **FR-004**: Sistema DEVE permitir listar eventos com filtros por data (start, end)

- **FR-005**: Sistema DEVE permitir atualizar eventos existentes

- **FR-006**: Sistema DEVE permitir cancelar eventos (mudar status para CANCELLED)

- **FR-007**: Sistema DEVE permitir marcar eventos como completados (status COMPLETED)

- **FR-008**: Sistema DEVE permitir adicionar participantes a eventos

- **FR-009**: Sistema DEVE permitir remover participantes de eventos

- **FR-010**: Sistema DEVE retornar erro 409 Conflict ao tentar criar evento sobreposto

- **FR-011**: Sistema DEVE seguir arquitetura hexagonal (domain/application/infrastructure)

- **FR-012**: Sistema DEVE ter testes unitários com 95%+ de cobertura

### Key Entities

- **AgendaEvent**: Entity principal representando um evento de agenda
  - Atributos: id, title, description, startAt, endAt, type, status, attendees, color, createdAt, updatedAt, deletedAt

- **EventType**: Enum com tipos de evento (RECORDING, RELEASE, MEETING, OTHER)

- **EventStatus**: Enum com status de evento (SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED)

- **DateRange**: Value object para validação de sobreposição

## Success Criteria

### Measurable Outcomes

- **SC-001**: 100% dos endpoints de agenda funcionais (GET, POST, PUT, DELETE)

- **SC-002**: 95%+ de cobertura de testes unitários no módulo Agenda

- **SC-003**: Zero erros TypeScript no módulo Agenda

- **SC-004**: Validação de sobreposição implementada e testada

- **SC-005**: Todos os testes de integração passando

- **SC-006**: Código segue princípios SOLID (validado via code review)

### Assumptions

- Estrutura de diretórios domain/, application/, infrastructure/ já existe (criada na feature 002)

- Entity AgendaEvent já foi criada parcialmente na feature 002

- Banco de dados tem tabela `agenda` com schema compatível

### Dependencies

- **D-001**: Módulo Leads já refatorado serve como referência

- **D-002**: Infraestrutura de testes já configurada (bunfig.toml, setup.ts)

- **D-003**: Types compartilhados já existem (BaseEntity, Money, etc.)

### Constraints

- **C-001**: Manter compatibilidade com schema existente do banco

- **C-002**: Não quebrar endpoints existentes durante refatoração

- **C-003**: Manter 95%+ coverage em todo o módulo

---

## Notas de Contexto Técnico

**Estado Atual**:
- Entity AgendaEvent já criada em `src/domain/agenda/entities/`
- 23 testes unitários passando para AgendaEvent
- 92.93% coverage na entity
- Controller legado em `src/modules/agenda/agenda.controller.ts`
- Rotas retornando 404 (não implementadas)

**O Que Falta**:
- Use cases: CreateEvent, UpdateEvent, CancelEvent, ListEvents, etc.
- Repository adapter: PostgresAgendaRepository
- Controller HTTP: AgendaController (hexagonal)
- Testes de integração e E2E
- Validação de sobreposição

**Schema do Banco**:
```sql
agenda (
  id, title, description, start_date, end_date,
  type, lead_id, episode_id, participants, color,
  created_at
)
```
