# ADR-001: Frontend Framework - Next.js 16 + React 19

**Data**: 2026-03-03  
**Status**: ✅ Aprovado  
**Projeto**: Podcast SaaS Frontend

---

## Contexto

Precisamos escolher o framework frontend para o Podcast SaaS POC. O backend já está definido (Bun + Elysia + Drizzle) e precisamos de um frontend moderno, performático e fácil de manter.

## Decisão

Utilizar **Next.js 16** com **React 19** em modo SPA tradicional (Client Components).

### Por que Next.js?

1. **Otimizações automáticas** - Image optimization, font optimization, script strategy
2. **App Router** - Routing intuitivo baseado em arquivos
3. **Flexibilidade** - Pode usar RSC quando fizer sentido no futuro
4. **Ecosystem** - Grande comunidade, muitos recursos
5. **Vercel** - Deploy gratuito e fácil (opcional)

### Por que SPA tradicional?

1. **Simplicidade** - Menos complexidade inicial
2. **Backend separado** - API já está em localhost:3001
3. **DX** - Hot reload rápido, debugging fácil
4. **Controle total** - Gerenciamento de estado e data fetching nas nossas mãos

## Alternativas Consideradas

| Alternativa | Prós | Contras | Por que não |
|-------------|------|---------|-------------|
| Vite + React | Mais simples, build rápido | Sem otimizações de produção, menos features | Next.js oferece mais valor |
| Remix | Excelente DX, loaders | Menor comunidade, mais acoplado ao backend | SPA é mais simples para nosso caso |
| Nuxt (Vue) | Excelente DX | Time já conhece React | Manter consistência |

## Consequências

### Positivas

- ✅ Acesso a otimizações do Next.js
- ✅ Fácil deploy (Vercel, Docker, etc.)
- ✅ App Router para organização
- ✅ Image optimization automática
- ✅ Font optimization

### Negativas

- ⚠️ Bundle size maior que Vite
- ⚠️ Complexidade adicional do Next.js
- ⚠️ Server Components podem confundir (vamos usar apenas Client)

## Padrões

```typescript
// Todos os componentes serão Client Components
'use client'

import { useState, useEffect } from 'react'

export default function MyComponent() {
  // ...
}
```

```typescript
// Estrutura de diretórios
apps/web/
├── app/              # App Router
│   ├── layout.tsx    # Root layout
│   ├── page.tsx      # Home
│   ├── leads/
│   │   └── page.tsx
│   └── agenda/
│       └── page.tsx
├── components/
│   ├── ui/           # Shadcn components
│   └── custom/       # Custom components
├── lib/
│   ├── api.ts        # API client
│   └── utils.ts      # Utilities
└── hooks/            # Custom hooks
```

---

## Referências

- [Next.js 16 Documentation](https://nextjs.org/docs)
- [React 19 Documentation](https://react.dev)
- [App Router vs Pages Router](https://nextjs.org/docs/app)

---

**Próxima decisão**: ADR-002 (State Management)
