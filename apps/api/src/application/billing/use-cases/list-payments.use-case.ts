/**
 * List Payments Use Case
 *
 * Caso de uso para listar payments com paginação e filtros
 */

import type { IPaymentRepository, PaymentFilters, PaginatedPaymentResult } from '@domain/billing/ports/payment-repository.port';
import type { PaymentStatus } from '@domain/billing/value-objects/payment-status.enum';
import type { PaymentMethod } from '@domain/billing/value-objects/payment-method.enum';

export interface ListPaymentsUseCaseInput {
  page?: number;
  limit?: number;
  status?: PaymentStatus;
  invoiceId?: string;
  method?: PaymentMethod;
  dateFrom?: Date;
  dateTo?: Date;
}

export type ListPaymentsUseCaseOutput = PaginatedPaymentResult;

export class ListPaymentsUseCase {
  constructor(private readonly paymentRepository: IPaymentRepository) {}

  async execute(input: ListPaymentsUseCaseInput = {}): Promise<ListPaymentsUseCaseOutput> {
    const filters: PaymentFilters & { page?: number; limit?: number } = {
      page: input.page ?? 1,
      limit: input.limit ?? 10,
      status: input.status,
      invoiceId: input.invoiceId,
      method: input.method,
      dateFrom: input.dateFrom,
      dateTo: input.dateTo,
    };

    const result = await this.paymentRepository.findPaginated(filters);

    return result;
  }
}
