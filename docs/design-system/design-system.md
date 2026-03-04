# 🎨 Podcast SaaS - Design System

**Versão**: 2.0.0  
**Última atualização**: 2026-03-03  
**Status**: ✅ Aprovado para implementação  
**Projeto**: Podcast SaaS POC - Frontend Refactor

---

## 📋 Visão Geral

Design System moderno para SaaS de gerenciamento de podcast, focado em **performance, segurança e DX**.

### Princípios de Design

1. **Clean & Modern** - Interface limpa, foco no conteúdo
2. **Performance First** - Carregamento rápido, lazy loading
3. **Accessibility** - WCAG 2.1 AA compliant
4. **Consistency** - Padrões consistentes em toda aplicação
5. **Scalability** - Fácil de estender e manter

---

## 🛠️ Tech Stack

| Categoria | Tecnologia | Versão | Justificativa |
|-----------|------------|--------|---------------|
| **Framework** | Next.js | 16.x | React 19, App Router, otimizações automáticas |
| **Linguagem** | TypeScript | 5.x | Type safety, melhor DX |
| **UI Library** | Shadcn/UI | latest | Componentes acessíveis, customizáveis |
| **Styling** | TailwindCSS | 4.x | Utility-first, performance |
| **State** | Zustand | 5.x | Leve, simples, sem boilerplate |
| **Data Fetching** | TanStack Query | 5.x | Caching, refetch, otimização |
| **Forms** | React Hook Form + Zod | 8.x / 3.x | Performance, validação type-safe |
| **Table** | TanStack Table | 8.x | Headless, poderoso, flexível |
| **Charts** | Recharts | 3.x | Declarativo, baseado em D3 |
| **Calendar** | React Big Calendar | latest | Google Calendar-like |
| **Icons** | Lucide React | latest | Leve, consistente |
| **Date Utils** | date-fns | 4.x | Tree-shakable, moderna |

---

## 🎨 Cores

### Paleta Principal

**Base**: Cinza (Slate) + Azul (Primary)

```css
:root {
  /* Backgrounds */
  --background: oklch(0.985 0.002 247.839);    /* slate-50 #F8FAFC */
  --foreground: oklch(0.145 0.029 264.342);    /* slate-900 */
  --surface: oklch(1 0 0);                      /* white #FFFFFF */
  
  /* Primary - Azul */
  --primary: oklch(0.55 0.22 260.65);          /* blue-500 #3B82F6 */
  --primary-foreground: oklch(0.985 0 0);      /* white */
  --primary-hover: oklch(0.50 0.20 260.65);    /* blue-600 */
  
  /* Secondary - Azul Escuro */
  --secondary: oklch(0.35 0.15 264.45);        /* blue-800 #1E40AF */
  --secondary-foreground: oklch(0.985 0 0);
  
  /* Muted */
  --muted: oklch(0.97 0 0);                    /* slate-50 */
  --muted-foreground: oklch(0.556 0.033 259.033);  /* slate-500 */
  
  /* Accent */
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  
  /* Destructive - Vermelho */
  --destructive: oklch(0.577 0.245 27.325);    /* red-500 */
  --destructive-foreground: oklch(0.985 0 0);
  
  /* Success - Verde */
  --success: oklch(0.723 0.219 149.579);       /* green-500 */
  --success-foreground: oklch(0.985 0 0);
  
  /* Warning - Amarelo */
  --warning: oklch(0.795 0.184 86.047);        /* yellow-500 */
  --warning-foreground: oklch(0.205 0 0);
  
  /* Border & Input */
  --border: oklch(0.922 0.01 264.532);         /* slate-200 #E2E8F0 */
  --input: oklch(0.922 0.01 264.532);
  --ring: oklch(0.55 0.22 260.65);
  
  /* Cards */
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0.029 264.342);
  
  /* Popover */
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0.029 264.342);
}
```

### Cores de Charts

