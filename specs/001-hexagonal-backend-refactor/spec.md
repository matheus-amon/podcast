# Feature Specification: Refatoração para Arquitetura Hexagonal e Remoção do Frontend

**Feature Branch**: `001-hexagonal-backend-refactor`
**Created**: 2026-02-28
**Status**: Draft
**Input**: Refatorar a arquitetura do backend para hexagonal com ports e adapters com DAG para evitar que novas features quebrem o todo; remover completamente o frontend existente e iniciar do zero em outra spec

## Resumo Executivo

Esta feature tem dois objetivos principais:

1. **Refatoração da Arquitetura do Backend**: Migrar a arquitetura atual para uma arquitetura hexagonal (ports e adapters) com dependências em DAG (Directed Acyclic Graph), garantindo que novas funcionalidades possam ser adicionadas sem quebrar funcionalidades existentes.

2. **Remoção do Frontend**: Eliminar completamente o código frontend atual, preparando o terreno para um novo frontend que será desenvolvido em uma spec separada.

## User Scenarios & Testing

### User Story 1 - Desenvolvedor consegue adicionar nova feature sem quebrar features existentes (Priority: P1)

**Descrição**: Como desenvolvedor backend, quero que a arquitetura do sistema siga o princípio de dependências em DAG, de forma que ao adicionar uma nova funcionalidade, eu não precise modificar código de funcionalidades existentes, apenas criar novos módulos que dependem dos existentes.

**Por que esta prioridade**: Esta é a motivação central da refatoração. Sem esta garantia, o sistema se torna frágil e cada nova feature introduz risco de regressão.

**Teste Independente**: Desenvolvedor consegue identificar claramente quais módulos existentes pode reutilizar e criar um novo módulo que os utiliza sem modificar seu código fonte.

**Cenários de Aceitação**:

1. **Dado** que existe um módulo de "Leads" estabelecido, **Quando** um desenvolvedor cria um novo módulo de "Nutrição de Leads", **Então** o novo módulo depende do existente sem modificar seu código.

2. **Dado** que as dependências entre módulos formam um grafo acíclico, **Quando** um desenvolvedor tenta criar dependência circular, **Então** a arquitetura do projeto impede esta configuração.

3. **Dado** um novo caso de uso de negócio, **Quando** o desenvolvedor analisa os ports existentes, **Então** consegue identificar quais interfaces pode usar sem criar acoplamento indesejado.

---

### User Story 2 - Sistema mantém todas as funcionalidades atuais após refatoração (Priority: P2)

**Descrição**: Como stakeholder técnico, quero que todas as funcionalidades do backend continuem operacionais após a refatoração, garantindo que a mudança de arquitetura não introduza regressões funcionais.

**Por que esta prioridade**: A refatoração deve preservar o valor já entregue enquanto melhora a estrutura interna do sistema.

**Teste Independente**: Todos os endpoints de API existentes continuam respondendo com os mesmos contratos e comportamentos após a refatoração.

**Cenários de Aceitação**:

1. **Dado** que o sistema foi refatorado, **Quando** um cliente faz requisição para endpoints existentes, **Então** recebe as mesmas respostas com os mesmos contratos.

2. **Dado** que a arquitetura foi alterada, **Quando** testes de integração são executados, **Então** todos os testes que passavam antes continuam passando.

3. **Dado** que o banco de dados permanece o mesmo, **Quando** operações de CRUD são executadas, **Então** os dados são persistidos e recuperados corretamente.

---

### User Story 3 - Frontend é completamente removido do repositório (Priority: P3)

**Descrição**: Como arquiteto do projeto, quero que todo o código frontend seja removido do repositório atual, limpando o caminho para que um novo frontend seja desenvolvido em uma spec separada com requisitos atualizados.

**Por que esta prioridade**: Esta é uma tarefa de limpeza que prepara o terreno para trabalho futuro, mas não entrega valor direto por si só.

**Teste Independente**: Diretório do frontend não existe mais no repositório e não há referências ao código frontend removido.

**Cenários de Aceitação**:

1. **Dado** o repositório atual com frontend, **Quando** a remoção é executada, **Então** o diretório `apps/web` não existe mais.

2. **Dado** que o frontend foi removido, **Quando** o backend é construído, **Então** o build ocorre sem dependências do frontend.

3. **Dado** a remoção do frontend, **Quando** nova spec de frontend é iniciada, **Então** o time pode começar do zero sem legado.

---

### Edge Cases

- **O que acontece com configurações de build que referenciam o frontend?**: Configurações de monorepo que incluíam o frontend devem ser atualizadas para referenciar apenas o backend.

