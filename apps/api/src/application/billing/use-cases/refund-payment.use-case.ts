/**
 * Refund Payment Use Case
 *
 * Caso de uso para estornar/reembolsar um pagamento
 */

import { Payment } from '@domain/billing/entities/payment.entity';
import type { IPaymentRepository } from '@domain/billing/ports/payment-repository.port';

export interface RefundPaymentUseCaseInput {
  paymentId: string;
  reason: string;
}

export type RefundPaymentUseCaseOutput = Payment;

export class RefundPaymentUseCase {
  constructor(private readonly paymentRepository: IPaymentRepository) {}

  async execute(input: RefundPaymentUseCaseInput): Promise<RefundPaymentUseCaseOutput> {
    // Buscar payment
    const payment = await this.paymentRepository.findById(input.paymentId);

    if (!payment) {
      throw new Error('Payment not found');
    }

    // Estornar payment
    payment.refund(input.reason);
    await this.paymentRepository.update(payment);

    return payment;
  }
}