```css
--chart-1: oklch(0.55 0.22 260.65);  /* Azul principal */
--chart-2: oklch(0.723 0.219 149.579);  /* Verde */
--chart-3: oklch(0.795 0.184 86.047);  /* Amarelo */
--chart-4: oklch(0.627 0.265 303.9);  /* Roxo */
--chart-5: oklch(0.645 0.246 16.439);  /* Laranja */
```

### Status Colors (Semânticas)

| Status | Cor | Uso |
|--------|-----|-----|
| `PROSPECT` | slate-400 | Leads novos |
| `CONTACTED` | blue-500 | Leads contatados |
| `CONFIRMED` | green-500 | Leads confirmados |
| `RECORDED` | purple-500 | Leads gravados |
| `PENDING` | yellow-500 | Pagamentos pendentes |
| `APPROVED` | blue-500 | Pagamentos aprovados |
| `PAID` | green-500 | Pagamentos pagos |
| `OVERDUE` | red-500 | Pagamentos vencidos |
| `CANCELLED` | slate-400 | Cancelados |

---

## 🔤 Tipografia

### Fonte Principal

**Inter** - Google Fonts

```typescript
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})
```

### Escala Tipográfica

| Token | Tamanho | Peso | Altura | Uso |
|-------|---------|------|--------|-----|
| `text-xs` | 0.75rem (12px) | font-medium | 1 | Labels, badges |
| `text-sm` | 0.875rem (14px) | font-normal | 1.5 | Body, captions |
| `text-base` | 1rem (16px) | font-normal | 1.5 | Default |
| `text-lg` | 1.125rem (18px) | font-medium | 1.4 | Subtitles |
| `text-xl` | 1.25rem (20px) | font-semibold | 1.3 | Card titles |
| `text-2xl` | 1.5rem (24px) | font-semibold | 1.3 | Section titles |
| `text-3xl` | 1.875rem (30px) | font-bold | 1.2 | Page titles |

### Font Weights

```typescript
font-normal: 400   // Body text
font-medium: 500   // Labels, buttons
font-semibold: 600 // Titles, emphasis
font-bold: 700     // Page titles, KPIs
```

---

## 📐 Espaçamento

### Sistema de Espaçamento (Base: 4px)

| Token | Valor | Uso |
|-------|-------|-----|
| `p-2` | 0.5rem (8px) | Tight spacing |
| `p-3` | 0.75rem (12px) | Compact components |
| `p-4` | 1rem (16px) | Standard padding |
| `p-6` | 1.5rem (24px) | Card padding |
| `p-8` | 2rem (32px) | Page padding |

### Gap / Espaçamento entre elementos

```typescript
// Layouts
gap-2: 0.5rem (8px)   // Tight groups
gap-3: 0.75rem (12px) // Form fields
gap-4: 1rem (16px)    // Standard gap
gap-6: 1.5rem (24px)  // Page sections

// Space Y (vertical)
space-y-2: 0.5rem
space-y-4: 1rem
space-y-6: 1.5rem
```

### Density

**Confortável** (padrão SaaS moderno):
- Page container: `p-8`
- Cards: `py-6 px-6`
- Form fields: `gap-4`
- Table cells: `p-4`

---

## 🔘 Componentes

### Button

**File**: `@/components/ui/button.tsx`

```typescript
// Variantes
variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'

// Tamanhos
size: 'default' | 'sm' | 'lg' | 'icon' | 'icon-sm'

// Exemplos
<Button>Primary</Button>
<Button variant="outline">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Delete</Button>
<Button size="sm">Small</Button>
<Button size="icon"><Icon /></Button>
```

**Specs**:
- Height: `h-9` (default), `h-8` (sm), `h-10` (lg)
- Padding: `px-4 py-2`
- Border radius: `rounded-md` (~6px)
- Font: `text-sm font-medium`
- Transition: `transition-all`
- Focus: `focus-visible:ring-2 focus-visible:ring-ring`

### Input

**File**: `@/components/ui/input.tsx`

