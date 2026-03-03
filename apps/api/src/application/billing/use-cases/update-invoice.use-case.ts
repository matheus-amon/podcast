/**
 * Update Invoice Use Case
 *
 * Caso de uso para atualizar uma invoice existente
 */

import { Invoice } from '@domain/billing/entities/invoice.entity';
import type { IInvoiceRepository } from '@domain/billing/ports/invoice-repository.port';
import { BillingStatus } from '@domain/billing/value-objects/billing-status.enum';

export interface UpdateInvoiceUseCaseInput {
  id: string;
  clientName?: string;
  amount?: number;
  dueDate?: Date;
  invoiceNumber?: string;
  subscriptionPlan?: string;
  description?: string;
  status?: BillingStatus;
}

export type UpdateInvoiceUseCaseOutput = Invoice;

export class UpdateInvoiceUseCase {
  constructor(private readonly invoiceRepository: IInvoiceRepository) {}

  async execute(input: UpdateInvoiceUseCaseInput): Promise<UpdateInvoiceUseCaseOutput> {
    // Buscar invoice existente
    const invoice = await this.invoiceRepository.findById(input.id);

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    // Atualizar campos usando métodos da entity
    if (input.clientName !== undefined) {
      invoice.updateClientName(input.clientName);
    }

    if (input.amount !== undefined) {
      invoice.updateAmount(input.amount);
    }

    if (input.dueDate !== undefined) {
      invoice.updateDueDate(input.dueDate);
    }

    if (input.invoiceNumber !== undefined) {
      invoice.updateInvoiceNumber(input.invoiceNumber);
    }

    if (input.subscriptionPlan !== undefined) {
      invoice.updateSubscriptionPlan(input.subscriptionPlan);
    }

    if (input.description !== undefined) {
      invoice.updateDescription(input.description);
    }

    if (input.status !== undefined) {
      if (input.status === BillingStatus.PAID) {
        invoice.markAsPaid();
      } else if (input.status === BillingStatus.OVERDUE) {
        invoice.markAsOverdue();
      } else if (input.status === BillingStatus.CANCELLED) {
        invoice.cancel();
      } else if (input.status === BillingStatus.PENDING) {
        invoice.reactivate();
      }
    }

    // Persistir
    const updated = await this.invoiceRepository.update(invoice);

    return updated;
  }
}
