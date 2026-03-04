# Research & Technical Decisions: TDD e Princípios SOLID

**Feature**: 002-fix-typescript-refactor  
**Created**: 2026-02-28  
**Status**: Complete

## Objetivo

Documentar decisões técnicas para refatoração com TDD (Test-Driven Development), aplicando princípios SOLID e garantindo 95%+ de cobertura de testes.

---

## Decisão 1: TDD com Abordagem Red-Green-Refactor

### Decision
Adotar ciclo TDD clássico:
1. **Red**: Escrever teste que falha
2. **Green**: Implementar código mínimo para passar
3. **Refactor**: Melhorar código mantendo testes verdes

### Rationale
- **Qualidade garantida**: Testes escritos antes garantem que código é testável
- **Design melhor**: TDD força design desacoplado desde o início
- **Confiança**: Suite de testes permite refatoração sem medo
- **Documentação viva**: Testes mostram como usar o código

### Alternatives Considered

| Alternativa | Por que não escolhida |
|-------------|----------------------|
| **Testes depois da implementação** | Código tende a ser menos testável, testes são negligenciados |
| **Apenas testes manuais** | Não escalável, propenso a erro humano, lento |
| **100% automation sem TDD** | Perde benefícios de design do TDD |

### Implementation Strategy

```typescript
// 1. RED: Escrever teste primeiro
describe('AgendaEntity', () => {
  it('should create valid agenda event', () => {
    // Teste define comportamento esperado
  });
});

// 2. GREEN: Implementar mínimo para passar
export class AgendaEvent {
  // Implementação simples
}

// 3. REFACTOR: Melhorar código
// Refatorar mantendo testes verdes
```

---

## Decisão 2: Pirâmide de Testes (70-20-10)

### Decision
Distribuir testes por camadas:
- **70% Unitários**: Entities, use cases, value objects
- **20% Integração**: Repositories, controllers, adapters
- **10% E2E**: Fluxos críticos completos

### Rationale
- **Custo-benefício**: Unitários são baratos e rápidos
- **Feedback rápido**: Unitários rodam em segundos
- **Confiança**: E2E valida integração completa
- **Manutenibilidade**: Menos E2E = menos testes frágeis

### Alternatives Considered

| Alternativa | Por que não escolhida |
|-------------|----------------------|
| **Apenas testes unitários** | Não valida integração entre componentes |
| **Muitos testes E2E** | Lentos, frágeis, caros de manter |
| **Pirâmide invertida** | Custo alto de manutenção, feedback lento |

---

## Decisão 3: 95% Coverage Threshold

### Decision
Configurar cobertura mínima de 95%:
- **Lines**: 95%
- **Functions**: 95%
- **Branches**: 95%

### Rationale
- **Qualidade alta**: 95% é padrão para código crítico
- **Viável**: Não é 100% (que tem custo marginal alto)
- **Bun test**: Suporta coverage nativo com baixo overhead

### Alternatives Considered

| Alternativa | Por que não escolhida |
|-------------|----------------------|
| **100% coverage** | Custo marginal alto, diminishing returns |
| **80% coverage** | Muito baixo para código de produção crítico |
| **Sem threshold** | Cobertura tende a cair com tempo |

### Implementation Strategy

```toml
# bunfig.toml
[test]
coverage = true
coverageThreshold = { lines = 95, functions = 95, branches = 95 }
```

---

## Decisão 4: SOLID Principles Aplicação

### Decision
Aplicar cada princípio SOLID:

**SRP (Single Responsibility)**:
- Uma classe, uma responsabilidade
- Use cases orquestram, entities têm regras de negócio

**OCP (Open-Closed)**:
- Ports estáveis, adapters intercambiáveis
- Extensão via novos adapters, não modificação

**LSP (Liskov Substitution)**:
- Adapters implementam ports consistentemente
- Nenhum comportamento surpresa

**ISP (Interface Segregation)**:
- Ports específicos por caso de uso
- Evitar "god interfaces"

**DIP (Dependency Inversion)**:
- Use cases dependem de ports (abstrações)
- Adapters implementam ports (concretos)

### Rationale
- **Manutenibilidade**: Código SOLID é mais fácil de modificar
- **Testabilidade**: Dependências injetadas são mockáveis
- **Extensibilidade**: Novos adapters sem modificar use cases

### Alternatives Considered

