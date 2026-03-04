# Podcast SaaS - Design System

**Versão**: 1.0.0  
**Última atualização**: 2026-03-03  
**Status**: Documentado para refatoração do frontend

---

## 📋 Visão Geral

Design System do Podcast SaaS POC, construído sobre **Shadcn/UI** + **TailwindCSS 4** + **Radix UI**.

### Tech Stack

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| Next.js | 16.1.6 | Framework React |
| React | 19.2.3 | Biblioteca UI |
| TypeScript | 5.x | Type safety |
| TailwindCSS | 4.x | Utility-first CSS |
| Shadcn/UI | latest | Componentes base |
| Radix UI | ^1.4.3 | Primitivos acessíveis |
| Lucide React | ^0.564.0 | Ícones |
| Recharts | ^3.7.0 | Gráficos e charts |
| date-fns | ^4.1.0 | Manipulação de datas |

---

## 🎨 Cores

### Paleta Principal (Light Mode)

```css
:root {
  /* Background */
  --background: oklch(0.985 0.002 247.839);    /* slate-50 #F8FAFC */
  --foreground: oklch(0.145 0.029 264.342);    /* slate-900 */
  
  /* Cards */
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0.029 264.342);
  
  /* Primary - Azul */
  --primary: oklch(0.55 0.22 260.65);          /* blue-500 #3B82F6 */
  --primary-foreground: oklch(0.985 0 0);
  
  /* Secondary - Azul Escuro */
  --secondary: oklch(0.35 0.15 264.45);        /* blue-800 #1E40AF */
  --secondary-foreground: oklch(0.985 0 0);
  
  /* Muted */
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0.033 259.033);  /* slate-500 */
  
  /* Accent */
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  
  /* Destructive - Vermelho */
  --destructive: oklch(0.577 0.245 27.325);
  --destructive-foreground: oklch(0.577 0.245 27.325);
  
  /* Border & Input */
  --border: oklch(0.922 0.01 264.532);         /* slate-200 #E2E8F0 */
  --input: oklch(0.922 0.01 264.532);
  --ring: oklch(0.55 0.22 260.65);
}
```

### Dark Mode

```css
.dark {
  --background: oklch(0.145 0.029 264.342);    /* slate-900 */
  --foreground: oklch(0.985 0 0);
  
  --card: oklch(0.145 0.029 264.342);
  --card-foreground: oklch(0.985 0 0);
  
  --primary: oklch(0.55 0.22 260.65);
  --primary-foreground: oklch(0.985 0 0);
  
  --secondary: oklch(0.35 0.15 264.45);
  --secondary-foreground: oklch(0.985 0 0);
  
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  
  --destructive: oklch(0.396 0.141 25.723);
  --destructive-foreground: oklch(0.637 0.237 25.331);
  
  --border: oklch(0.269 0 0);
  --input: oklch(0.269 0 0);
  --ring: oklch(0.439 0 0);
}
```

### Cores de Charts

```css
--chart-1: oklch(0.55 0.22 260.65);  /* Azul principal */
--chart-2: oklch(0.145 0.029 264.342);  /* Slate-900 */
--chart-3: oklch(0.35 0.15 264.45);  /* Azul escuro */
--chart-4: oklch(0.704 0.165 260.7);  /* Azul claro */
--chart-5: oklch(0.88 0.06 260.65);  /* Azul muito claro */
```

---

## 🔤 Tipografia

### Fonte Principal

```typescript
const inter = Inter({ subsets: ["latin"] })
```

**Inter** - Google Fonts

### Escala Tipográfica

| Elemento | Tamanho | Peso | Altura |
|----------|---------|------|--------|
| H1 / Page Title | `text-3xl` | font-bold | tracking-tight |
| H2 / Card Title | `text-xl` | font-semibold | leading-none |
| H3 | `text-lg` | font-medium | - |
| Body | `text-sm` | font-normal | - |
| Small / Caption | `text-xs` | font-medium | leading-none |
| Muted Text | `text-sm` | text-muted-foreground | - |

---

## 📐 Espaçamento

### Padding Padrão

