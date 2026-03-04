# Feature Specification: Refatoração e Correção de Bugs com Princípios SOLID

**Feature Branch**: `002-fix-typescript-refactor`
**Created**: 2026-02-28
**Status**: Draft
**Input**: Planejar a refatoração e correção dos bugs de TypeScript restantes, aplicando princípios SOLID e inversão de dependência

## Resumo Executivo

Esta feature tem como objetivo corrigir os erros de TypeScript restantes no projeto e completar a refatoração para arquitetura hexagonal, aplicando rigorosamente os princípios SOLID (Single Responsibility, Open-Closed, Liskov Substitution, Interface Segregation, Dependency Inversion) para garantir código limpo, manutenível e testável.

## User Scenarios & Testing

### User Story 1 - Desenvolvedor consegue compilar o projeto sem erros de TypeScript (Priority: P1)

**Descrição**: Como desenvolvedor backend, quero que o projeto compile sem erros de TypeScript, para que eu possa ter confiança na qualidade do código e evitar bugs em produção.

**Por que esta prioridade**: Erros de TypeScript bloqueiam a entrega e indicam problemas de tipo que podem causar falhas em runtime.

**Teste Independente**: Comando `bun x tsc --noEmit` executa sem erros.

**Cenários de Aceitação**:

1. **Dado** que o projeto tem erros de TypeScript, **Quando** a refatoração é completada, **Então** `bun x tsc --noEmit` retorna 0 erros.

2. **Dado** que há módulos legados e novos, **Quando** a compilação é executada, **Então** todos os módulos (legados e refatorados) compilam sem erros.

3. **Dado** que novos tipos são adicionados, **Quando** o TypeScript verifica os tipos, **Então** não há implicit any ou type mismatches.

---

### User Story 2 - Módulos restantes são refatorados para arquitetura hexagonal (Priority: P2)

**Descrição**: Como arquiteto de software, quero que todos os módulos (Agenda, Budget, Billing, Dashboard, Whitelabel) sigam a arquitetura hexagonal estabelecida no módulo Leads, para manter consistência arquitetural e facilitar a manutenção.

**Por que esta prioridade**: Inconsistência arquitetural aumenta complexidade cognitiva e dificulta onboarding de novos desenvolvedores.

**Teste Independente**: Cada módulo refatorado tem estrutura domain/application/infrastructure separada.

**Cenários de Aceitação**:

1. **Dado** o módulo Agenda legado, **Quando** refatorado, **Então** possui entities em domain/, use cases em application/, adapters em infrastructure/.

2. **Dado** que o módulo Leads foi o piloto, **Quando** os outros módulos são refatorados, **Então** seguem o mesmo padrão estabelecido.

3. **Dado** que há controllers legados em modules/, **Quando** a refatoração completa, **Então** modules/ é removido.

---

### User Story 3 - Princípios SOLID são aplicados em todo o código (Priority: P3)

**Descrição**: Como desenvolvedor sênior, quero que o código siga os princípios SOLID, para garantir que o sistema seja extensível, manutenível e testável a longo prazo.

**Por que esta prioridade**: Violações SOLID levam a código frágil, difícil de testar e modificar.

**Teste Independente**: Code review identifica violações SOLID e nenhuma violação crítica permanece.

**Cenários de Aceitação**:

1. **Dado** um use case, **Quando** analisado, **Então** tem única responsabilidade (SRP).

2. **Dado** um port/interface, **Quando** implementado, **Então** permite extensão sem modificação (OCP).

3. **Dado** um adapter, **Quando** injetado em um use case, **Então** depende de abstração, não de implementação concreta (DIP).

4. **Dado** um port, **Quando** definido, **Então** é específico e coeso, não genérico demais (ISP).

---

### Edge Cases

- **O que fazer com código legado que não pode ser refatorado imediatamente?**: Isolar em diretório separado e criar wrapper adapters para integrar com nova arquitetura.

- **Como lidar com dependências circulares descobertas durante refatoração?**: Refatorar para extrair interfaces comuns ou usar injeção de dependência para quebrar ciclo.

- **O que acontece se um módulo tem acoplamento forte com banco de dados?**: Extrair repository port e criar adapter específico para aquele banco.

- **Como garantir que princípios SOLID não introduzam over-engineering?**: Seguir YAGNI - aplicar SOLID apenas onde há necessidade real de extensão ou teste.

## Requirements

### Functional Requirements

- **FR-001**: Sistema DEVE compilar sem erros de TypeScript (zero erros em `tsc --noEmit`)

- **FR-002**: Sistema DEVE eliminar todos os implicit any types identificados

- **FR-003**: Sistema DEVE corrigir type mismatches entre domain e infrastructure layers

- **FR-004**: Sistema DEVE refatorar módulo Agenda seguindo arquitetura hexagonal (domain/application/infrastructure)

