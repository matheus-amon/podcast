/**
 * List Invoices Use Case
 *
 * Caso de uso para listar invoices com paginação e filtros
 */

import type { IInvoiceRepository, InvoiceFilters, PaginatedInvoiceResult } from '@domain/billing/ports/invoice-repository.port';
import type { BillingStatus } from '@domain/billing/value-objects/billing-status.enum';

export interface ListInvoicesUseCaseInput {
  page?: number;
  limit?: number;
  status?: BillingStatus;
  subscriptionPlan?: string;
  dueDateFrom?: Date;
  dueDateTo?: Date;
  clientName?: string;
}

export type ListInvoicesUseCaseOutput = PaginatedInvoiceResult;

export class ListInvoicesUseCase {
  constructor(private readonly invoiceRepository: IInvoiceRepository) {}

  async execute(input: ListInvoicesUseCaseInput = {}): Promise<ListInvoicesUseCaseOutput> {
    const filters: InvoiceFilters & { page?: number; limit?: number } = {
      page: input.page ?? 1,
      limit: input.limit ?? 10,
      status: input.status,
      subscriptionPlan: input.subscriptionPlan,
      dueDateFrom: input.dueDateFrom,
      dueDateTo: input.dueDateTo,
      clientName: input.clientName,
    };

    const result = await this.invoiceRepository.findPaginated(filters);

    return result;
  }
}
