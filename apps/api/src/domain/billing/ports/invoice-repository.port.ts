/**
 * Invoice Repository Port
 *
 * Interface que define o contrato para o repositório de Invoice
 */

import type { Invoice } from '../entities/invoice.entity';
import { BillingStatus } from '../value-objects/billing-status.enum';

/**
 * Filtros para busca de invoices
 */
export interface InvoiceFilters {
  status?: BillingStatus;
  subscriptionPlan?: string;
  dueDateFrom?: Date;
  dueDateTo?: Date;
  clientName?: string;
  offset?: number;
  limit?: number;
}

/**
 * Resultado paginado
 */
export interface PaginatedInvoiceResult {
  data: Invoice[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Resumo de billing
 */
export interface BillingSummary {
  totalBilled: number;
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  count: number;
}

/**
 * Invoice Repository Port
 */
export interface IInvoiceRepository {
  // CRUD básico
  findById(id: string): Promise<Invoice | null>;
  findAll(filters?: InvoiceFilters): Promise<Invoice[]>;
  findPaginated(filters?: InvoiceFilters & { page?: number; limit?: number }): Promise<PaginatedInvoiceResult>;
  create(invoice: Invoice): Promise<Invoice>;
  update(invoice: Invoice): Promise<Invoice>;
  delete(id: string): Promise<void>;

  // Queries específicas
  findByStatus(status: BillingStatus): Promise<Invoice[]>;
  findBySubscriptionPlan(plan: string): Promise<Invoice[]>;
  findOverdueInvoices(): Promise<Invoice[]>;
  findSummary(filters?: InvoiceFilters): Promise<BillingSummary>;

  // Busca por invoice number
  findByInvoiceNumber(invoiceNumber: string): Promise<Invoice | null>;
}