| Componente | Padding |
|------------|---------|
| Page Container | `p-8` |
| Card | `py-6 px-6` |
| Card Header | `px-6` (grid auto-rows-min) |
| Table Cell | `p-2` |
| Button | `h-9 px-4 py-2` |
| Input | `h-9 px-3 py-2` |

### Gap / Espaçamento entre elementos

- Page sections: `space-y-6`
- Card header internal: `gap-2`
- Form fields: `gap-4`
- Grid layouts: `grid gap-4 md:grid-cols-2 lg:grid-cols-4`

---

## 🔘 Componentes

### Button

**Path**: `@/components/ui/button`

```tsx
import { Button } from "@/components/ui/button"

// Variantes
variant: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"

// Tamanhos
size: "default" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg"
```

**Exemplos de uso**:

```tsx
// Primary
<Button>Add Lead</Button>

// Secondary
<Button variant="outline">Download Report</Button>

// Icon
<Button variant="ghost" size="icon">
  <MoreHorizontal className="h-4 w-4" />
</Button>

// Small
<Button size="sm">Add Lead</Button>
```

### Card

**Path**: `@/components/ui/card`

```tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

### Input

**Path**: `@/components/ui/input`

```tsx
import { Input } from "@/components/ui/input"

<Input 
  id="email" 
  placeholder="Search..." 
  className="pl-8"  // Com ícone
/>
```

### Table

**Path**: `@/components/ui/table`

```tsx
import {
  Table, TableBody, TableCaption, TableCell, TableFooter,
  TableHead, TableHeader, TableRow
} from "@/components/ui/table"

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

### Badge

**Path**: `@/components/ui/badge`

```tsx
import { Badge } from "@/components/ui/badge"

<Badge variant="default">CONFIRMED</Badge>
<Badge variant="secondary">CONTACTED</Badge>
<Badge variant="outline">PROSPECT</Badge>
```

### Dialog (Modal)

**Path**: `@/components/ui/dialog`

```tsx
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog"

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogTrigger asChild>
    <Button>Open</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
    {/* Content */}
    <DialogFooter>
      <Button>Save</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Select

**Path**: `@/components/ui/select`

```tsx
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from "@/components/ui/select"

<Select value={value} onValueChange={setValue}>
  <SelectTrigger className="col-span-3">
    <SelectValue placeholder="Select" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
  </SelectContent>
</Select>
```

### Avatar

**Path**: `@/components/ui/avatar`

```tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

<Avatar>
  <AvatarImage src={avatarUrl} alt="Name" />
  <AvatarFallback>{initials}</AvatarFallback>
</Avatar>
```

### Sidebar

**Path**: `@/components/ui/sidebar`

```tsx
import {
  Sidebar, SidebarContent, SidebarGroup,
  SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem
} from "@/components/ui/sidebar"

<Sidebar>
  <SidebarContent>
    <SidebarGroup>
      <SidebarGroupLabel>Application</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="/path">
                <Icon />
                <span>Title</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  </SidebarContent>
</Sidebar>
```

### Toast

**Path**: `@/hooks/use-toast` + `@/components/ui/toaster`

```tsx
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

// No layout
<Toaster />

// Usage
const { toast } = useToast()

toast({
  variant: "destructive",
  title: "Error",
  description: "Something went wrong",
})
```

---

## 📊 Layout Patterns

### Page Structure

```tsx
<div className="space-y-6">
  {/* Page Header */}
  <div className="flex items-center justify-between">
    <div>
      <h2 className="text-3xl font-bold tracking-tight">Title</h2>
      <p className="text-muted-foreground">Description</p>
    </div>
    <div className="flex items-center gap-2">
      {/* Actions */}
    </div>
  </div>
  
  {/* Content */}
  <Card>...</Card>
</div>
```

### KPI Cards Grid

```tsx
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">Title</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">Value</div>
      <p className="text-xs text-muted-foreground">Description</p>
    </CardContent>
  </Card>
  {/* More cards... */}
</div>
```

### Dashboard Layout (2 columns)

```tsx
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
  <Card className="col-span-4">
    {/* Chart */}
  </Card>
  <Card className="col-span-3">
    {/* Activity feed */}
  </Card>