- **FR-005**: Sistema DEVE refatorar módulo Budget seguindo arquitetura hexagonal

- **FR-006**: Sistema DEVE refatorar módulo Billing seguindo arquitetura hexagonal

- **FR-007**: Sistema DEVE refatorar módulo Dashboard seguindo arquitetura hexagonal

- **FR-008**: Sistema DEVE refatorar módulo Whitelabel seguindo arquitetura hexagonal

- **FR-009**: Sistema DEVE remover diretório modules/ após refatoração completa de todos os módulos

- **FR-010**: Sistema DEVE aplicar Dependency Inversion Principle - use cases dependem apenas de ports, não de adapters concretos

- **FR-011**: Sistema DEVE aplicar Single Responsibility Principle - cada classe/função tem uma única razão para mudar

- **FR-012**: Sistema DEVE aplicar Interface Segregation Principle - ports são específicos e coesos por caso de uso

- **FR-013**: Sistema DEVE aplicar Liskov Substitution Principle - adapters podem substituir ports sem quebrar comportamento

- **FR-014**: Sistema DEVE aplicar Open-Closed Principle - extensão via novos adapters sem modificar use cases existentes

- **FR-015**: Sistema DEVE manter todos os endpoints funcionais durante refatoração (zero regressão)

### Key Entities

- **SOLID Principles**: Conjunto de 5 princípios de design orientado a objetos:
  - **SRP (Single Responsibility)**: Uma classe, uma responsabilidade
  - **OCP (Open-Closed)**: Aberto para extensão, fechado para modificação
  - **LSP (Liskov Substitution)**: Subtipos devem ser substituíveis por seus tipos base
  - **ISP (Interface Segregation)**: Interfaces específicas são melhores que genéricas
  - **DIP (Dependency Inversion)**: Dependa de abstrações, não de implementações

- **Dependency Injection (DI)**: Padrão de projeto onde dependências são injetadas externamente, não criadas internamente

- **Composition Root**: Ponto único na aplicação onde objetos são compostos e dependências injetadas

- **Adapter Pattern**: Padrão que converte interface de uma classe em outra interface esperada pelo cliente

## Success Criteria

### Measurable Outcomes

- **SC-001**: Zero erros de TypeScript após refatoração (verificado via `tsc --noEmit`)

- **SC-002**: Zero implicit any types no código (verificado via strict mode do TypeScript)

- **SC-003**: 100% dos módulos refatorados (5/5: Agenda, Budget, Billing, Dashboard, Whitelabel)

- **SC-004**: 100% dos endpoints existentes permanecem funcionais (verificado via testes de integração)

- **SC-005**: Build do backend completa em menos de 30 segundos (mesmo desempenho ou melhor)

- **SC-006**: Zero dependências circulares entre módulos (verificado via análise estática)

- **SC-007**: 100% dos use cases seguem Dependency Inversion Principle (verificado via code review)

- **SC-008**: Cada use case tem no máximo uma responsabilidade (SRP) - verificado via code review

### Assumptions

- A equipe de desenvolvimento tem familiaridade com princípios SOLID e padrões de design

- O módulo Leads já foi refatorado e serve como referência para os demais módulos

- O banco de dados e seu schema permanecem inalterados durante esta refatoração

- Não há necessidade de adicionar novas funcionalidades durante a refatoração

### Dependencies

- **D-001**: Esta refatoração depende do módulo Leads estar funcional (branch `001-hexagonal-backend-refactor`)

- **D-002**: Refatoração dos módulos depende da infraestrutura base (ports, entities base) já existir

- **D-003**: Remoção do diretório modules/ depende de todos os módulos terem sido refatorados

### Constraints

- **C-001**: Refatoração não pode introduzir breaking changes nos contratos de API

- **C-002**: Cada módulo refatorado deve ser testável independentemente

- **C-003**: Código deve permanecer funcional após refatoração de cada módulo (não quebrar produção)

---

## Notas de Contexto Técnico

**Contexto Atual**: 
- Módulo Leads 85% completo com arquitetura hexagonal
- ~71 erros de TypeScript restantes, majoritariamente em módulos legados
- Controllers legados em `modules/` usam abordagem antiga (sem ports/adapters)
- Schema do banco atualizado com campos para módulo Leads

**Principais Problemas a Corrigir**:
1. `db` com implicit any type em controllers legados
2. Type mismatches entre enums do domínio e schema do Drizzle
3. Controllers legados não seguem arquitetura hexagonal
4. Dependências diretas de controllers com repositórios concretos

**Abordagem de Refatoração**:
- Iterativa: refatorar um módulo por vez
- Incremental: manter funcionalidade existente durante refatoração
- Test-driven: garantir testes passam após cada módulo refatorado