```typescript
<Input 
  placeholder="Search..." 
  type="text" | "email" | "password" | "number"
  disabled
  error
/>
```

**Specs**:
- Height: `h-9`
- Padding: `px-3 py-2`
- Border: `border border-input`
- Border radius: `rounded-md`
- Font: `text-sm`
- Focus: `focus-visible:ring-2 focus-visible:ring-ring`
- Error: `border-destructive`

### Card

**File**: `@/components/ui/card.tsx`

```typescript
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
  <CardFooter>Footer</CardFooter>
</Card>
```

**Specs**:
- Background: `bg-card`
- Border: `border border-border`
- Border radius: `rounded-xl` (~12px)
- Shadow: `shadow-sm`
- Padding: `py-6 px-6`

### Badge

**File**: `@/components/ui/badge.tsx`

```typescript
<Badge variant="default" | "secondary" | "outline" | "destructive">
  Status
</Badge>
```

**Specs**:
- Height: `h-5`
- Padding: `px-2 py-0.5`
- Font: `text-xs font-medium`
- Border radius: `rounded-md`

### Table (TanStack)

**File**: `@/components/ui/table.tsx`

```typescript
import { useReactTable, ... } from '@tanstack/react-table'

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Header</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Cell</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

**Features**:
- Sorting
- Filtering
- Pagination
- Row selection
- Column resizing
- Virtual scrolling (para grandes datasets)

### Dialog (Modal)

**File**: `@/components/ui/dialog.tsx`

```typescript
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
      <Button>Save</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**Specs**:
- Max width: `sm:max-w-[425px]` (default), `sm:max-w-[600px]` (large)
- Padding: `p-6`
- Border radius: `rounded-xl`
- Overlay: `bg-black/50`

### Calendar (Google Calendar Style)

**File**: `@/components/ui/calendar.tsx`

```typescript
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import 'react-big-calendar/lib/css/react-big-calendar.css'

<Calendar
  localizer={localizer}
  events={events}
  startAccessor="start"
  endAccessor="end"
  views={['month', 'week', 'day', 'agenda']}
  defaultView="month"
  step={60}
  showMultiDayTimes
  onNavigate={setDate}
  onView={setView}
  onSelectEvent={handleSelectEvent}
  onSelectSlot={handleSelectSlot}
  draggableAccessor={() => true}
  resizableAccessor={() => true}
/>
```

**Features**:
- Views: Month, Week, Day, Agenda
- Drag-and-drop
- Resize events
- Quick add (click & drag)
- Multi-day events
- Color coding por tipo
- Integration com Episodes, Leads, Agenda

### Kanban Board

**File**: `@/components/ui/kanban.tsx`

```typescript
<KanbanBoard
  columns={columns}
  cards={cards}
  onDragEnd={handleDragEnd}
  onCardClick={handleCardClick}
  onAddCard={handleAddCard}
/>
```

**Columns** (Leads):
```typescript
const columns = [
  { id: 'PROSPECT', title: 'Prospect' },
  { id: 'CONTACTED', title: 'Contacted' },
  { id: 'CONFIRMED', title: 'Confirmed' },
  { id: 'RECORDED', title: 'Recorded' },
]
```

**Card Content**:
- Avatar + Nome
- Empresa + Cargo
- Email + Phone (ícones)
- Status badge
- Última interação (relative time)
- Tags (opcional)

**Features**:
- Drag-and-drop entre colunas
- Quick edit (inline)
- Filters (fonte, role, tags)
- Search
- Bulk actions

---

## 📊 Layout Patterns

### Page Structure

```typescript
<div className="min-h-screen bg-background">
  <Sidebar />
  <main className="ml-[sidebar-width]">
    <TopBar />
    <div className="p-8 space-y-6">
      <PageHeader 
        title="Title"
        description="Description"
        actions={<Actions />}
      />
      <Content />
    </div>
  </main>
</div>
```

### KPI Cards Grid

```typescript
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
  <KPICard
    title="Total Leads"
    value="124"
    trend="+20.1%"
    trendType="positive"
    icon={Users}
  />
</div>
```

