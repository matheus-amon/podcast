/**
 * Get Invoice Use Case
 *
 * Caso de uso para buscar uma invoice por ID
 */

import { Invoice } from '@domain/billing/entities/invoice.entity';
import type { IInvoiceRepository } from '@domain/billing/ports/invoice-repository.port';

export interface GetInvoiceUseCaseInput {
  id: string;
}

export type GetInvoiceUseCaseOutput = Invoice;

export class GetInvoiceUseCase {
  constructor(private readonly invoiceRepository: IInvoiceRepository) {}

  async execute(input: GetInvoiceUseCaseInput): Promise<GetInvoiceUseCaseOutput> {
    const invoice = await this.invoiceRepository.findById(input.id);

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    // Verificar se está deletada
    if (invoice.isDeleted()) {
      throw new Error('Invoice has been deleted');
    }

    return invoice;
  }
}