- **Como lidar com código compartilhado entre frontend e backend?**: Código compartilhado deve ser avaliado: se for útil apenas para frontend, será removido; se for útil para backend, será movido para pacotes do backend.

- **O que acontece com documentação que referencia o frontend?**: Documentação será atualizada para remover referências ao frontend atual e indicar que novo frontend será desenvolvido separadamente.

- **Como garantir que a arquitetura hexagonal não introduza complexidade excessiva?**: A implementação deve seguir o princípio YAGNI (You Ain't Gonna Need It), criando ports e adapters apenas para interfaces realmente necessárias.

## Requirements

### Functional Requirements

- **FR-001**: Sistema DEVE organizar o código backend em camadas distintas: Domain (entities, value objects, ports), Application (use cases, services), Infrastructure (adapters, implementations)

- **FR-002**: Sistema DEVE definir ports (interfaces) para todas as operações de domínio que precisam ser acessadas por casos de uso

- **FR-003**: Sistema DEVE implementar adapters para conectar casos de uso com frameworks externos (banco de dados, APIs externas, mensageria)

- **FR-004**: Dependências entre módulos DEVE seguir grafo acíclico (DAG), onde módulos de nível superior não podem depender de módulos de nível inferior

- **FR-005**: Sistema DEVE preservar todos os endpoints de API existentes com os mesmos contratos após refatoração

- **FR-006**: Sistema DEVE manter todas as operações de banco de dados funcionais (CRUD de leads, agenda, orçamento, dashboard, faturamento, whitelabel)

- **FR-007**: Sistema DEVE remover completamente o diretório `apps/web` e todas as suas dependências

- **FR-008**: Sistema DEVE atualizar configurações de build e scripts para operar apenas com o backend

- **FR-009**: Sistema DEVE documentar a nova arquitetura hexagonal incluindo diagrama de dependências entre módulos

- **FR-010**: Sistema DEVE garantir que testes existentes continuem passando após refatoração

### Key Entities

- **Port (Interface)**: Contrato que define operações que o domínio oferece ou necessita, sem implementação concreta. Exemplos: Repositório de Leads, Serviço de Notificação, Gateway de Pagamento.

- **Adapter (Implementação)**: Implementação concreta de um port que conecta o domínio com infraestrutura externa. Exemplos: Repositório PostgreSQL, Serviço de Email SMTP, API REST.

- **Use Case (Caso de Uso)**: Orquestra o fluxo de uma operação de negócio específica, usando ports para interagir com domínio e infraestrutura.

- **Domain Entity (Entidade de Domínio)**: Objeto de negócio com identidade própria e regras de negócio associadas. Exemplos: Lead, Evento de Agenda, Item de Orçamento.

- **Module (Módulo)**: Unidade de código agrupada por funcionalidade de negócio (ex: módulo de Leads, módulo de Agenda), contendo seus próprios ports, adapters e use cases.

## Success Criteria

### Measurable Outcomes

- **SC-001**: 100% dos endpoints de API existentes continuam funcionais após refatoração (verificado via testes de integração)

- **SC-002**: Zero dependências circulares entre módulos (verificado via análise estática de dependências)

- **SC-003**: Desenvolvedor consegue identificar em menos de 5 minutos quais modules existentes pode reutilizar para uma nova feature (verificado via teste de usabilidade com desenvolvedores)

- **SC-004**: 100% do código frontend removido do repositório (verificado via ausência do diretório `apps/web` e referências em configurações)

- **SC-005**: Build do backend completa em menos de 30 segundos (mesmo tempo ou melhor que antes da refatoração)

- **SC-006**: Documentação da arquitetura hexagonal criada e revisada por pelo menos 2 desenvolvedores do time

- **SC-007**: Todos os testes existentes passam após refatoração (taxa de sucesso de 100% nos testes que existiam antes)

### Assumptions

- A equipe de desenvolvimento tem familiaridade com conceitos de arquitetura hexagonal e DDD

- O banco de dados e seu schema permanecem inalterados durante esta refatoração

- Não há necessidade de manter compatibilidade com o frontend atual durante a remoção

- Nova spec de frontend será iniciada após conclusão desta refatoração

### Dependencies

- **D-001**: Esta refatoração depende do código backend atual estar funcional (branch `main` após merge da `001-fix-god-debug`)

- **D-002**: Futura spec de frontend dependerá dos contracts de API definidos nesta refatoração

- **D-003**: Eventuais testes E2E que envolvam frontend precisarão ser recriados na nova spec de frontend
