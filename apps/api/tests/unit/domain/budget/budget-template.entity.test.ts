/**
 * BudgetTemplate Entity Tests
 *
 * Testes TDD para a entity BudgetTemplate
 */

import { describe, it, expect } from 'bun:test';
import { BudgetTemplate } from '../../../../src/domain/budget/entities/budget-template.entity';
import { BudgetType } from '../../../../src/domain/budget/value-objects/budget-type.enum';

describe('BudgetTemplate', () => {
  describe('create', () => {
    it('should create valid template when data is valid', () => {
      const template = BudgetTemplate.create({
        name: 'Standard Episode Costs',
        items: [
          {
            concept: 'Equipment Rental',
            amount: 500.00,
            type: BudgetType.EXPENSE,
            category: 'Equipment',
          },
          {
            concept: 'Studio Fee',
            amount: 300.00,
            type: BudgetType.EXPENSE,
            category: 'Production',
          },
        ],
      });

      expect(template.items).toHaveLength(2);
      expect(template.itemCount).toBe(2);
      expect(template.items[0]).toBeDefined();
      expect(template.items[0]?.concept).toBe('Equipment Rental');
    });

    it('should create template with income items', () => {
      const template = BudgetTemplate.create({
        name: 'Sponsorship Package',
        items: [
          {
            concept: 'Main Sponsor',
            amount: 2000.00,
            type: BudgetType.INCOME,
            category: 'Sponsorship',
          },
        ],
      });

      expect(template.items[0]).toBeDefined();
      expect(template.items[0]?.type).toBe(BudgetType.INCOME);
    });

    it('should trim name whitespace', () => {
      const template = BudgetTemplate.create({
        name: '  Trimmed Name  ',
        items: [
          {
            concept: 'Test',
            amount: 100.00,
            type: BudgetType.EXPENSE,
            category: 'Test',
          },
        ],
      });

      expect(template.name).toBe('Trimmed Name');
    });

    it('should trim item concept whitespace', () => {
      const template = BudgetTemplate.create({
        name: 'Test Template',
        items: [
          {
            concept: '  Trimmed Concept  ',
            amount: 100.00,
            type: BudgetType.EXPENSE,
            category: 'Test',
          },
        ],
      });

      expect(template.items[0]).toBeDefined();
      expect(template.items[0]?.concept).toBe('Trimmed Concept');
    });

    it('should trim item category whitespace', () => {
      const template = BudgetTemplate.create({
        name: 'Test Template',
        items: [
          {
            concept: 'Test',
            amount: 100.00,
            type: BudgetType.EXPENSE,
            category: '  Trimmed Category  ',
          },
        ],
      });

      expect(template.items[0]).toBeDefined();
      expect(template.items[0]?.category).toBe('Trimmed Category');
    });

    it('should round item amounts to 2 decimal places', () => {
      const template = BudgetTemplate.create({
        name: 'Test Template',
        items: [
          {
            concept: 'Test',
            amount: 100.999,
            type: BudgetType.EXPENSE,
            category: 'Test',
          },
        ],
      });

      expect(template.items[0]).toBeDefined();
      expect(template.items[0]?.amount).toBe(101.00);
    });

    it('should throw error when name is empty', () => {
      expect(() => {
        BudgetTemplate.create({
          name: '',
          items: [
            {
              concept: 'Test',
              amount: 100.00,
              type: BudgetType.EXPENSE,
              category: 'Test',
            },
          ],
        });
      }).toThrow('Template name is required');
    });

    it('should throw error when name is only whitespace', () => {
      expect(() => {
        BudgetTemplate.create({
          name: '   ',
          items: [
            {
              concept: 'Test',
              amount: 100.00,
              type: BudgetType.EXPENSE,
              category: 'Test',
            },
          ],
        });
      }).toThrow('Template name is required');
    });

    it('should throw error when items array is empty', () => {
      expect(() => {
        BudgetTemplate.create({
          name: 'Empty Template',
          items: [],
        });
      }).toThrow('Template must have at least one item');
    });

    it('should throw error when item concept is empty', () => {
      expect(() => {
        BudgetTemplate.create({
          name: 'Test Template',
          items: [
            {
              concept: '',
              amount: 100.00,
              type: BudgetType.EXPENSE,
              category: 'Test',
            },
          ],
        });
      }).toThrow('Item 1: concept is required');
    });

    it('should throw error when item amount is zero', () => {
      expect(() => {
        BudgetTemplate.create({
          name: 'Test Template',
          items: [
            {
              concept: 'Test',
              amount: 0,
              type: BudgetType.EXPENSE,
              category: 'Test',
            },
          ],
        });
      }).toThrow('Item 1: amount must be greater than zero');
    });

    it('should throw error when item amount is negative', () => {
      expect(() => {
        BudgetTemplate.create({
          name: 'Test Template',
          items: [
            {
              concept: 'Test',
              amount: -100,
              type: BudgetType.EXPENSE,
              category: 'Test',
            },
          ],
        });
      }).toThrow('Item 1: amount must be greater than zero');
    });

    it('should throw error when item category is empty', () => {
      expect(() => {
        BudgetTemplate.create({
          name: 'Test Template',
          items: [
            {
              concept: 'Test',
              amount: 100.00,
              type: BudgetType.EXPENSE,
              category: '',
            },
          ],
        });
      }).toThrow('Item 1: category is required');
    });

    it('should generate unique id for each template', () => {
      const template1 = BudgetTemplate.create({
        name: 'Template 1',
        items: [
          {
            concept: 'Item',
            amount: 100.00,
            type: BudgetType.EXPENSE,
            category: 'Test',
          },
        ],
      });

      const template2 = BudgetTemplate.create({
        name: 'Template 2',
        items: [
          {
            concept: 'Item',
            amount: 200.00,
            type: BudgetType.EXPENSE,
            category: 'Test',
          },
        ],
      });

      expect(template1.id).not.toBe(template2.id);
    });
  });

  describe('fromProps', () => {
    it('should create template from existing props', () => {
      const now = new Date();
      const props = {
        id: 'test-id',
        name: 'Existing Template',
        items: [
          {
            concept: 'Item',
            amount: 500.00,
            type: BudgetType.EXPENSE as BudgetType,
            category: 'Test',
          },
        ],
        createdAt: now,
        updatedAt: now,
      };

      const template = BudgetTemplate.fromProps(props);

      expect(template.id).toBe('test-id');
      expect(template.name).toBe('Existing Template');
      expect(template.items).toHaveLength(1);
    });
  });

  describe('getTotalIncome', () => {
    it('should return total of income items', () => {
      const template = BudgetTemplate.create({
        name: 'Test Template',
        items: [
          {
            concept: 'Sponsor 1',
            amount: 1000.00,
            type: BudgetType.INCOME,
            category: 'Sponsorship',
          },
          {
            concept: 'Sponsor 2',
            amount: 500.00,
            type: BudgetType.INCOME,
            category: 'Sponsorship',
          },
          {
            concept: 'Expense',
            amount: 300.00,
            type: BudgetType.EXPENSE,
            category: 'Production',
          },
        ],
      });

      expect(template.getTotalIncome()).toBe(1500.00);
    });

    it('should return 0 when no income items', () => {
      const template = BudgetTemplate.create({
        name: 'Test Template',
        items: [
          {
            concept: 'Expense',
            amount: 300.00,
            type: BudgetType.EXPENSE,
            category: 'Production',
          },
        ],
      });

      expect(template.getTotalIncome()).toBe(0);
    });
  });

  describe('getTotalExpense', () => {
    it('should return total of expense items', () => {
      const template = BudgetTemplate.create({
        name: 'Test Template',
        items: [
          {
            concept: 'Income',
            amount: 1000.00,
            type: BudgetType.INCOME,
            category: 'Sponsorship',
          },
          {
            concept: 'Expense 1',
            amount: 300.00,
            type: BudgetType.EXPENSE,
            category: 'Production',
          },
          {
            concept: 'Expense 2',
            amount: 200.00,
            type: BudgetType.EXPENSE,
            category: 'Equipment',
          },
        ],
      });

      expect(template.getTotalExpense()).toBe(500.00);
    });

    it('should return 0 when no expense items', () => {
      const template = BudgetTemplate.create({
        name: 'Test Template',
        items: [
          {
            concept: 'Income',
            amount: 1000.00,
            type: BudgetType.INCOME,
            category: 'Sponsorship',
          },
        ],
      });

      expect(template.getTotalExpense()).toBe(0);
    });
  });

  describe('getBalance', () => {
    it('should return income minus expense', () => {
      const template = BudgetTemplate.create({
        name: 'Test Template',
        items: [
          {
            concept: 'Income',
            amount: 1000.00,
            type: BudgetType.INCOME,
            category: 'Sponsorship',
          },
          {
            concept: 'Expense',
            amount: 600.00,
            type: BudgetType.EXPENSE,
            category: 'Production',
          },
        ],
      });

      expect(template.getBalance()).toBe(400.00);
    });

    it('should return negative when expenses exceed income', () => {
      const template = BudgetTemplate.create({
        name: 'Test Template',
        items: [
          {
            concept: 'Income',
            amount: 500.00,
            type: BudgetType.INCOME,
            category: 'Sponsorship',
          },
          {
            concept: 'Expense',
            amount: 800.00,
            type: BudgetType.EXPENSE,
            category: 'Production',
          },
        ],
      });

      expect(template.getBalance()).toBe(-300.00);
    });
  });

  describe('addItem', () => {
    it('should add item to template', () => {
      const template = BudgetTemplate.create({
        name: 'Test Template',
        items: [
          {
            concept: 'Item 1',
            amount: 100.00,
            type: BudgetType.EXPENSE,
            category: 'Test',
          },
        ],
      });

      template.addItem({
        concept: 'Item 2',
        amount: 200.00,
        type: BudgetType.EXPENSE,
        category: 'Test',
      });

      expect(template.items).toHaveLength(2);
      expect(template.items[1]).toBeDefined();
      expect(template.items[1]?.concept).toBe('Item 2');
    });

    it('should update updatedAt timestamp', () => {
      const template = BudgetTemplate.create({
        name: 'Test Template',
        items: [
          {
            concept: 'Item 1',
            amount: 100.00,
            type: BudgetType.EXPENSE,
            category: 'Test',
          },
        ],
      });

      const beforeAdd = template.updatedAt;

      const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

      return wait(1).then(() => {
        template.addItem({
          concept: 'Item 2',
          amount: 200.00,
          type: BudgetType.EXPENSE,
          category: 'Test',
        });
        expect(template.updatedAt.getTime()).toBeGreaterThan(beforeAdd.getTime());
      });
    });

    it('should throw error when concept is empty', () => {
      const template = BudgetTemplate.create({
        name: 'Test Template',
        items: [
          {
            concept: 'Item',
            amount: 100.00,
            type: BudgetType.EXPENSE,
            category: 'Test',
          },
        ],
      });

      expect(() => {
        template.addItem({
          concept: '',
          amount: 200.00,
          type: BudgetType.EXPENSE,
          category: 'Test',
        });
      }).toThrow('Concept is required');
    });

    it('should throw error when amount is zero', () => {
      const template = BudgetTemplate.create({
        name: 'Test Template',
        items: [
          {
            concept: 'Item',
            amount: 100.00,
            type: BudgetType.EXPENSE,
            category: 'Test',
          },
        ],
      });

      expect(() => {
        template.addItem({
          concept: 'New Item',
          amount: 0,
          type: BudgetType.EXPENSE,
          category: 'Test',
        });
      }).toThrow('Amount must be greater than zero');
    });

    it('should throw error when category is empty', () => {
      const template = BudgetTemplate.create({
        name: 'Test Template',
        items: [
          {
            concept: 'Item',
            amount: 100.00,
            type: BudgetType.EXPENSE,
            category: 'Test',
          },
        ],
      });

      expect(() => {
        template.addItem({
          concept: 'New Item',
          amount: 200.00,
          type: BudgetType.EXPENSE,
          category: '',
        });
      }).toThrow('Category is required');
    });
  });

  describe('removeItem', () => {
    it('should remove item by index', () => {
      const template = BudgetTemplate.create({
        name: 'Test Template',
        items: [
          {
            concept: 'Item 1',
            amount: 100.00,
            type: BudgetType.EXPENSE,
            category: 'Test',
          },
          {
            concept: 'Item 2',
            amount: 200.00,
            type: BudgetType.EXPENSE,
            category: 'Test',
          },
          {
            concept: 'Item 3',
            amount: 300.00,
            type: BudgetType.EXPENSE,
            category: 'Test',
          },
        ],
      });

      template.removeItem(1);

      expect(template.items).toHaveLength(2);
      expect(template.items[0]).toBeDefined();
      expect(template.items[0]?.concept).toBe('Item 1');
      expect(template.items[1]).toBeDefined();
      expect(template.items[1]?.concept).toBe('Item 3');
    });

    it('should update updatedAt timestamp', () => {
      const template = BudgetTemplate.create({
        name: 'Test Template',
        items: [
          {
            concept: 'Item',
            amount: 100.00,
            type: BudgetType.EXPENSE,
            category: 'Test',
          },
        ],
      });

      const beforeRemove = template.updatedAt;

      const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

      return wait(1).then(() => {
        template.removeItem(0);
        expect(template.updatedAt.getTime()).toBeGreaterThan(beforeRemove.getTime());
      });
    });

    it('should throw error when index is invalid', () => {
      const template = BudgetTemplate.create({
        name: 'Test Template',
        items: [
          {
            concept: 'Item',
            amount: 100.00,
            type: BudgetType.EXPENSE,
            category: 'Test',
          },
        ],
      });

      expect(() => {
        template.removeItem(5);
      }).toThrow('Invalid item index');
    });

    it('should throw error when index is negative', () => {
      const template = BudgetTemplate.create({
        name: 'Test Template',
        items: [
          {
            concept: 'Item',
            amount: 100.00,
            type: BudgetType.EXPENSE,
            category: 'Test',
          },
        ],
      });

      expect(() => {
        template.removeItem(-1);
      }).toThrow('Invalid item index');
    });
  });

  describe('updateName', () => {
    it('should update name', () => {
      const template = BudgetTemplate.create({
        name: 'Old Name',
        items: [
          {
            concept: 'Item',
            amount: 100.00,
            type: BudgetType.EXPENSE,
            category: 'Test',
          },
        ],
      });

      template.updateName('New Name');

      expect(template.name).toBe('New Name');
    });

    it('should update updatedAt timestamp', () => {
      const template = BudgetTemplate.create({
        name: 'Old Name',
        items: [
          {
            concept: 'Item',
            amount: 100.00,
            type: BudgetType.EXPENSE,
            category: 'Test',
          },
        ],
      });

      const beforeUpdate = template.updatedAt;

      const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

      return wait(1).then(() => {
        template.updateName('New Name');
        expect(template.updatedAt.getTime()).toBeGreaterThan(beforeUpdate.getTime());
      });
    });

    it('should throw error when name is empty', () => {
      const template = BudgetTemplate.create({
        name: 'Name',
        items: [
          {
            concept: 'Item',
            amount: 100.00,
            type: BudgetType.EXPENSE,
            category: 'Test',
          },
        ],
      });

      expect(() => {
        template.updateName('');
      }).toThrow('Template name is required');
    });
  });

  describe('toObject', () => {
    it('should return a copy of props', () => {
      const template = BudgetTemplate.create({
        name: 'Test Template',
        items: [
          {
            concept: 'Item',
            amount: 100.00,
            type: BudgetType.EXPENSE,
            category: 'Test',
          },
        ],
      });

      const obj = template.toObject();

      expect(obj).toBeDefined();
      expect(obj.id).toBe(template.id);
      expect(obj.name).toBe(template.name);
      expect(obj).not.toBe((template as any).props);
    });
  });
});
