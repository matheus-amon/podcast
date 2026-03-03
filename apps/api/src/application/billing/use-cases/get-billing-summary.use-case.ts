/**
 * Get Billing Summary Use Case
 *
 * Caso de uso para obter resumo de billing
 */

import type { IInvoiceRepository, InvoiceFilters, BillingSummary } from '@domain/billing/ports/invoice-repository.port';
import type { BillingStatus } from '@domain/billing/value-objects/billing-status.enum';

export interface GetBillingSummaryUseCaseInput {
  status?: BillingStatus;
  subscriptionPlan?: string;
  dueDateFrom?: Date;
  dueDateTo?: Date;
}

export type GetBillingSummaryUseCaseOutput = BillingSummary;

export class GetBillingSummaryUseCase {
  constructor(private readonly invoiceRepository: IInvoiceRepository) {}

  async execute(input: GetBillingSummaryUseCaseInput = {}): Promise<GetBillingSummaryUseCaseOutput> {
    const filters: InvoiceFilters = {
      status: input.status,
      subscriptionPlan: input.subscriptionPlan,
      dueDateFrom: input.dueDateFrom,
      dueDateTo: input.dueDateTo,
    };

    const summary = await this.invoiceRepository.findSummary(filters);

    return summary;
  }
}