| Alternativa | Por que não escolhida |
|-------------|----------------------|
| **SOLID rígido demais** | Over-engineering, complexidade desnecessária |
| **Ignorar SOLID** | Código acoplado, difícil de testar e modificar |
| **Apenas alguns princípios** | Benefícios incompletos, inconsistência |

---

## Decisão 5: Mock Strategy para TDD

### Decision
Usar mocks e stubs estrategicamente:
- **Unit tests**: Mockar ports, testar use cases isoladamente
- **Integration tests**: Usar adapters reais (DB, HTTP)
- **E2E tests**: Sistema completo sem mocks

### Rationale
- **Isolamento**: Unit tests testam lógica, não infraestrutura
- **Velocidade**: Mocks são mais rápidos que DB real
- **Confiança**: Integration tests validam infraestrutura

### Implementation Strategy

```typescript
// Unit test: Mock repository port
const mockRepository = {
  findById: vi.fn().mockResolvedValue(expectedLead),
};
const useCase = new CreateLeadUseCase(mockRepository);

// Integration test: Real repository
const repository = new PostgresLeadRepository(db);
const result = await repository.findById(id);
```

---

## Decisão 6: Test Naming Convention

### Decision
Padrão de nomes de testes:
```typescript
describe('CreateLeadUseCase', () => {
  describe('execute', () => {
    it('should create lead when data is valid', async () => {
      // Test
    });

    it('should throw error when email already exists', async () => {
      // Test
    });
  });
});
```

### Rationale
- **Legibilidade**: Nome conta história do comportamento
- **Debug fácil**: Falha mostra exatamente o que quebrou
- **Documentação**: Nomes explicam intenção do código

---

## Decisão 7: Refatoração Incremental com TDD

### Decision
Refatorar módulo por módulo:
1. Escrever testes para comportamento atual (characterization tests)
2. Refatorar para arquitetura hexagonal
3. Validar testes passam
4. Adicionar novos testes TDD para nova estrutura

### Rationale
- **Segurança**: Characterization tests previnem regressão
- **Progresso visível**: Cada módulo refatorado é vitória
- **Rollback fácil**: Se falhar, apenas módulo atual é afetado

### Alternatives Considered

| Alternativa | Por que não escolhida |
|-------------|----------------------|
| **Big Bang refatoração** | Muito risco, impossível rollback |
| **Refatorar sem testes** | Impossível validar comportamento preservado |
| **Manter código legado** | Dívida técnica continua crescendo |

---

## Best Practices Identificadas

### Para TDD
- Escrever teste mínimo para falhar primeiro
- Implementar mínimo para passar
- Refatorar apenas com testes verdes
- Commitar após cada ciclo Red-Green-Refactor

### Para Testes Unitários
- Um comportamento por teste
- Nomes descritivos (should... when...)
- Mockar dependências externas
- Testar comportamento, não implementação

### Para Testes de Integração
- Usar banco de dados de teste (isolado)
- Limpar dados após cada teste
- Testar cenários reais de uso
- Validar contratos de API

### Para Testes E2E
- Focar em fluxos críticos
- Manter número baixo (10% dos testes)
- Testar jornada completa do usuário
- Automatizar no CI/CD

---

## Riscos Identificados e Mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| **TDD lento no início** | Velocidade inicial menor | Pair programming, curva de aprendizado rápida |
| **95% coverage difícil** | Pressão para atingir | Focar em lógica de negócio, ignorar getters/setters |
| **Mocks desatualizados** | Testes passam mas código falha | Integration tests validam implementação real |
| **Refatoração incompleta** | Sistema híbrido confuso | Refatorar módulo completo antes de próximo |

---

## Status das Decisões

| Decisão | Status | Próximo Passo |
|---------|--------|---------------|
| TDD Red-Green-Refactor | ✅ Aprovada | Implementar em tasks.md |
| Pirâmide de Testes | ✅ Aprovada | Configurar em bunfig.toml |
| 95% Coverage | ✅ Aprovada | Configurar threshold |
| SOLID Principles | ✅ Aprovada | Aplicar em cada módulo |
| Mock Strategy | ✅ Aprovada | Criar mocks reutilizáveis |
| Test Naming | ✅ Aprovada | Seguir padrão em todos testes |
| Refatoração Incremental | ✅ Aprovada | Módulo por módulo |

---

**Próxima Fase**: Phase 1 - Design & Contracts
- Criar data-model.md com entities de cada módulo
- Documentar API contracts existentes
- Atualizar quickstart.md com comandos de teste
