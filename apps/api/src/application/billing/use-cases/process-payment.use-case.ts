/**
 * Process Payment Use Case
 *
 * Caso de uso para processar um pagamento de uma invoice
 */

import { Payment } from '@domain/billing/entities/payment.entity';
import { Invoice } from '@domain/billing/entities/invoice.entity';
import type { IPaymentRepository } from '@domain/billing/ports/payment-repository.port';
import type { IInvoiceRepository } from '@domain/billing/ports/invoice-repository.port';
import type { CreatePaymentDTO } from '@domain/billing/entities/payment.entity';
import { PaymentMethod } from '@domain/billing/value-objects/payment-method.enum';

export interface ProcessPaymentUseCaseInput extends CreatePaymentDTO {
  autoApprove?: boolean;
}

export interface ProcessPaymentUseCaseOutput {
  payment: Payment;
  invoice: Invoice;
}

export class ProcessPaymentUseCase {
  constructor(
    private readonly paymentRepository: IPaymentRepository,
    private readonly invoiceRepository: IInvoiceRepository
  ) {}

  async execute(input: ProcessPaymentUseCaseInput): Promise<ProcessPaymentUseCaseOutput> {
    // Buscar invoice
    const invoice = await this.invoiceRepository.findById(input.invoiceId);

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    if (invoice.isPaid()) {
      throw new Error('Invoice is already paid');
    }

    if (invoice.isCancelled()) {
      throw new Error('Cannot pay a cancelled invoice');
    }

    // Criar payment
    const payment = Payment.create({
      invoiceId: input.invoiceId,
      amount: input.amount || invoice.amount,
      method: input.method,
      transactionId: input.transactionId,
      metadata: input.metadata,
    });

    // Persistir payment
    const createdPayment = await this.paymentRepository.create(payment);

    // Se autoApprove, aprovar o pagamento e marcar invoice como paga
    if (input.autoApprove) {
      createdPayment.approve();
      await this.paymentRepository.update(createdPayment);

      invoice.markAsPaid();
      await this.invoiceRepository.update(invoice);
    }

    return {
      payment: createdPayment,
      invoice,
    };
  }
}