### Dashboard Layout

```typescript
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
  <Card className="col-span-4">
    <Chart />
  </Card>
  <Card className="col-span-3">
    <ActivityFeed />
  </Card>
</div>
```

### Search + Table

```typescript
<Card>
  <CardHeader>
    <div className="flex items-center justify-between">
      <CardTitle>Title</CardTitle>
      <div className="relative w-72">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search..." className="pl-8" />
      </div>
    </div>
  </CardHeader>
  <CardContent>
    <DataTable 
      columns={columns} 
      data={data}
      onRowClick={handleRowClick}
    />
  </CardContent>
</Card>
```

---

## 🎯 Padrões de UX

### Loading States

**Skeleton** (padrão):

```typescript
<Skeleton className="h-32 w-full" />
<Skeleton className="h-4 w-3/4" />
<Skeleton className="h-4 w-1/2" />
```

**Spinner** (full screen):

```typescript
<div className="flex items-center justify-center min-h-[400px]">
  <div className="text-center space-y-4">
    <Loader2 className="h-8 w-8 animate-spin mx-auto" />
    <p className="text-muted-foreground">Loading...</p>
  </div>
</div>
```

### Empty States

```typescript
<EmptyState
  icon={Icon}
  title="No data yet"
  description="Add your first item to get started"
  action={
    <Button onClick={handleAction}>
      <Plus className="h-4 w-4 mr-2" />
      Add Item
    </Button>
  }
/>
```

### Error States

```typescript
<ErrorState
  title="Something went wrong"
  description={error.message}
  action={
    <Button onClick={retry}>
      <RefreshCw className="h-4 w-4 mr-2" />
      Try Again
    </Button>
  }
/>
```

### Toast Notifications

```typescript
// Success
toast({
  title: 'Success',
  description: 'Item created successfully',
})

// Error
toast({
  variant: 'destructive',
  title: 'Error',
  description: error.message,
})

// With action
toast({
  title: 'Item created',
  description: 'View the item or close this notification',
  action: (
    <ToastAction altText="View">
      <Link href={`/items/${id}`}>View</Link>
    </ToastAction>
  ),
})
```

---

## 🔌 Arquitetura & Padrões

### State Management (Zustand)

```typescript
import { create } from 'zustand'

interface AppState {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}))
```

### Data Fetching (TanStack Query)

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Query
export function useLeads() {
  return useQuery({
    queryKey: ['leads'],
    queryFn: () => fetchAPI('/api/leads'),
  })
}

// Mutation
export function useCreateLead() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data) => fetchAPI('/api/leads', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
    },
  })
}
```

### Forms (React Hook Form + Zod)

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const leadSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  role: z.enum(['GUEST', 'HOST', 'PRODUCER']),
  status: z.enum(['PROSPECT', 'CONTACTED', 'CONFIRMED', 'RECORDED']),
})

type LeadForm = z.infer<typeof leadSchema>

export function LeadForm() {
  const form = useForm<LeadForm>({
    resolver: zodResolver(leadSchema),
  })
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Save</Button>
      </form>
    </Form>
  )
}
```

### API Client

```typescript
// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export async function fetchAPI(endpoint: string, options?: RequestInit) {
  const url = `${API_BASE_URL}${endpoint}`
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(error.message || `HTTP ${response.status}`)
  }
  
  return response.json()
}
```

---

## 📱 Responsividade

### Breakpoints

| Token | Min Width | Uso |
|-------|-----------|-----|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablets |
| `lg` | 1024px | Laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large screens |

### Padrões Responsivos

```typescript
// Grid responsivo
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

// Esconder em mobile
<div className="hidden md:block">

// Sidebar responsiva
<Sidebar className="hidden lg:block" />

// Padding responsivo
<div className="p-4 md:p-8">

// Table scroll
<div className="overflow-x-auto">
  <Table />
</div>
```

---

## 🧩 Ícones (Lucide)

