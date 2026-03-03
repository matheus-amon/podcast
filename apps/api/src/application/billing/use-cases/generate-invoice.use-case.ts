/**
 * Generate Invoice Use Case
 *
 * Caso de uso para gerar uma nova invoice
 */

import { Invoice } from '@domain/billing/entities/invoice.entity';
import type { IInvoiceRepository } from '@domain/billing/ports/invoice-repository.port';
import type { CreateInvoiceDTO } from '@domain/billing/entities/invoice.entity';

export interface GenerateInvoiceUseCaseInput extends CreateInvoiceDTO {}

export type GenerateInvoiceUseCaseOutput = Invoice;

export class GenerateInvoiceUseCase {
  constructor(private readonly invoiceRepository: IInvoiceRepository) {}

  async execute(input: GenerateInvoiceUseCaseInput): Promise<GenerateInvoiceUseCaseOutput> {
    // Gerar número da invoice se não fornecido
    const invoiceNumber = input.invoiceNumber || this.generateInvoiceNumber();

    // Criar entity usando factory method
    const invoice = Invoice.create({
      ...input,
      invoiceNumber,
    });

    // Persistir
    const created = await this.invoiceRepository.create(invoice);

    return created;
  }

  /**
   * Gera um número de invoice único
   * Formato: INV-YYYYMMDD-XXXXX
   */
  private generateInvoiceNumber(): string {
    const now = new Date();
    const date = now.toISOString().split('T')[0].replace(/-/g, '');
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return `INV-${date}-${random}`;
  }
}
