# ADR-005: Tables & Data Grid - TanStack Table

**Data**: 2026-03-03  
**Status**: ✅ Aprovado  
**Projeto**: Podcast SaaS Frontend

---

## Contexto

Precisamos de uma solução para tabelas que suporte sorting, filtering, pagination e seja performática com grandes datasets.

## Decisão

Utilizar **TanStack Table v8** (React Table) como headless table library.

### Por que TanStack Table?

1. **Headless** - Controle total da UI
2. **Poderoso** - Sorting, filtering, pagination, grouping, aggregation
3. **Performático** - Virtualização suportada
4. **TypeScript** - Types excelentes
5. **Framework agnostic** - Pode usar em Vue, Svelte, Solid

### Features que vamos usar

- **Sorting** - Column-based, multi-column
- **Filtering** - Global + column filters
- **Pagination** - Client-side + server-side
- **Row Selection** - Checkbox + click
- **Column Resizing** - Adjustable widths
- **Column Ordering** - Drag-and-drop columns
- **Grouping** - Group rows by column
- **Aggregation** - Sum, average, count

## Implementação

### Basic Table

```typescript
// components/custom/common/data-table.tsx
'use client'

import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onRowClick?: (row: TData) => void
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onRowClick,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <div className="space-y-4">
      {/* Global Filter */}
      <Input
        placeholder="Search..."
        value={(table.getState().globalFilter as string) ?? ''}
        onChange={(e) => table.setGlobalFilter(e.target.value)}
        className="max-w-sm"
      />

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  onClick={() => onRowClick?.(row.original)}
                  className={onRowClick ? 'cursor-pointer hover:bg-muted/50' : ''}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} row(s)
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
```

### Column Definition Example

```typescript
// components/leads/leads-table.tsx
import { ColumnDef } from '@tanstack/react-table'
import { Lead } from '@/types/lead'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { MoreHorizontal } from 'lucide-react'

export const leadsColumns: ColumnDef<Lead>[] = [
  {
    accessorKey: 'name',
    header: 'Guest',
    cell: ({ row }) => {
      const lead = row.original
      return (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={lead.avatarUrl || undefined} />
            <AvatarFallback>
              {lead.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{lead.name}</div>
            <div className="text-xs text-muted-foreground">
              {lead.position} {lead.company ? `at ${lead.company}` : ''}
            </div>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      return <Badge variant={getStatusVariant(status)}>{status}</Badge>
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => row.getValue('role'),
  },
  {
    accessorKey: 'lastContact',
    header: 'Last Contact',
    cell: ({ row }) => {
      const date = row.getValue('lastContact') as string | null
      return date ? formatDistanceToNow(new Date(date), { addSuffix: true }) : 'Never'
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const lead = row.original
      return (
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      )
    },
  },
]
```

### Server-side Pagination

```typescript
// hooks/use-leads.ts
export function useLeads(page: number, pageSize: number, filters?: LeadFilters) {
  return useQuery({
    queryKey: ['leads', page, pageSize, filters],
    queryFn: () => 
      fetchAPI(`/api/leads?page=${page}&limit=${pageSize}${filtersToQuery(filters)}`),
  })
}

// Usage
const { data, isLoading } = useLeads(page, 10, { status: 'PROSPECT' })
```

## Alternativas Consideradas

| Alternativa | Prós | Contras | Por que não |
|-------------|------|---------|-------------|
| Shadcn Table | Simples, integrado | Sem features avançadas | Precisamos de sorting/filtering |
| AG Grid | Muito poderoso | Bundle grande (~200KB), complexo | Overkill |
| MUI Table | Features boas | Bundle grande, Material only | Queremos Shadcn |
| React Virtualized | Virtualização excelente | API complexa | TanStack tem virtualização |

## Consequências

### Positivas

- ✅ Controle total da UI
- ✅ Features poderosas
- ✅ Performance excelente
- ✅ TypeScript first
- ✅ Comunidade ativa

### Negativas

- ⚠️ Curva de aprendizado
- ⚠️ Mais código que tabelas simples
- ⚠️ Virtualização requer configuração extra

---

## Referências

- [TanStack Table](https://tanstack.com/table)
- [TanStack Table Examples](https://tanstack.com/table/latest/docs/examples)

---

**Próxima decisão**: Plano de Implementação (Ralph Loop)
