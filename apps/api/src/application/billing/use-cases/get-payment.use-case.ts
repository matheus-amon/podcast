/**
 * Get Payment Use Case
 *
 * Caso de uso para buscar um payment por ID
 */

import { Payment } from '@domain/billing/entities/payment.entity';
import type { IPaymentRepository } from '@domain/billing/ports/payment-repository.port';

export interface GetPaymentUseCaseInput {
  id: string;
}

export type GetPaymentUseCaseOutput = Payment;

export class GetPaymentUseCase {
  constructor(private readonly paymentRepository: IPaymentRepository) {}

  async execute(input: GetPaymentUseCaseInput): Promise<GetPaymentUseCaseOutput> {
    const payment = await this.paymentRepository.findById(input.id);

    if (!payment) {
      throw new Error('Payment not found');
    }

    // Verificar se está deletado
    if (payment.isDeleted()) {
      throw new Error('Payment has been deleted');
    }

    return payment;
  }
}
