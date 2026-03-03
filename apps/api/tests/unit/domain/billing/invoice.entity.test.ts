/**
 * Invoice Entity Tests
 *
 * Testes TDD para a entity Invoice
 */

import { describe, it, expect } from 'bun:test';
import { Invoice } from '../../../../src/domain/billing/entities/invoice.entity';
import { BillingStatus } from '../../../../src/domain/billing/value-objects/billing-status.enum';

describe('Invoice', () => {
  describe('create', () => {
    const futureDate = new Date('2026-04-01');

    it('should create valid invoice when data is valid', () => {
      const invoice = Invoice.create({
        clientName: 'Acme Corp',
        amount: 1500.00,
        dueDate: futureDate,
      });

      expect(invoice).toBeDefined();
      expect(invoice.clientName).toBe('Acme Corp');
      expect(invoice.amount).toBe(1500.00);
      expect(invoice.dueDate).toBe(futureDate);
      expect(invoice.status).toBe(BillingStatus.PENDING);
      expect(invoice.isPending()).toBe(true);
    });

    it('should create invoice with invoice number', () => {
      const invoice = Invoice.create({
        clientName: 'Acme Corp',
        amount: 1500.00,
        dueDate: futureDate,
        invoiceNumber: 'INV-2026-001',
      });

      expect(invoice.invoiceNumber).toBe('INV-2026-001');
    });

    it('should create invoice with subscription plan', () => {
      const invoice = Invoice.create({
        clientName: 'Acme Corp',
        amount: 1500.00,
        dueDate: futureDate,
        subscriptionPlan: 'PRO',
      });

      expect(invoice.subscriptionPlan).toBe('PRO');
    });

    it('should create invoice with description', () => {
      const invoice = Invoice.create({
        clientName: 'Acme Corp',
        amount: 1500.00,
        dueDate: futureDate,
        description: 'Monthly subscription',
      });

      expect(invoice.description).toBe('Monthly subscription');
    });

    it('should trim clientName whitespace', () => {
      const invoice = Invoice.create({
        clientName: '  Acme Corp  ',
        amount: 1500.00,
        dueDate: futureDate,
      });

      expect(invoice.clientName).toBe('Acme Corp');
    });

    it('should round amount to 2 decimal places', () => {
      const invoice = Invoice.create({
        clientName: 'Acme Corp',
        amount: 1500.999,
        dueDate: futureDate,
      });

      expect(invoice.amount).toBe(1501.00);
    });

    it('should throw error when clientName is empty', () => {
      expect(() => {
        Invoice.create({
          clientName: '',
          amount: 1500.00,
          dueDate: futureDate,
        });
      }).toThrow('Client name is required');
    });

    it('should throw error when clientName is only whitespace', () => {
      expect(() => {
        Invoice.create({
          clientName: '   ',
          amount: 1500.00,
          dueDate: futureDate,
        });
      }).toThrow('Client name is required');
    });

    it('should throw error when amount is zero', () => {
      expect(() => {
        Invoice.create({
          clientName: 'Acme Corp',
          amount: 0,
          dueDate: futureDate,
        });
      }).toThrow('Amount must be greater than zero');
    });

    it('should throw error when amount is negative', () => {
      expect(() => {
        Invoice.create({
          clientName: 'Acme Corp',
          amount: -100,
          dueDate: futureDate,
        });
      }).toThrow('Amount must be greater than zero');
    });

    it('should throw error when dueDate is in the past', () => {
      const pastDate = new Date('2020-01-01');
      expect(() => {
        Invoice.create({
          clientName: 'Acme Corp',
          amount: 1500.00,
          dueDate: pastDate,
        });
      }).toThrow('Due date must be in the future');
    });

    it('should throw error when dueDate is today', () => {
      expect(() => {
        Invoice.create({
          clientName: 'Acme Corp',
          amount: 1500.00,
          dueDate: new Date(),
        });
      }).toThrow('Due date must be in the future');
    });

    it('should generate unique id for each invoice', () => {
      const invoice1 = Invoice.create({
        clientName: 'Acme Corp',
        amount: 1500.00,
        dueDate: futureDate,
      });

      const invoice2 = Invoice.create({
        clientName: 'Acme Corp',
        amount: 2000.00,
        dueDate: futureDate,
      });

      expect(invoice1.id).not.toBe(invoice2.id);
    });
  });

  describe('fromProps', () => {
    it('should create invoice from existing props', () => {
      const now = new Date();
      const futureDate = new Date('2026-04-01');
      const props = {
        id: 'test-id',
        clientName: 'Acme Corp',
        amount: 1500.00,
        dueDate: futureDate,
        status: BillingStatus.PAID as BillingStatus,
        createdAt: now,
        updatedAt: now,
      };

      const invoice = Invoice.fromProps(props);

      expect(invoice.id).toBe('test-id');
      expect(invoice.clientName).toBe('Acme Corp');
      expect(invoice.amount).toBe(1500.00);
      expect(invoice.status).toBe(BillingStatus.PAID);
    });
  });

  describe('updateClientName', () => {
    const futureDate = new Date('2026-04-01');

    it('should update clientName', () => {
      const invoice = Invoice.create({
        clientName: 'Old Corp',
        amount: 1500.00,
        dueDate: futureDate,
      });

      invoice.updateClientName('New Corp');

      expect(invoice.clientName).toBe('New Corp');
    });

    it('should throw error when clientName is empty', () => {
      const invoice = Invoice.create({
        clientName: 'Acme Corp',
        amount: 1500.00,
        dueDate: futureDate,
      });

      expect(() => {
        invoice.updateClientName('');
      }).toThrow('Client name is required');
    });
  });

  describe('updateAmount', () => {
    const futureDate = new Date('2026-04-01');

    it('should update amount', () => {
      const invoice = Invoice.create({
        clientName: 'Acme Corp',
        amount: 1500.00,
        dueDate: futureDate,
      });

      invoice.updateAmount(2000.00);

      expect(invoice.amount).toBe(2000.00);
    });

    it('should throw error when amount is zero', () => {
      const invoice = Invoice.create({
        clientName: 'Acme Corp',
        amount: 1500.00,
        dueDate: futureDate,
      });

      expect(() => {
        invoice.updateAmount(0);
      }).toThrow('Amount must be greater than zero');
    });

    it('should throw error when invoice is paid', () => {
      const invoice = Invoice.fromProps({
        id: 'test-id',
        clientName: 'Acme Corp',
        amount: 1500.00,
        dueDate: futureDate,
        status: BillingStatus.PAID,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(() => {
        invoice.updateAmount(2000.00);
      }).toThrow('Cannot update amount of a paid invoice');
    });
  });

  describe('markAsPaid', () => {
    const futureDate = new Date('2026-04-01');

    it('should change status to PAID', () => {
      const invoice = Invoice.create({
        clientName: 'Acme Corp',
        amount: 1500.00,
        dueDate: futureDate,
      });

      expect(invoice.status).toBe(BillingStatus.PENDING);

      invoice.markAsPaid();

      expect(invoice.status).toBe(BillingStatus.PAID);
      expect(invoice.isPaid()).toBe(true);
      expect(invoice.paidAt).toBeDefined();
    });

    it('should throw error when invoice is already paid', () => {
      const invoice = Invoice.fromProps({
        id: 'test-id',
        clientName: 'Acme Corp',
        amount: 1500.00,
        dueDate: futureDate,
        status: BillingStatus.PAID,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(() => {
        invoice.markAsPaid();
      }).toThrow('Invoice is already paid');
    });

    it('should throw error when invoice is cancelled', () => {
      const invoice = Invoice.fromProps({
        id: 'test-id',
        clientName: 'Acme Corp',
        amount: 1500.00,
        dueDate: futureDate,
        status: BillingStatus.CANCELLED,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(() => {
        invoice.markAsPaid();
      }).toThrow('Cannot pay a cancelled invoice');
    });
  });

  describe('markAsOverdue', () => {
    const futureDate = new Date('2026-04-01');

    it('should change status to OVERDUE', () => {
      const invoice = Invoice.create({
        clientName: 'Acme Corp',
        amount: 1500.00,
        dueDate: futureDate,
      });

      invoice.markAsOverdue();

      expect(invoice.status).toBe(BillingStatus.OVERDUE);
      expect(invoice.isOverdue()).toBe(true);
    });

    it('should throw error when invoice is paid', () => {
      const invoice = Invoice.fromProps({
        id: 'test-id',
        clientName: 'Acme Corp',
        amount: 1500.00,
        dueDate: futureDate,
        status: BillingStatus.PAID,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(() => {
        invoice.markAsOverdue();
      }).toThrow('Cannot mark a paid invoice as overdue');
    });
  });

  describe('cancel', () => {
    const futureDate = new Date('2026-04-01');

    it('should change status to CANCELLED', () => {
      const invoice = Invoice.create({
        clientName: 'Acme Corp',
        amount: 1500.00,
        dueDate: futureDate,
      });

      invoice.cancel();

      expect(invoice.status).toBe(BillingStatus.CANCELLED);
      expect(invoice.isCancelled()).toBe(true);
    });

    it('should throw error when invoice is paid', () => {
      const invoice = Invoice.fromProps({
        id: 'test-id',
        clientName: 'Acme Corp',
        amount: 1500.00,
        dueDate: futureDate,
        status: BillingStatus.PAID,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(() => {
        invoice.cancel();
      }).toThrow('Cannot cancel a paid invoice');
    });
  });

  describe('reactivate', () => {
    const futureDate = new Date('2026-04-01');

    it('should change status to PENDING from OVERDUE', () => {
      const invoice = Invoice.fromProps({
        id: 'test-id',
        clientName: 'Acme Corp',
        amount: 1500.00,
        dueDate: futureDate,
        status: BillingStatus.OVERDUE,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      invoice.reactivate();

      expect(invoice.status).toBe(BillingStatus.PENDING);
      expect(invoice.isPending()).toBe(true);
    });

    it('should throw error when invoice is paid', () => {
      const invoice = Invoice.fromProps({
        id: 'test-id',
        clientName: 'Acme Corp',
        amount: 1500.00,
        dueDate: futureDate,
        status: BillingStatus.PAID,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(() => {
        invoice.reactivate();
      }).toThrow('Cannot reactivate a paid invoice');
    });
  });

  describe('isPaid', () => {
    it('should return true when status is PAID', () => {
      const invoice = Invoice.fromProps({
        id: 'test-id',
        clientName: 'Acme Corp',
        amount: 1500.00,
        dueDate: new Date('2026-04-01'),
        status: BillingStatus.PAID,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(invoice.isPaid()).toBe(true);
    });

    it('should return false when status is not PAID', () => {
      const invoice = Invoice.create({
        clientName: 'Acme Corp',
        amount: 1500.00,
        dueDate: new Date('2026-04-01'),
      });

      expect(invoice.isPaid()).toBe(false);
    });
  });

  describe('isPending', () => {
    it('should return true when status is PENDING', () => {
      const invoice = Invoice.create({
        clientName: 'Acme Corp',
        amount: 1500.00,
        dueDate: new Date('2026-04-01'),
      });

      expect(invoice.isPending()).toBe(true);
    });
  });

  describe('isOverdue', () => {
    it('should return true when status is OVERDUE', () => {
      const invoice = Invoice.fromProps({
        id: 'test-id',
        clientName: 'Acme Corp',
        amount: 1500.00,
        dueDate: new Date('2026-04-01'),
        status: BillingStatus.OVERDUE,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(invoice.isOverdue()).toBe(true);
    });
  });

  describe('isCancelled', () => {
    it('should return true when status is CANCELLED', () => {
      const invoice = Invoice.fromProps({
        id: 'test-id',
        clientName: 'Acme Corp',
        amount: 1500.00,
        dueDate: new Date('2026-04-01'),
        status: BillingStatus.CANCELLED,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(invoice.isCancelled()).toBe(true);
    });
  });

  describe('isPastDue', () => {
    it('should return true when dueDate is in the past and not paid', () => {
      const pastDate = new Date('2020-01-01');
      const invoice = Invoice.fromProps({
        id: 'test-id',
        clientName: 'Acme Corp',
        amount: 1500.00,
        dueDate: pastDate,
        status: BillingStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(invoice.isPastDue()).toBe(true);
    });

    it('should return false when invoice is paid', () => {
      const pastDate = new Date('2020-01-01');
      const invoice = Invoice.fromProps({
        id: 'test-id',
        clientName: 'Acme Corp',
        amount: 1500.00,
        dueDate: pastDate,
        status: BillingStatus.PAID,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(invoice.isPastDue()).toBe(false);
    });
  });

  describe('formatAmount', () => {
    const futureDate = new Date('2026-04-01');

    it('should format amount as Brazilian Real', () => {
      const invoice = Invoice.create({
        clientName: 'Acme Corp',
        amount: 1250.50,
        dueDate: futureDate,
      });

      const formatted = invoice.formatAmount('pt-BR');
      expect(formatted).toContain('1.250,50');
    });
  });

  describe('toObject', () => {
    const futureDate = new Date('2026-04-01');

    it('should return a copy of props', () => {
      const invoice = Invoice.create({
        clientName: 'Acme Corp',
        amount: 1500.00,
        dueDate: futureDate,
      });

      const obj = invoice.toObject();

      expect(obj).toBeDefined();
      expect(obj.id).toBe(invoice.id);
      expect(obj.clientName).toBe(invoice.clientName);
      expect(obj).not.toBe((invoice as any).props);
    });
  });
});
