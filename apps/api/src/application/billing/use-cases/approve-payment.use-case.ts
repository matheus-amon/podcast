/**
 * Approve Payment Use Case
 *
 * Caso de uso para aprovar um pagamento pendente
 */

import { Payment } from '@domain/billing/entities/payment.entity';
import { Invoice } from '@domain/billing/entities/invoice.entity';
import type { IPaymentRepository } from '@domain/billing/ports/payment-repository.port';
import type { IInvoiceRepository } from '@domain/billing/ports/invoice-repository.port';

export interface ApprovePaymentUseCaseInput {
  paymentId: string;
}

export interface ApprovePaymentUseCaseOutput {
  payment: Payment;
  invoice: Invoice;
}

export class ApprovePaymentUseCase {
  constructor(
    private readonly paymentRepository: IPaymentRepository,
    private readonly invoiceRepository: IInvoiceRepository
  ) {}

  async execute(input: ApprovePaymentUseCaseInput): Promise<ApprovePaymentUseCaseOutput> {
    // Buscar payment
    const payment = await this.paymentRepository.findById(input.paymentId);

    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.isApproved()) {
      throw new Error('Payment is already approved');
    }

    if (payment.isRejected()) {
      throw new Error('Cannot approve a rejected payment');
    }

    // Aprovar payment
    payment.approve();
    await this.paymentRepository.update(payment);

    // Buscar invoice e marcar como paga
    const invoice = await this.invoiceRepository.findById(payment.invoiceId);

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    invoice.markAsPaid();
    await this.invoiceRepository.update(invoice);

    return {
      payment,
      invoice,
    };
  }
}
