# Research & Architecture Decisions: Arquitetura Hexagonal com DAG

**Feature**: 001-hexagonal-backend-refactor  
**Created**: 2026-02-28  
**Status**: Complete

## Objetivo

Documentar decisões de arquitetura para refatoração do backend para arquitetura hexagonal (ports e adapters) com dependências em DAG (Directed Acyclic Graph), garantindo que novas features não quebrem funcionalidades existentes.

---

## Decisão 1: Estrutura de Camadas Hexagonal

### Decision
Adotar estrutura de 3 camadas:
1. **Domain** (entities, value objects, ports)
2. **Application** (use cases, services)
3. **Infrastructure** (adapters: HTTP, database, external APIs)

### Rationale
- **Separação clara de responsabilidades**: Domain não depende de nada externo
- **Testabilidade**: Use cases podem ser testados sem infraestrutura real
- **Manutenibilidade**: Mudanças em infraestrutura não afetam regras de negócio
- **Evolução gradual**: Permite refatorar módulo por módulo

### Alternatives Considered

| Alternativa | Por que não escolhida |
|-------------|----------------------|
| **Clean Architecture (4 camadas)** | Muito complexa para o escopo atual. Interface adapters seria over-engineering |
| **Manter estrutura atual (modules/)** | Não garante DAG nem previne acoplamento indesejado |
| **Event-driven architecture** | Prematuro. Sistema atual não demanda assincronicidade complexa |

---

## Decisão 2: DAG (Directed Acyclic Graph) de Dependências

### Decision
Módulos devem seguir hierarquia estrita:
- **Domain** ← **Application** ← **Infrastructure**
- Módulos de domínio NÃO podem depender entre si (independência total)
- Application pode depender apenas de Domain
- Infrastructure pode depender de Application e Domain

Para comunicação entre módulos de domínio:
- Usar **Domain Events** quando necessário
- Criar **Shared Kernel** apenas para entities/ports verdadeiramente compartilhados

### Rationale
- **Prevenção de regressão**: Nova feature em módulo X não quebra módulo Y
- **Clareza de dependências**: Fácil identificar o que pode ser reutilizado
- **Deploy independente**: Módulos podem evoluir separadamente
- **Onboarding**: Novo desenvolvedor entende rapidamente as dependências

### Alternatives Considered

| Alternativa | Por que não escolhida |
|-------------|----------------------|
| **Dependências circulares controladas** | Impossível garantir estabilidade. Sempre leva a acoplamento temporal |
| **Microservícios** | Overkill para sistema atual. Complexidade operacional desnecessária |
| **Module federation (runtime)** | Complexidade técnica sem benefício real para este contexto |

### Implementation Strategy

```
Nível 0 (base): domain/
  └── Sem dependências de outros módulos
  
Nível 1: application/
  └── Depende apenas de domain/
  
Nível 2: infrastructure/
  └── Depende de application/ e domain/
  
Nível 3 (topo): modules/ (legado durante transição)
  └── Será eliminado gradualmente
```

**Regra de importação**: Importar apenas para cima na hierarquia (N → N-1)

---

## Decisão 3: Ports e Adapters para Cada Módulo

### Decision
Cada módulo de negócio terá:
- **Ports**: Interfaces que definem operações (repositórios, serviços externos)
- **Adapters**: Implementações concretas dos ports

Exemplo (módulo Leads):
```typescript
// domain/leads/ports/lead-repository.port.ts
export interface LeadRepositoryPort {
  findById(id: string): Promise<Lead | null>;
  create(lead: Lead): Promise<void>;
  update(lead: Lead): Promise<void>;
}

// infrastructure/database/adapters/lead-repository.adapter.ts
export class PostgresLeadRepository implements LeadRepositoryPort {
  // Implementação com Drizzle
}
```

### Rationale
- **Inversão de dependência**: Domain define interfaces, Infrastructure implementa
- **Testes mockáveis**: Facilita testing de use cases sem DB real
- **Troca de implementação**: Pode mudar de PostgreSQL para outro sem alterar domain

### Alternatives Considered

| Alternativa | Por que não escolhida |
|-------------|----------------------|
| **Active Record (Drizzle direto nos controllers)** | Acopla domain com infrastructure. Dificulta testes e evolução |
| **Repository genérico** | Perde especificidade do domínio. Leva a vazamentos de abstração |
| **Sem ports (concreto direto)** | Impossível mockar em testes. Viola princípio de inversão |

