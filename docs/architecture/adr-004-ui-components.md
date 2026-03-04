# ADR-004: Componentes UI - Shadcn/UI + Componentes Customizados

**Data**: 2026-03-03  
**Status**: ✅ Aprovado  
**Projeto**: Podcast SaaS Frontend

---

## Contexto

Precisamos definir a estratégia de componentes UI para garantir consistência e velocidade de desenvolvimento.

## Decisão

Utilizar **Shadcn/UI** como base + **Componentes Customizados** para necessidades específicas.

### Shadcn/UI (Base)

**O que é**: Coleção de componentes reutilizáveis construídos com Radix UI + TailwindCSS.

**Por que Shadcn**:
1. **Copy & Paste** - Código é seu, sem dependência runtime
2. **Customizável** - Total controle do estilo
3. **Acessível** - WCAG compliant via Radix
4. **TypeScript** - Types inclusos
5. **Manutenível** - Você mantém o código

**Componentes que vamos usar**:
- Button, Input, Label, Textarea
- Card, Dialog, Select, Popover
- Table, Badge, Avatar
- Calendar, Tabs, Separator
- Toast, Tooltip, Skeleton
- Sidebar (novo)

### Componentes Customizados

**O que vamos criar**:
1. **KanbanBoard** - Leads pipeline
2. **Calendar** - Google Calendar style (wrapper de react-big-calendar)
3. **KPICard** - Dashboard metrics
4. **LeadCard** - Kanban card
5. **EpisodeCard** - Episode preview
6. **BudgetCard** - Budget summary
7. **InvoiceCard** - Invoice details
8. **EmptyState** - Empty states padronizados
9. **ErrorState** - Error states padronizados
10. **DataTable** - TanStack Table wrapper

## Estrutura de Diretórios

```
components/
├── ui/                    # Shadcn components
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── table.tsx
│   ├── badge.tsx
│   ├── avatar.tsx
│   ├── select.tsx
│   ├── popover.tsx
│   ├── tooltip.tsx
│   ├── toast.tsx
│   ├── toaster.tsx
│   ├── skeleton.tsx
│   ├── separator.tsx
│   ├── tabs.tsx
│   ├── calendar.tsx       # Shadcn calendar (date picker)
│   └── sidebar.tsx        # Shadcn sidebar
├── custom/                # Custom components
│   ├── kanban/
│   │   ├── kanban-board.tsx
│   │   ├── kanban-column.tsx
│   │   └── kanban-card.tsx
│   ├── calendar/
│   │   ├── event-calendar.tsx
│   │   ├── event-dialog.tsx
│   │   └── quick-add.tsx
│   ├── dashboard/
│   │   ├── kpi-card.tsx
│   │   ├── revenue-chart.tsx
│   │   └── activity-feed.tsx
│   ├── leads/
│   │   ├── lead-card.tsx
│   │   ├── lead-dialog.tsx
│   │   └── lead-filters.tsx
│   ├── episodes/
│   │   ├── episode-card.tsx
│   │   ├── episode-dialog.tsx
│   │   └── episode-table.tsx
│   ├── budget/
│   │   ├── budget-card.tsx
│   │   ├── budget-dialog.tsx
│   │   └── budget-chart.tsx
│   ├── billing/
│   │   ├── invoice-card.tsx
│   │   ├── invoice-dialog.tsx
│   │   └── payment-dialog.tsx
│   └── common/
│       ├── empty-state.tsx
│       ├── error-state.tsx
│       ├── data-table.tsx
│       └── page-header.tsx
└── layout/
    ├── app-sidebar.tsx
    ├── top-bar.tsx
    └── nav-link.tsx
```

## Kanban Board Spec

```typescript
// components/custom/kanban/kanban-board.tsx
import { DndContext, DragEndEvent } from '@dnd-kit/core'
import { KanbanColumn } from './kanban-column'
import { KanbanCard } from './kanban-card'

interface KanbanBoardProps {
  columns: Column[]
  cards: Card[]
  onDragEnd: (event: DragEndEvent) => void
  onCardClick: (card: Card) => void
  onAddCard: (columnId: string) => void
}

export function KanbanBoard({ columns, cards, onDragEnd, onCardClick, onAddCard }: KanbanBoardProps) {
  return (
    <DndContext onDragEnd={onDragEnd}>
      <div className="flex h-full gap-4 overflow-x-auto">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            cards={cards.filter((c) => c.status === column.id)}
            onCardClick={onCardClick}
            onAddCard={() => onAddCard(column.id)}
          />
        ))}
      </div>
    </DndContext>
  )
}

// columns.ts
export const LEAD_COLUMNS = [
  { id: 'PROSPECT', title: 'Prospect', color: 'bg-slate-400' },
  { id: 'CONTACTED', title: 'Contacted', color: 'bg-blue-500' },
  { id: 'CONFIRMED', title: 'Confirmed', color: 'bg-green-500' },
  { id: 'RECORDED', title: 'Recorded', color: 'bg-purple-500' },
]
```

## Calendar Spec (Google Calendar Style)

```typescript
// components/custom/calendar/event-calendar.tsx
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import { withDragAndDrop } from 'react-big-calendar/lib/addons/drag-and-drop'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const DnDCalendar = withDragAndDrop(Calendar)

interface EventCalendarProps {
  events: CalendarEvent[]
  onView: (view: View) => void
  onNavigate: (date: Date) => void
  onSelectEvent: (event: CalendarEvent) => void
  onSelectSlot: (slot: SlotInfo) => void
  onEventDrop: (event: CalendarEvent, start: Date, end: Date) => void
  onEventResize: (event: CalendarEvent, start: Date, end: Date) => void
}

export function EventCalendar({ events, onView, onNavigate, onSelectEvent, onSelectSlot, onEventDrop, onEventResize }: EventCalendarProps) {
  return (
    <DnDCalendar
      localizer={localizer}
      events={events}
      startAccessor="start"
      endAccessor="end"
      views={['month', 'week', 'day', 'agenda']}
      defaultView="month"
      step={60}
      showMultiDayTimes
      selectable
      resizable
      draggableAccessor={() => true}
      onView={onView}
      onNavigate={onNavigate}
      onSelectEvent={onSelectEvent}
      onSelectSlot={onSelectSlot}
      onEventDrop={onEventDrop}
      onEventResize={onEventResize}
      className="h-[600px]"
    />
  )
}
```

## Consequências

### Positivas

- ✅ Componentes acessíveis desde o início
- ✅ Total controle do código
- ✅ Fácil de customizar
- ✅ Sem runtime dependency
- ✅ TypeScript first

### Negativas

- ⚠️ Mais código para manter
- ⚠️ Precisa atualizar manualmente
- ⚠️ Componentes customizados exigem teste

---

## Referências

- [Shadcn/UI](https://ui.shadcn.com)
- [@dnd-kit/core](https://dndkit.com)
- [React Big Calendar](https://jquense.github.io/react-big-calendar)

---

**Próxima decisão**: ADR-005 (Tables & Data Grid)
