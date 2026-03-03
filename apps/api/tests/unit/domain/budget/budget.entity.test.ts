/**
 * Budget Entity Tests
 *
 * Testes TDD para a entity Budget
 */

import { describe, it, expect } from 'bun:test';
import { Budget } from '../../../../src/domain/budget/entities/budget.entity';
import { BudgetType } from '../../../../src/domain/budget/value-objects/budget-type.enum';
import { BudgetStatus } from '../../../../src/domain/budget/value-objects/budget-status.enum';

describe('Budget', () => {
  describe('create', () => {
    it('should create valid budget when data is valid', () => {
      const budget = Budget.create({
        concept: 'Equipment Purchase',
        amount: 1500.00,
        type: BudgetType.EXPENSE,
        category: 'Equipment',
      });

      expect(budget).toBeDefined();
      expect(budget.concept).toBe('Equipment Purchase');
      expect(budget.amount).toBe(1500.00);
      expect(budget.type).toBe(BudgetType.EXPENSE);
      expect(budget.category).toBe('Equipment');
      expect(budget.status).toBe(BudgetStatus.PENDING);
      expect(budget.isPending()).toBe(true);
    });

    it('should create budget with custom status', () => {
      const budget = Budget.create({
        concept: 'Sponsored Content',
        amount: 2000.00,
        type: BudgetType.INCOME,
        category: 'Revenue',
        status: BudgetStatus.APPROVED,
      });

      expect(budget.status).toBe(BudgetStatus.APPROVED);
      expect(budget.isApproved()).toBe(true);
    });

    it('should create budget with custom date', () => {
      const customDate = new Date('2026-03-15');
      const budget = Budget.create({
        concept: 'Monthly Expense',
        amount: 500.00,
        type: BudgetType.EXPENSE,
        category: 'Operations',
        date: customDate,
      });

      expect(budget.date).toBe(customDate);
    });

    it('should create budget with responsible', () => {
      const budget = Budget.create({
        concept: 'Marketing Campaign',
        amount: 3000.00,
        type: BudgetType.EXPENSE,
        category: 'Marketing',
        responsible: 'john.doe@example.com',
      });

      expect(budget.responsible).toBe('john.doe@example.com');
    });

    it('should create budget connected to episode', () => {
      const budget = Budget.create({
        concept: 'Episode Recording',
        amount: 800.00,
        type: BudgetType.EXPENSE,
        category: 'Production',
        connectedEpisodeId: 42,
      });

      expect(budget.connectedEpisodeId).toBe(42);
    });

    it('should trim concept whitespace', () => {
      const budget = Budget.create({
        concept: '  Trimmed Concept  ',
        amount: 100.00,
        type: BudgetType.EXPENSE,
        category: 'Test',
      });

      expect(budget.concept).toBe('Trimmed Concept');
    });

    it('should trim category whitespace', () => {
      const budget = Budget.create({
        concept: 'Test',
        amount: 100.00,
        type: BudgetType.EXPENSE,
        category: '  Trimmed Category  ',
      });

      expect(budget.category).toBe('Trimmed Category');
    });

    it('should round amount to 2 decimal places', () => {
      const budget = Budget.create({
        concept: 'Test',
        amount: 100.999,
        type: BudgetType.EXPENSE,
        category: 'Test',
      });

      expect(budget.amount).toBe(101.00);
    });

    it('should throw error when concept is empty', () => {
      expect(() => {
        Budget.create({
          concept: '',
          amount: 100.00,
          type: BudgetType.EXPENSE,
          category: 'Test',
        });
      }).toThrow('Concept is required');
    });

    it('should throw error when concept is only whitespace', () => {
      expect(() => {
        Budget.create({
          concept: '   ',
          amount: 100.00,
          type: BudgetType.EXPENSE,
          category: 'Test',
        });
      }).toThrow('Concept is required');
    });

    it('should throw error when amount is zero', () => {
      expect(() => {
        Budget.create({
          concept: 'Test',
          amount: 0,
          type: BudgetType.EXPENSE,
          category: 'Test',
        });
      }).toThrow('Amount must be greater than zero');
    });

    it('should throw error when amount is negative', () => {
      expect(() => {
        Budget.create({
          concept: 'Test',
          amount: -100,
          type: BudgetType.EXPENSE,
          category: 'Test',
        });
      }).toThrow('Amount must be greater than zero');
    });

    it('should throw error when category is empty', () => {
      expect(() => {
        Budget.create({
          concept: 'Test',
          amount: 100.00,
          type: BudgetType.EXPENSE,
          category: '',
        });
      }).toThrow('Category is required');
    });

    it('should generate unique id for each budget', () => {
      const budget1 = Budget.create({
        concept: 'Budget 1',
        amount: 100.00,
        type: BudgetType.EXPENSE,
        category: 'Test',
      });

      const budget2 = Budget.create({
        concept: 'Budget 2',
        amount: 200.00,
        type: BudgetType.EXPENSE,
        category: 'Test',
      });

      expect(budget1.id).not.toBe(budget2.id);
    });
  });

  describe('fromProps', () => {
    it('should create budget from existing props', () => {
      const now = new Date();
      const props = {
        id: 'test-id',
        concept: 'Existing Budget',
        amount: 500.00,
        type: BudgetType.INCOME as BudgetType,
        category: 'Revenue',
        date: now,
        status: BudgetStatus.PAID as BudgetStatus,
        createdAt: now,
        updatedAt: now,
      };

      const budget = Budget.fromProps(props);

      expect(budget.id).toBe('test-id');
      expect(budget.concept).toBe('Existing Budget');
      expect(budget.amount).toBe(500.00);
      expect(budget.type).toBe(BudgetType.INCOME);
      expect(budget.status).toBe(BudgetStatus.PAID);
    });
  });

  describe('updateConcept', () => {
    it('should update concept', () => {
      const budget = Budget.create({
        concept: 'Old Concept',
        amount: 100.00,
        type: BudgetType.EXPENSE,
        category: 'Test',
      });

      budget.updateConcept('New Concept');

      expect(budget.concept).toBe('New Concept');
    });

    it('should update updatedAt timestamp', () => {
      const budget = Budget.create({
        concept: 'Concept',
        amount: 100.00,
        type: BudgetType.EXPENSE,
        category: 'Test',
      });

      const beforeUpdate = budget.updatedAt;

      // Aguardar 1ms para garantir diferença
      const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

      return wait(1).then(() => {
        budget.updateConcept('New Concept');
        expect(budget.updatedAt.getTime()).toBeGreaterThan(beforeUpdate.getTime());
      });
    });

    it('should throw error when concept is empty', () => {
      const budget = Budget.create({
        concept: 'Concept',
        amount: 100.00,
        type: BudgetType.EXPENSE,
        category: 'Test',
      });

      expect(() => {
        budget.updateConcept('');
      }).toThrow('Concept is required');
    });
  });

  describe('updateAmount', () => {
    it('should update amount', () => {
      const budget = Budget.create({
        concept: 'Test',
        amount: 100.00,
        type: BudgetType.EXPENSE,
        category: 'Test',
      });

      budget.updateAmount(250.50);

      expect(budget.amount).toBe(250.50);
    });

    it('should round amount to 2 decimal places', () => {
      const budget = Budget.create({
        concept: 'Test',
        amount: 100.00,
        type: BudgetType.EXPENSE,
        category: 'Test',
      });

      budget.updateAmount(100.999);

      expect(budget.amount).toBe(101.00);
    });

    it('should throw error when amount is zero', () => {
      const budget = Budget.create({
        concept: 'Test',
        amount: 100.00,
        type: BudgetType.EXPENSE,
        category: 'Test',
      });

      expect(() => {
        budget.updateAmount(0);
      }).toThrow('Amount must be greater than zero');
    });

    it('should throw error when amount is negative', () => {
      const budget = Budget.create({
        concept: 'Test',
        amount: 100.00,
        type: BudgetType.EXPENSE,
        category: 'Test',
      });

      expect(() => {
        budget.updateAmount(-50);
      }).toThrow('Amount must be greater than zero');
    });
  });

  describe('updateCategory', () => {
    it('should update category', () => {
      const budget = Budget.create({
        concept: 'Test',
        amount: 100.00,
        type: BudgetType.EXPENSE,
        category: 'Old Category',
      });

      budget.updateCategory('New Category');

      expect(budget.category).toBe('New Category');
    });

    it('should throw error when category is empty', () => {
      const budget = Budget.create({
        concept: 'Test',
        amount: 100.00,
        type: BudgetType.EXPENSE,
        category: 'Category',
      });

      expect(() => {
        budget.updateCategory('');
      }).toThrow('Category is required');
    });
  });

  describe('updateResponsible', () => {
    it('should update responsible', () => {
      const budget = Budget.create({
        concept: 'Test',
        amount: 100.00,
        type: BudgetType.EXPENSE,
        category: 'Test',
      });

      budget.updateResponsible('jane.doe@example.com');

      expect(budget.responsible).toBe('jane.doe@example.com');
    });

    it('should clear responsible when empty string', () => {
      const budget = Budget.create({
        concept: 'Test',
        amount: 100.00,
        type: BudgetType.EXPENSE,
        category: 'Test',
        responsible: 'old@example.com',
      });

      budget.updateResponsible('');

      expect(budget.responsible).toBe('');
    });
  });

  describe('updateDate', () => {
    it('should update date', () => {
      const budget = Budget.create({
        concept: 'Test',
        amount: 100.00,
        type: BudgetType.EXPENSE,
        category: 'Test',
      });

      const newDate = new Date('2026-04-01');
      budget.updateDate(newDate);

      expect(budget.date).toBe(newDate);
    });
  });

  describe('connectToEpisode', () => {
    it('should connect budget to episode', () => {
      const budget = Budget.create({
        concept: 'Episode Expense',
        amount: 500.00,
        type: BudgetType.EXPENSE,
        category: 'Production',
      });

      budget.connectToEpisode(123);

      expect(budget.connectedEpisodeId).toBe(123);
    });
  });

  describe('approve', () => {
    it('should change status to APPROVED', () => {
      const budget = Budget.create({
        concept: 'Test',
        amount: 100.00,
        type: BudgetType.EXPENSE,
        category: 'Test',
      });

      expect(budget.status).toBe(BudgetStatus.PENDING);

      budget.approve();

      expect(budget.status).toBe(BudgetStatus.APPROVED);
      expect(budget.isApproved()).toBe(true);
    });

    it('should throw error when budget is already paid', () => {
      const budget = Budget.fromProps({
        id: 'test-id',
        concept: 'Test',
        amount: 100.00,
        type: BudgetType.EXPENSE,
        category: 'Test',
        date: new Date(),
        status: BudgetStatus.PAID,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(() => {
        budget.approve();
      }).toThrow('Cannot approve a budget that is already paid');
    });
  });

  describe('markAsPaid', () => {
    it('should change status to PAID', () => {
      const budget = Budget.create({
        concept: 'Test',
        amount: 100.00,
        type: BudgetType.EXPENSE,
        category: 'Test',
      });

      budget.markAsPaid();

      expect(budget.status).toBe(BudgetStatus.PAID);
      expect(budget.isPaid()).toBe(true);
    });
  });

  describe('markAsPending', () => {
    it('should change status to PENDING', () => {
      const budget = Budget.fromProps({
        id: 'test-id',
        concept: 'Test',
        amount: 100.00,
        type: BudgetType.EXPENSE,
        category: 'Test',
        date: new Date(),
        status: BudgetStatus.APPROVED,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      budget.markAsPending();

      expect(budget.status).toBe(BudgetStatus.PENDING);
      expect(budget.isPending()).toBe(true);
    });

    it('should throw error when budget is paid', () => {
      const budget = Budget.fromProps({
        id: 'test-id',
        concept: 'Test',
        amount: 100.00,
        type: BudgetType.EXPENSE,
        category: 'Test',
        date: new Date(),
        status: BudgetStatus.PAID,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(() => {
        budget.markAsPending();
      }).toThrow('Cannot change status of a paid budget');
    });
  });

  describe('isIncome', () => {
    it('should return true when budget is income', () => {
      const budget = Budget.create({
        concept: 'Revenue',
        amount: 1000.00,
        type: BudgetType.INCOME,
        category: 'Sales',
      });

      expect(budget.isIncome()).toBe(true);
      expect(budget.isExpense()).toBe(false);
    });
  });

  describe('isExpense', () => {
    it('should return true when budget is expense', () => {
      const budget = Budget.create({
        concept: 'Expense',
        amount: 500.00,
        type: BudgetType.EXPENSE,
        category: 'Operations',
      });

      expect(budget.isExpense()).toBe(true);
      expect(budget.isIncome()).toBe(false);
    });
  });

  describe('isPaid', () => {
    it('should return true when budget is paid', () => {
      const budget = Budget.fromProps({
        id: 'test-id',
        concept: 'Test',
        amount: 100.00,
        type: BudgetType.EXPENSE,
        category: 'Test',
        date: new Date(),
        status: BudgetStatus.PAID,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(budget.isPaid()).toBe(true);
    });

    it('should return false when budget is not paid', () => {
      const budget = Budget.create({
        concept: 'Test',
        amount: 100.00,
        type: BudgetType.EXPENSE,
        category: 'Test',
      });

      expect(budget.isPaid()).toBe(false);
    });
  });

  describe('isApproved', () => {
    it('should return true when budget is approved', () => {
      const budget = Budget.create({
        concept: 'Test',
        amount: 100.00,
        type: BudgetType.EXPENSE,
        category: 'Test',
        status: BudgetStatus.APPROVED,
      });

      expect(budget.isApproved()).toBe(true);
    });

    it('should return false when budget is not approved', () => {
      const budget = Budget.create({
        concept: 'Test',
        amount: 100.00,
        type: BudgetType.EXPENSE,
        category: 'Test',
      });

      expect(budget.isApproved()).toBe(false);
    });
  });

  describe('isPending', () => {
    it('should return true when budget is PENDING', () => {
      const budget = Budget.create({
        concept: 'Test',
        amount: 100.00,
        type: BudgetType.EXPENSE,
        category: 'Test',
        status: BudgetStatus.PENDING,
      });

      expect(budget.isPending()).toBe(true);
    });

    it('should return true when budget is PLANNED', () => {
      const budget = Budget.fromProps({
        id: 'test-id',
        concept: 'Test',
        amount: 100.00,
        type: BudgetType.EXPENSE,
        category: 'Test',
        date: new Date(),
        status: BudgetStatus.PLANNED,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(budget.isPending()).toBe(true);
    });

    it('should return false when budget is paid', () => {
      const budget = Budget.fromProps({
        id: 'test-id',
        concept: 'Test',
        amount: 100.00,
        type: BudgetType.EXPENSE,
        category: 'Test',
        date: new Date(),
        status: BudgetStatus.PAID,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(budget.isPending()).toBe(false);
    });
  });

  describe('isPlanned', () => {
    it('should return true when budget is PLANNED', () => {
      const budget = Budget.fromProps({
        id: 'test-id',
        concept: 'Test',
        amount: 100.00,
        type: BudgetType.EXPENSE,
        category: 'Test',
        date: new Date(),
        status: BudgetStatus.PLANNED,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(budget.isPlanned()).toBe(true);
    });

    it('should return false when budget is not PLANNED', () => {
      const budget = Budget.create({
        concept: 'Test',
        amount: 100.00,
        type: BudgetType.EXPENSE,
        category: 'Test',
        status: BudgetStatus.PENDING,
      });

      expect(budget.isPlanned()).toBe(false);
    });
  });

  describe('formatAmount', () => {
    it('should format amount as Brazilian Real', () => {
      const budget = Budget.create({
        concept: 'Test',
        amount: 1250.50,
        type: BudgetType.EXPENSE,
        category: 'Test',
      });

      const formatted = budget.formatAmount('pt-BR');
      // O formato pode variar dependendo da locale, verificamos se contém o valor esperado
      expect(formatted).toContain('1.250,50');
      expect(formatted).toContain('R$');
    });

    it('should format amount with Money VO currency', () => {
      const budget = Budget.create({
        concept: 'Test',
        amount: 1250.50,
        type: BudgetType.EXPENSE,
        category: 'Test',
      });

      const formatted = budget.formatAmount('en-US');
      // Money VO usa BRL por padrão, então o formato será em Real
      expect(formatted).toBeDefined();
      expect(formatted.length).toBeGreaterThan(0);
    });
  });

  describe('toObject', () => {
    it('should return a copy of props', () => {
      const budget = Budget.create({
        concept: 'Test',
        amount: 100.00,
        type: BudgetType.EXPENSE,
        category: 'Test',
      });

      const obj = budget.toObject();

      expect(obj).toBeDefined();
      expect(obj.id).toBe(budget.id);
      expect(obj.concept).toBe(budget.concept);
      expect(obj.amount).toBe(budget.amount);
      expect(obj).not.toBe((budget as any).props);
    });
  });
});