---

## Decisão 4: Estratégia de Refatoração Gradual

### Decision
Refatorar módulo por módulo, mantendo funcionalidade:
1. **Fase 1**: Criar estrutura de camadas (domain/, application/, infrastructure/)
2. **Fase 2**: Refatorar módulo piloto (leads) completamente
3. **Fase 3**: Refatorar módulos restantes (agenda, budget, billing, dashboard, whitelabel)
4. **Fase 4**: Remover estrutura legada (modules/)
5. **Fase 5**: Remover frontend (apps/web)

### Rationale
- **Risco reduzido**: Refatorar tudo de uma vez é arriscado
- **Feedback contínuo**: Cada módulo refatorado já entrega valor
- **Rollback fácil**: Se algo falhar, apenas módulo atual é afetado
- **Aprendizado iterativo**: Ajustes na arquitetura podem ser feitos após módulo piloto

### Alternatives Considered

| Alternativa | Por que não escolhida |
|-------------|----------------------|
| **Big Bang (refatorar tudo de uma vez)** | Alto risco. Impossível fazer rollback. Longo tempo sem entrega |
| **Criar novo repositório** | Perde histórico. Dificulta migração gradual |
| **Manter modules/ indefinidamente** | Cria dívida técnica. Confunde desenvolvedores |

---

## Decisão 5: Remoção do Frontend

### Decision
Remover completamente `apps/web` do repositório:
- Deletar diretório `apps/web/`
- Remover referências em configurações de monorepo
- Atualizar scripts de build para operar apenas com backend
- Manter apenas documentação de referência para futuro frontend

### Rationale
- **Foco no backend**: Esta spec é exclusivamente sobre refatoração do backend
- **Limpeza de código**: Frontend atual não será reutilizado
- **Novo frontend**: Será desenvolvido em spec separada com requisitos atualizados
- **Redução de complexidade**: Monorepo fica mais simples (apenas backend)

### Alternatives Considered

| Alternativa | Por que não escolhida |
|-------------|----------------------|
| **Manter frontend em branch separada** | Complexidade git desnecessária. Código morto não deve ser mantido |
| **Mover frontend para outro repositório** | Overhead de gerenciamento. Frontend atual não tem valor |
| **Refatorar frontend junto** | Fora do escopo. Frontend será feito do zero em spec futura |

---

## Decisão 6: Injeção de Dependência (DI)

### Decision
Usar DI manual (composition root) no entry point:
```typescript
// apps/api/src/index.ts
const leadRepository = new PostgresLeadRepository(db);
const createLeadUseCase = new CreateLeadUseCase(leadRepository);
const leadController = new LeadController(createLeadUseCase);

const app = new Elysia()
  .use(leadController.routes())
  .listen(3000);
```

### Rationale
- **Simplicidade**: Sem necessidade de containers DI complexos
- **Transparência**: Fácil entender dependências olhando o código
- **Controle**: Composição explícita no entry point
- **Adequado para Bun/Elysia**: Framework já é minimalista

### Alternatives Considered

| Alternativa | Por que não escolhida |
|-------------|----------------------|
| **InversifyJS / tsyringe** | Complexidade desnecessária para sistema atual |
| **Service Locator** | Anti-pattern. Esconde dependências reais |
| **DI automático por decorators** | Mágico demais. Dificulta debug e entendimento |

---

## Decisão 7: Estratégia de Testes para Arquitetura Hexagonal

### Decision
Pirâmide de testes adaptada:
- **Unitários**: Entities, value objects, use cases (sem dependências externas)
- **Integração**: Adapters (repositories, HTTP, external APIs)
- **E2E**: API completa (controllers + adapters + database)

Foco inicial: Testes de integração para validar ports/adapters

### Rationale
- **Cobertura adequada**: Cada camada tem tipo de teste apropriado
- **Feedback rápido**: Unitários rodam em ms, E2E validam fluxo completo
- **Constituição**: Alinhado com princípio II (E2E para fluxos críticos)

### Alternatives Considered

