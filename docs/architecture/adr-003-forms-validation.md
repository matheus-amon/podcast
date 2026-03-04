# ADR-003: Forms & Validação - React Hook Form + Zod

**Data**: 2026-03-03  
**Status**: ✅ Aprovado  
**Projeto**: Podcast SaaS Frontend

---

## Contexto

Precisamos de uma solução para formulários que seja performática, type-safe e fácil de usar.

## Decisão

Utilizar **React Hook Form** + **Zod** para validação.

### Por que React Hook Form?

1. **Performance** - Uncontrolled components, menos re-renders
2. **Simples** - API intuitiva
3. **TypeScript** - Inferência automática
4. **Ecossistema** - Integra com Zod, Yup, Joi
5. **Features** - Arrays, nested forms, file uploads

### Por que Zod?

1. **TypeScript first** - Schema = Type
2. **Simples** - API declarativa
3. **Poderoso** - Validações complexas
4. **Tree-shakable** - Bundle menor
5. **Error messages** - Customizáveis

## Implementação

### Schema Definition

```typescript
// schemas/lead.schema.ts
import * as z from 'zod'

export const leadSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  role: z.enum(['GUEST', 'HOST', 'PRODUCER']),
  status: z.enum(['PROSPECT', 'CONTACTED', 'CONFIRMED', 'RECORDED']),
  company: z.string().optional(),
  position: z.string().optional(),
})

export type LeadForm = z.infer<typeof leadSchema>
```

### Form Component

```typescript
// components/lead-form.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { leadSchema, type LeadForm } from '@/schemas/lead.schema'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function LeadForm({ onSubmit }: { onSubmit: (data: LeadForm) => void }) {
  const form = useForm<LeadForm>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      role: 'GUEST',
      status: 'PROSPECT',
      company: '',
      position: '',
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="john@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="GUEST">Guest</SelectItem>
                  <SelectItem value="HOST">Host</SelectItem>
                  <SelectItem value="PRODUCER">Producer</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Save Lead</Button>
      </form>
    </Form>
  )
}
```

### Dialog Integration

```typescript
// components/lead-dialog.tsx
export function CreateLeadDialog() {
  const [open, setOpen] = useState(false)
  const createLead = useCreateLead()
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Lead
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Lead</DialogTitle>
          <DialogDescription>
            Add a new potential guest to your CRM.
          </DialogDescription>
        </DialogHeader>
        <LeadForm
          onSubmit={async (data) => {
            await createLead.mutateAsync(data)
            setOpen(false)
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
```

## Alternativas Consideradas

| Alternativa | Prós | Contras | Por que não |
|-------------|------|---------|-------------|
| Formik | Maduro, features | Mais re-renders, API verbosa | RHF mais performático |
| Controlled (useState) | Simples | Performance ruim, boilerplate | Não escala |
| Yup | Maduro | Menos TypeScript, bundle maior | Zod mais moderno |
| Joi | Poderoso | Não é tree-shakable | Zod melhor DX |

## Validações Comuns

```typescript
// schemas/common.ts
import * as z from 'zod'

// Email
z.string().email('Invalid email')

// Required string
z.string().min(1, 'Required')

// Number range
z.number().min(0).max(100)

// Date
z.date().min(new Date(), 'Date must be in the future')

// Enum
z.enum(['PROSPECT', 'CONTACTED', 'CONFIRMED'])

// Optional
z.string().optional().nullable()

// Array
z.array(z.string()).min(1, 'At least one item required')
```

## Consequências

### Positivas

- ✅ Performance excelente (uncontrolled)
- ✅ Type safety completo
- ✅ Validações declarativas
- ✅ Error messages customizáveis
- ✅ Fácil de testar

### Negativas

- ⚠️ Curva de aprendizado inicial
- ⚠️ Mais código que controlled
- ⚠️ Zod adiciona ~7KB ao bundle

## Padrões

### Form Names

```typescript
// Padrão: [recurso]-form.tsx
lead-form.tsx
episode-form.tsx
budget-form.tsx
invoice-form.tsx
```

### Schema Names

```typescript
// Padrão: [recurso].schema.ts
lead.schema.ts
episode.schema.ts
budget.schema.ts
```

### Error Handling

```typescript
try {
  await mutation.mutateAsync(data)
  toast({ title: 'Success', description: 'Item created' })
} catch (error) {
  if (error instanceof ZodError) {
    // Validation error
    error.errors.forEach((e) => {
      form.setError(e.path[0] as any, { message: e.message })
    })
  } else {
    // API error
    toast({
      variant: 'destructive',
      title: 'Error',
      description: error.message,
    })
  }
}
```

---

## Referências

- [React Hook Form](https://react-hook-form.com)
- [Zod](https://zod.dev)
- [@hookform/resolvers](https://github.com/react-hook-form/resolvers)

---

**Próxima decisão**: ADR-004 (UI Components)
