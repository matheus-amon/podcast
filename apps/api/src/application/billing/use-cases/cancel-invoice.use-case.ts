/**
 * Cancel Invoice Use Case
 *
 * Caso de uso para cancelar uma invoice
 */

import { Invoice } from '@domain/billing/entities/invoice.entity';
import type { IInvoiceRepository } from '@domain/billing/ports/invoice-repository.port';

export interface CancelInvoiceUseCaseInput {
  id: string;
}

export type CancelInvoiceUseCaseOutput = Invoice;

export class CancelInvoiceUseCase {
  constructor(private readonly invoiceRepository: IInvoiceRepository) {}

  async execute(input: CancelInvoiceUseCaseInput): Promise<CancelInvoiceUseCaseOutput> {
    const invoice = await this.invoiceRepository.findById(input.id);

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    // Cancelar invoice
    invoice.cancel();

    // Persistir
    const updated = await this.invoiceRepository.update(invoice);

    return updated;
  }
}