| Alternativa | Por que não escolhida |
|-------------|----------------------|
| **Apenas testes E2E** | Lentos. Difícil isolar falhas. Cobertura insuficiente de regras de negócio |
| **Apenas testes unitários** | Não valida integração entre camadas. Falsa sensação de segurança |
| **Testes de contrato (Pact)** | Complexidade desnecessária. Sistema é monolito (não microserviços) |

---

## Decisão 8: Ferramentas de Validação de DAG

### Decision
Validar DAG via:
1. **Convenção de imports**: Documentar regras claramente
2. **Revisão de código**: Reviewers verificam dependências
3. **eslint-plugin-boundaries** (opcional futuro): Validar imports automaticamente

### Rationale
- **Simplicidade inicial**: Começar com convenção + review
- **Evolução**: Ferramentas automáticas podem ser adicionadas se necessário
- **Cultura de time**: Review promove entendimento coletivo da arquitetura

### Alternatives Considered

| Alternativa | Por que não escolhida |
|-------------|----------------------|
| **nx/enforce-module-boundaries** | Complexidade de setup. Overkill para sistema atual |
| **Madge / dependency-cruiser** | Pode ser adicionado depois se necessário |
| **Build tools (webpack, esbuild)** | Não previne dependências indesejadas em runtime |

---

## Best Practices Identificadas

### Para Ports
- Nomear como `XRepositoryPort`, `XServicePort`, `XGatewayPort`
- Manter ports focados (Single Responsibility)
- Usar TypeScript interfaces (não classes abstratas)

### Para Adapters
- Nomear como `PostgresXRepository`, `HttpXService`, `MemoryXCache`
- Um adapter por port (pode ter múltiplas implementações)
- Adapters são detalhes de implementação (não exportar do módulo)

### Para Use Cases
- Nomear como verbos: `CreateLead`, `UpdateEvent`, `CalculateBudget`
- Um use case por classe/arquivo
- Use cases orquestram, não contêm regras de negócio complexas

### Para Entities
- Entities contêm regras de negócio do domínio
- Value objects para valores imutáveis (ex: Email, Money)
- Entities não dependem de nada externo

---

## Riscos Identificados e Mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| **Over-engineering** | Complexidade desnecessária | Seguir YAGNI. Criar ports apenas quando necessário |
| **Refatoração incompleta** | Sistema híbrido confuso | Refatorar módulo piloto completamente antes de prosseguir |
| **Curva de aprendizado** | Time demora para adaptar | Documentar arquitetura. Pair programming na refatoração |
| **Performance** | Múltiplas camadas adicionam overhead | Medir performance. Camadas são abstrações em tempo de compilação |

---

## Referências Consultadas

1. **Hexagonal Architecture** - Alistair Cockburn
   - https://alistair.cockburn.us/hexagonal-architecture/

2. **Domain-Driven Design** - Eric Evans
   - Livro: "Domain-Driven Design: Tackling Complexity in the Heart of Software"

3. **Clean Architecture** - Robert C. Martin
   - Livro: "Clean Architecture: A Craftsman's Guide to Software Structure and Design"

4. **Dependency Rule**
   - Dependências apontam para dentro (domain é o centro)

5. **TypeScript + Elysia Best Practices**
   - Documentação oficial: https://elysiajs.com/
   - Drizzle ORM: https://orm.drizzle.team/

---

## Status das Decisões

| Decisão | Status | Próximo Passo |
|---------|--------|---------------|
| Estrutura de Camadas | ✅ Aprovada | Implementar em data-model.md |
| DAG de Dependências | ✅ Aprovada | Documentar em contracts/ |
| Ports e Adapters | ✅ Aprovada | Criar exemplos em data-model.md |
| Refatoração Gradual | ✅ Aprovada | Detalhar em tasks.md |
| Remoção do Frontend | ✅ Aprovada | Executar em tasks.md |
| Injeção de Dependência | ✅ Aprovada | Implementar em index.ts |
| Estratégia de Testes | ✅ Aprovada | Criar testes em tasks.md |
| Validação de DAG | ✅ Aprovada | Documentar em quickstart.md |

---

**Próxima Fase**: Phase 1 - Design & Contracts
- Criar data-model.md com entities e ports
- Gerar contratos OpenAPI em contracts/
- Atualizar quickstart.md com nova estrutura
