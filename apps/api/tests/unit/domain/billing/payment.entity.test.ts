/**
 * Payment Entity Tests
 *
 * Testes TDD para a entity Payment
 */

import { describe, it, expect } from 'bun:test';
import { Payment } from '../../../../src/domain/billing/entities/payment.entity';
import { PaymentMethod } from '../../../../src/domain/billing/value-objects/payment-method.enum';
import { PaymentStatus } from '../../../../src/domain/billing/value-objects/payment-status.enum';

describe('Payment', () => {
  describe('create', () => {
    it('should create valid payment when data is valid', () => {
      const payment = Payment.create({
        invoiceId: 'invoice-123',
        amount: 1500.00,
        method: PaymentMethod.PIX,
      });

      expect(payment).toBeDefined();
      expect(payment.invoiceId).toBe('invoice-123');
      expect(payment.amount).toBe(1500.00);
      expect(payment.method).toBe(PaymentMethod.PIX);
      expect(payment.status).toBe(PaymentStatus.PENDING);
      expect(payment.isPending()).toBe(true);
    });

    it('should create payment with transactionId', () => {
      const payment = Payment.create({
        invoiceId: 'invoice-123',
        amount: 1500.00,
        method: PaymentMethod.CREDIT_CARD,
        transactionId: 'txn_abc123',
      });

      expect(payment.transactionId).toBe('txn_abc123');
    });

    it('should create payment with metadata', () => {
      const metadata = { installments: 3, cardLast4: '1234' };
      const payment = Payment.create({
        invoiceId: 'invoice-123',
        amount: 1500.00,
        method: PaymentMethod.CREDIT_CARD,
        metadata,
      });

      expect(payment.metadata).toEqual(metadata);
    });

    it('should trim transactionId whitespace', () => {
      const payment = Payment.create({
        invoiceId: 'invoice-123',
        amount: 1500.00,
        method: PaymentMethod.PIX,
        transactionId: '  txn_abc123  ',
      });

      expect(payment.transactionId).toBe('txn_abc123');
    });

    it('should round amount to 2 decimal places', () => {
      const payment = Payment.create({
        invoiceId: 'invoice-123',
        amount: 1500.999,
        method: PaymentMethod.PIX,
      });

      expect(payment.amount).toBe(1501.00);
    });

    it('should throw error when invoiceId is empty', () => {
      expect(() => {
        Payment.create({
          invoiceId: '',
          amount: 1500.00,
          method: PaymentMethod.PIX,
        });
      }).toThrow('Invoice ID is required');
    });

    it('should throw error when amount is zero', () => {
      expect(() => {
        Payment.create({
          invoiceId: 'invoice-123',
          amount: 0,
          method: PaymentMethod.PIX,
        });
      }).toThrow('Amount must be greater than zero');
    });

    it('should throw error when amount is negative', () => {
      expect(() => {
        Payment.create({
          invoiceId: 'invoice-123',
          amount: -100,
          method: PaymentMethod.PIX,
        });
      }).toThrow('Amount must be greater than zero');
    });

    it('should generate unique id for each payment', () => {
      const payment1 = Payment.create({
        invoiceId: 'invoice-123',
        amount: 1500.00,
        method: PaymentMethod.PIX,
      });

      const payment2 = Payment.create({
        invoiceId: 'invoice-456',
        amount: 2000.00,
        method: PaymentMethod.PIX,
      });

      expect(payment1.id).not.toBe(payment2.id);
    });
  });

  describe('fromProps', () => {
    it('should create payment from existing props', () => {
      const now = new Date();
      const props = {
        id: 'test-id',
        invoiceId: 'invoice-123',
        amount: 1500.00,
        method: PaymentMethod.PIX as PaymentMethod,
        status: PaymentStatus.APPROVED as PaymentStatus,
        createdAt: now,
        updatedAt: now,
      };

      const payment = Payment.fromProps(props);

      expect(payment.id).toBe('test-id');
      expect(payment.invoiceId).toBe('invoice-123');
      expect(payment.amount).toBe(1500.00);
      expect(payment.status).toBe(PaymentStatus.APPROVED);
    });
  });

  describe('updateAmount', () => {
    it('should update amount', () => {
      const payment = Payment.create({
        invoiceId: 'invoice-123',
        amount: 1500.00,
        method: PaymentMethod.PIX,
      });

      payment.updateAmount(2000.00);

      expect(payment.amount).toBe(2000.00);
    });

    it('should throw error when amount is zero', () => {
      const payment = Payment.create({
        invoiceId: 'invoice-123',
        amount: 1500.00,
        method: PaymentMethod.PIX,
      });

      expect(() => {
        payment.updateAmount(0);
      }).toThrow('Amount must be greater than zero');
    });

    it('should throw error when payment is approved', () => {
      const payment = Payment.fromProps({
        id: 'test-id',
        invoiceId: 'invoice-123',
        amount: 1500.00,
        method: PaymentMethod.PIX,
        status: PaymentStatus.APPROVED,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(() => {
        payment.updateAmount(2000.00);
      }).toThrow('Cannot update amount of an approved or refunded payment');
    });

    it('should throw error when payment is refunded', () => {
      const payment = Payment.fromProps({
        id: 'test-id',
        invoiceId: 'invoice-123',
        amount: 1500.00,
        method: PaymentMethod.PIX,
        status: PaymentStatus.REFUNDED,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(() => {
        payment.updateAmount(2000.00);
      }).toThrow('Cannot update amount of an approved or refunded payment');
    });
  });

  describe('approve', () => {
    it('should change status to APPROVED', () => {
      const payment = Payment.create({
        invoiceId: 'invoice-123',
        amount: 1500.00,
        method: PaymentMethod.PIX,
      });

      expect(payment.status).toBe(PaymentStatus.PENDING);

      payment.approve();

      expect(payment.status).toBe(PaymentStatus.APPROVED);
      expect(payment.isApproved()).toBe(true);
      expect(payment.paidAt).toBeDefined();
    });

    it('should throw error when payment is already approved', () => {
      const payment = Payment.fromProps({
        id: 'test-id',
        invoiceId: 'invoice-123',
        amount: 1500.00,
        method: PaymentMethod.PIX,
        status: PaymentStatus.APPROVED,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(() => {
        payment.approve();
      }).toThrow('Payment is already approved');
    });

    it('should throw error when payment is rejected', () => {
      const payment = Payment.fromProps({
        id: 'test-id',
        invoiceId: 'invoice-123',
        amount: 1500.00,
        method: PaymentMethod.PIX,
        status: PaymentStatus.REJECTED,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(() => {
        payment.approve();
      }).toThrow('Cannot approve a rejected payment');
    });
  });

  describe('reject', () => {
    it('should change status to REJECTED', () => {
      const payment = Payment.create({
        invoiceId: 'invoice-123',
        amount: 1500.00,
        method: PaymentMethod.PIX,
      });

      payment.reject('Insufficient funds');

      expect(payment.status).toBe(PaymentStatus.REJECTED);
      expect(payment.isRejected()).toBe(true);
    });

    it('should throw error when payment is approved', () => {
      const payment = Payment.fromProps({
        id: 'test-id',
        invoiceId: 'invoice-123',
        amount: 1500.00,
        method: PaymentMethod.PIX,
        status: PaymentStatus.APPROVED,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(() => {
        payment.reject('Test reason');
      }).toThrow('Cannot reject an approved payment');
    });
  });

  describe('refund', () => {
    it('should change status to REFUNDED', () => {
      const payment = Payment.fromProps({
        id: 'test-id',
        invoiceId: 'invoice-123',
        amount: 1500.00,
        method: PaymentMethod.PIX,
        status: PaymentStatus.APPROVED,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      payment.refund('Customer requested refund');

      expect(payment.status).toBe(PaymentStatus.REFUNDED);
      expect(payment.isRefunded()).toBe(true);
      expect(payment.refundedAt).toBeDefined();
      expect(payment.refundReason).toBe('Customer requested refund');
    });

    it('should throw error when payment is not approved', () => {
      const payment = Payment.create({
        invoiceId: 'invoice-123',
        amount: 1500.00,
        method: PaymentMethod.PIX,
      });

      expect(() => {
        payment.refund('Test reason');
      }).toThrow('Can only refund an approved payment');
    });
  });

  describe('markAsChargeback', () => {
    it('should change status to CHARGEBACK', () => {
      const payment = Payment.fromProps({
        id: 'test-id',
        invoiceId: 'invoice-123',
        amount: 1500.00,
        method: PaymentMethod.CREDIT_CARD,
        status: PaymentStatus.APPROVED,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      payment.markAsChargeback();

      expect(payment.status).toBe(PaymentStatus.CHARGEBACK);
      expect(payment.isChargeback()).toBe(true);
    });

    it('should throw error when payment is not approved', () => {
      const payment = Payment.create({
        invoiceId: 'invoice-123',
        amount: 1500.00,
        method: PaymentMethod.PIX,
      });

      expect(() => {
        payment.markAsChargeback();
      }).toThrow('Can only mark chargeback for approved payments');
    });
  });

  describe('isPending', () => {
    it('should return true when status is PENDING', () => {
      const payment = Payment.create({
        invoiceId: 'invoice-123',
        amount: 1500.00,
        method: PaymentMethod.PIX,
      });

      expect(payment.isPending()).toBe(true);
    });
  });

  describe('isApproved', () => {
    it('should return true when status is APPROVED', () => {
      const payment = Payment.fromProps({
        id: 'test-id',
        invoiceId: 'invoice-123',
        amount: 1500.00,
        method: PaymentMethod.PIX,
        status: PaymentStatus.APPROVED,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(payment.isApproved()).toBe(true);
    });
  });

  describe('isRejected', () => {
    it('should return true when status is REJECTED', () => {
      const payment = Payment.fromProps({
        id: 'test-id',
        invoiceId: 'invoice-123',
        amount: 1500.00,
        method: PaymentMethod.PIX,
        status: PaymentStatus.REJECTED,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(payment.isRejected()).toBe(true);
    });
  });

  describe('isRefunded', () => {
    it('should return true when status is REFUNDED', () => {
      const payment = Payment.fromProps({
        id: 'test-id',
        invoiceId: 'invoice-123',
        amount: 1500.00,
        method: PaymentMethod.PIX,
        status: PaymentStatus.REFUNDED,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(payment.isRefunded()).toBe(true);
    });
  });

  describe('isChargeback', () => {
    it('should return true when status is CHARGEBACK', () => {
      const payment = Payment.fromProps({
        id: 'test-id',
        invoiceId: 'invoice-123',
        amount: 1500.00,
        method: PaymentMethod.CREDIT_CARD,
        status: PaymentStatus.CHARGEBACK,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(payment.isChargeback()).toBe(true);
    });
  });

  describe('formatAmount', () => {
    it('should format amount as Brazilian Real', () => {
      const payment = Payment.create({
        invoiceId: 'invoice-123',
        amount: 1250.50,
        method: PaymentMethod.PIX,
      });

      const formatted = payment.formatAmount('pt-BR');
      expect(formatted).toContain('1.250,50');
    });
  });

  describe('toObject', () => {
    it('should return a copy of props', () => {
      const payment = Payment.create({
        invoiceId: 'invoice-123',
        amount: 1500.00,
        method: PaymentMethod.PIX,
      });

      const obj = payment.toObject();

      expect(obj).toBeDefined();
      expect(obj.id).toBe(payment.id);
      expect(obj.invoiceId).toBe(payment.invoiceId);
      expect(obj).not.toBe((payment as any).props);
    });
  });
});