</div>
```

### Search + Table

```tsx
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
    <Table>...</Table>
  </CardContent>
</Card>
```

---

## 🎯 Padrões de UX

### Empty States

**Componente**: `@/components/empty-state`

```tsx
<EmptyState
  title="Welcome to Podcast SaaS"
  description="Get started by adding your first lead or episode."
  action={
    <div className="flex gap-2 justify-center">
      <Link href="/leads">
        <Button>Add Your First Lead</Button>
      </Link>
    </div>
  }
  icon={<TrendingUp className="h-8 w-8 text-slate-400" />}
/>
```

### Loading States

```tsx
{isLoading && (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center space-y-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
)}
```

### Error States

```tsx
{hasError && (
  <EmptyState
    title="Unable to load data"
    description="There was a problem. Please try again."
    action={
      <Button onClick={() => window.location.reload()}>
        Try Again
      </Button>
    }
  />
)}
```

---

## 🔌 Integração com API

### API Client

**Path**: `@/lib/api.ts`

```typescript
export async function fetchAPI(endpoint: string, options?: RequestInit) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Request failed')
  }
  
  return response.json()
}
```

### Padrão de Fetch em Componentes

```tsx
useEffect(() => {
  const fetchData = async () => {
    setIsLoading(true)
    try {
      const data = await fetchAPI('/api/endpoint')
      setData(data)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  fetchData()
}, [])
```

---

## 📱 Responsividade

### Breakpoints

| Breakpoint | Min Width | Uso |
|------------|-----------|-----|
| sm | 640px | - |
| md | 768px | `md:grid-cols-2` |
| lg | 1024px | `lg:grid-cols-4` |
| xl | 1280px | - |
| 2xl | 1536px | - |

### Padrões Responsivos

```tsx
// Grid responsivo
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

// Esconder em mobile
<div className="hidden md:block">

// Padding responsivo
<div className="p-4 md:p-8">
```

---

## 🧩 Ícones

**Biblioteca**: Lucide React

### Ícones por Módulo

| Módulo | Ícones Principais |
|--------|------------------|
| Dashboard | `Home`, `TrendingUp`, `DollarSign`, `Users`, `Mic`, `Calendar` |
| Leads | `Users`, `Mail`, `Phone`, `Search`, `Plus`, `MoreHorizontal` |
| Agenda | `Calendar`, `Clock`, `Plus` |
| Episodes | `Mic`, `FileAudio`, `Users` |
| Finance | `Wallet`, `DollarSign`, `TrendingUp` |
| Settings | `Settings`, `Palette`, `User` |

---

## 📋 Formulários

### Padrão de Criação (Dialog)

```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogTrigger asChild>
    <Button><Plus className="mr-2 h-4 w-4" /> Add Item</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Add New Item</DialogTitle>
      <DialogDescription>Description here.</DialogDescription>
    </DialogHeader>
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="field" className="text-right">Field</Label>
        <Input id="field" className="col-span-3" />
      </div>
    </div>
    <DialogFooter>
      <Button onClick={handleSave}>Save</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

## 🎨 Próximos Passos (Refatoração)

### Componentes Customizados a Criar

1. **LeadCard** - Card específico para leads
2. **EpisodeTimeline** - Timeline de episódios
3. **BudgetSummary** - Resumo orçamentário
4. **InvoiceCard** - Card de faturas
5. **ReportChart** - Wrapper para gráficos

### Melhorias de UX

1. Skeleton loaders em vez de "Loading..."
2. Error boundaries por módulo
3. Offline support
4. Keyboard shortcuts
5. Bulk actions nas tabelas

---

## 📚 Referências

- [Shadcn/UI Documentation](https://ui.shadcn.com)
- [TailwindCSS 4 Documentation](https://tailwindcss.com)
- [Radix UI Primitives](https://www.radix-ui.com)
- [Lucide Icons](https://lucide.dev)
- [Recharts](https://recharts.org)

---

**Documento criado para**: Refatoração completa do frontend Podcast SaaS  
**Branch**: `011-frontend-refactor` (a ser criada)
