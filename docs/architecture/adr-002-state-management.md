# ADR-002: Gerenciamento de Estado - Zustand + TanStack Query

**Data**: 2026-03-03  
**Status**: ✅ Aprovado  
**Projeto**: Podcast SaaS Frontend

---

## Contexto

Precisamos definir como gerenciar estado no frontend: estado global, estado de servidor, cache, etc.

## Decisão

Utilizar **Zustand** para estado global + **TanStack Query** para server state.

### Divisão de Responsabilidades

```typescript
// Zustand: Estado global da UI
interface AppState {
  sidebarOpen: boolean
  currentTheme: 'light' | 'dark'
  user: User | null
}

// TanStack Query: Estado do servidor
queryClient.fetchQuery(['leads'], fetchLeads)
```

## Por que Zustand?

1. **Leve** - ~1KB (vs 20KB+ do Redux)
2. **Simples** - Sem boilerplate, sem providers
3. **TypeScript** - Inferência automática
4. **Performance** - Sem re-renders desnecessários
5. **DevTools** - Suporte a Redux DevTools

```typescript
import { create } from 'zustand'

interface AppStore {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export const useAppStore = create<AppStore>((set) => ({
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}))
```

## Por que TanStack Query?

1. **Caching automático** - Stale-while-revalidate
2. **Refetch inteligente** - Window focus, reconnect, interval
3. **Mutations** - Otimista, rollback, error handling
4. **DevTools** - Debug de queries
5. **Performance** - Deduplicação, retry logic

```typescript
import { useQuery, useMutation } from '@tanstack/react-query'

// Query
const { data: leads, isLoading } = useQuery({
  queryKey: ['leads'],
  queryFn: () => fetchAPI('/api/leads'),
  staleTime: 5 * 60 * 1000, // 5 minutos
})

// Mutation
const createLead = useMutation({
  mutationFn: (data) => fetchAPI('/api/leads', { method: 'POST', body: data }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['leads'] })
  },
})
```

## Alternativas Consideradas

| Alternativa | Prós | Contras | Por que não |
|-------------|------|---------|-------------|
| Redux Toolkit | Poderoso, devtools | Boilerplate, complexo | Overkill para nosso caso |
| Context API | Nativo, simples | Re-renders, sem caching | Não escala bem |
| Jotai | Atomic, simples | Menos maduro | Zustand mais estabelecido |
| SWR | Simples, leve | Menos features que RQ | RQ mais completo |
| Apollo Client | Excelente para GraphQL | Overkill para REST | Estamos usando REST |

## Configuração

### TanStack Query Provider

```typescript
// app/providers.tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevTools } from '@tanstack/react-query-devtools'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevTools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

### API Client Integration

```typescript
// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export async function fetchAPI(endpoint: string, options?: RequestInit) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
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

### Custom Hooks

```typescript
// hooks/use-leads.ts
export function useLeads() {
  return useQuery({
    queryKey: ['leads'],
    queryFn: () => fetchAPI('/api/leads'),
  })
}

export function useCreateLead() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateLeadDTO) => 
      fetchAPI('/api/leads', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
    },
  })
}
```

## Consequências

### Positivas

- ✅ Estado global simples e leve
- ✅ Caching automático de API
- ✅ Refetch inteligente
- ✅ DevTools para debug
- ✅ TypeScript first

### Negativas

- ⚠️ Duas bibliotecas para gerenciar
- ⚠️ Curva de aprendizado do TanStack Query
- ⚠️ Pode ser overkill para apps muito simples

## Padrões

### Query Keys

```typescript
// Padrão: [recurso, id?, filters?]
queryKey: ['leads']
queryKey: ['leads', '123']
queryKey: ['leads', { status: 'PROSPECT' }]
queryKey: ['budget', 'summary']
queryKey: ['agenda', 'events', { startDate, endDate }]
```

### Invalidação

```typescript
// Após mutation, invalidar queries relacionadas
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['leads'] })
  // Ou específico
  queryClient.invalidateQueries({ queryKey: ['leads', id] })
}
```

---

## Referências

- [Zustand Documentation](https://zustand-demo.pmnd.rs)
- [TanStack Query Documentation](https://tanstack.com/query)
- [React Query Best Practices](https://tkdodo.eu/blog/react-query-as-a-state-management-solution)

---

**Próxima decisão**: ADR-003 (Forms & Validation)