### Ícones por Módulo

| Módulo | Ícones |
|--------|--------|
| **Dashboard** | `Home`, `TrendingUp`, `DollarSign`, `Users`, `Mic`, `Calendar` |
| **Leads** | `Users`, `Mail`, `Phone`, `Search`, `Plus`, `MoreHorizontal`, `Filter` |
| **Agenda** | `Calendar`, `Clock`, `Plus`, `ChevronLeft`, `ChevronRight` |
| **Episodes** | `Mic`, `FileAudio`, `Users`, `Calendar` |
| **Budget** | `Wallet`, `DollarSign`, `TrendingUp`, `PiggyBank` |
| **Billing** | `Receipt`, `CreditCard`, `DollarSign`, `CheckCircle` |
| **Settings** | `Settings`, `Palette`, `User`, `Bell` |

---

## 📋 Módulos & Páginas

### 1. Dashboard (`/`)

**Componentes**:
- KPI Cards (4)
- Revenue Chart (Bar)
- Activity Feed
- Quick Actions

**API**:
- `GET /api/reports/dashboard`
- `GET /api/reports/financial/trend`
- `GET /api/reports/recent-activity`

### 2. Leads (`/leads`)

**Componentes**:
- Kanban Board
- Lead Card
- Lead Dialog (CRUD)
- Filters + Search

**API**:
- `GET /api/leads`
- `POST /api/leads`
- `GET /api/leads/:id`
- `PUT /api/leads/:id`
- `DELETE /api/leads/:id`

### 3. Agenda (`/agenda`)

**Componentes**:
- Calendar (Google Calendar style)
- Event Dialog
- Quick Add

**API**:
- `GET /api/agenda/events`
- `POST /api/agenda/events`
- `PUT /api/agenda/events/:id`
- `DELETE /api/agenda/events/:id`

### 4. Episodes (`/episodes`)

**Componentes**:
- Table (TanStack)
- Episode Dialog
- Episode Detail Page

**API**:
- `GET /api/episodes`
- `GET /api/episodes/:id`

### 5. Budget (`/budget`)

**Componentes**:
- KPI Cards
- Table
- Chart (Revenue vs Expense)
- Budget Dialog

**API**:
- `GET /api/budget`
- `GET /api/budget/summary`
- `POST /api/budget`

### 6. Billing (`/billing`)

**Componentes**:
- Table (Invoices)
- Invoice Card
- Payment Dialog

**API**:
- `GET /api/billing/invoices`
- `POST /api/billing/invoices`
- `POST /api/billing/payments`

### 7. Settings (`/settings`)

**Componentes**:
- Tabs (General, Appearance, Notifications)
- Forms
- Color Picker

---

## 🔒 Segurança

### Headers

```typescript
// next.config.ts
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
]
```

### Environment Variables

```typescript
// .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=Podcast SaaS

// Server-side only
DATABASE_URL=postgresql://...
```

---

## 📊 Performance

### Otimizações

1. **Lazy Loading** - Componentes pesados (Calendar, Charts)
2. **Virtual Scrolling** - Tabelas grandes (TanStack Virtual)
3. **Image Optimization** - Next.js Image component
4. **Code Splitting** - Next.js automatic
5. **Caching** - TanStack Query (staleTime: 5min)
6. **Debouncing** - Search inputs (300ms)

### Bundle Size Targets

- Initial JS: < 100KB
- Total JS: < 500KB
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s

---

## 📚 Referências

- [Shadcn/UI](https://ui.shadcn.com)
- [TailwindCSS 4](https://tailwindcss.com)
- [TanStack Query](https://tanstack.com/query)
- [TanStack Table](https://tanstack.com/table)
- [React Big Calendar](https://jquense.github.io/react-big-calendar)
- [Zustand](https://zustand-demo.pmnd.rs)
- [React Hook Form](https://react-hook-form.com)
- [Zod](https://zod.dev)

---

**Próximo**: Criar PRDs de cada módulo e ADRs
