import { describe, it, expect, beforeEach } from 'bun:test';
import { ApplyBudgetTemplateUseCase } from '../src/application/budget/use-cases/apply-budget-template.use-case';
import { BudgetTemplate } from '../src/domain/budget/entities/budget-template.entity';
import { BudgetType } from '../src/domain/budget/value-objects/budget-type.enum';
import type { IBudgetRepository, BudgetFilters, PaginatedBudgetResult, BudgetSummary } from '../src/domain/budget/ports/budget-repository.port';
import { Budget } from '../src/domain/budget/entities/budget.entity';
import { BudgetStatus } from '../src/domain/budget/value-objects/budget-status.enum';

class MockBudgetRepository implements IBudgetRepository {
  public templates: BudgetTemplate[] = [];
  public budgets: Budget[] = [];
  public callCount = 0;

  async findById(id: string): Promise<Budget | null> { return null; }
  async findAll(filters?: BudgetFilters): Promise<Budget[]> { return []; }
  async findPaginated(filters?: BudgetFilters & { page?: number; limit?: number; }): Promise<PaginatedBudgetResult> {
    return { data: [], total: 0, page: 1, limit: 10, totalPages: 0 };
  }

  async create(budget: Budget): Promise<Budget> {
    // Simular delay de banco de dados por query
    await new Promise(resolve => setTimeout(resolve, 5));
    this.budgets.push(budget);
    this.callCount++;
    return budget;
  }

  // Otimização implementada
  async createMany(budgets: Budget[]): Promise<Budget[]> {
    await new Promise(resolve => setTimeout(resolve, 10)); // Overhead do lote + envio
    this.budgets.push(...budgets);
    this.callCount++;
    return budgets;
  }

  async update(budget: Budget): Promise<Budget> { return budget; }
  async delete(id: string): Promise<void> {}
  async findByType(type: BudgetType): Promise<Budget[]> { return []; }
  async findByStatus(status: BudgetStatus): Promise<Budget[]> { return []; }
  async findByCategory(category: string): Promise<Budget[]> { return []; }
  async findByEpisodeId(episodeId: number): Promise<Budget[]> { return []; }
  async findSummary(filters?: BudgetFilters): Promise<BudgetSummary> { return { totalIncome: 0, totalExpense: 0, balance: 0, count: 0 }; }

  async findTemplateById(id: string): Promise<BudgetTemplate | null> {
    return this.templates.find(t => t.id === id) || null;
  }
  async findAllTemplates(): Promise<BudgetTemplate[]> { return this.templates; }
  async createTemplate(template: BudgetTemplate): Promise<BudgetTemplate> {
    this.templates.push(template);
    return template;
  }
}

describe('ApplyBudgetTemplateUseCase Benchmark - Mock DB', () => {
  let repository: MockBudgetRepository;
  let useCase: ApplyBudgetTemplateUseCase;
  let testTemplateId: string;

  beforeEach(async () => {
    repository = new MockBudgetRepository();
    useCase = new ApplyBudgetTemplateUseCase(repository);

    // Criar um template com 100 itens para testar o N+1
    const items = Array.from({ length: 100 }).map((_, i) => ({
      concept: `Item de Teste ${i}`,
      amount: 10 + i,
      type: i % 2 === 0 ? BudgetType.INCOME : BudgetType.EXPENSE,
      category: 'Categoria Teste',
    }));

    const templateEntity = BudgetTemplate.create({
      name: 'Template de Benchmark',
      items,
    });

    const createdTemplate = await repository.createTemplate(templateEntity);
    testTemplateId = createdTemplate.id;
  });

  it('deve medir a performance do batch insert otimizado', async () => {
    console.log('--- Iniciando Benchmark (Mock com Batch Insert Otimizado) ---');

    // Medir o tempo de execução do ApplyBudgetTemplateUseCase
    const startTime = performance.now();

    const result = await useCase.execute({
      templateId: testTemplateId,
    });

    const endTime = performance.now();
    const durationMs = endTime - startTime;

    console.log(`Tempo de execução (100 itens otimizado): ${durationMs.toFixed(2)} ms`);
    console.log(`Número de chamadas ao BD (create/createMany): ${repository.callCount}`);

    expect(result.appliedCount).toBe(100);
    expect(result.budgets.length).toBe(100);
    // 1 chamada para o findTemplateById (no beforeEach/setup ou execute) + 1 para o createMany = 1 chamada nova no useCase execute
    expect(repository.callCount).toBe(1); // 1 chamada ao BD!
  }, 10000);
});
