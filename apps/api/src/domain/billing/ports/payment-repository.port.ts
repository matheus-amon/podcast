/**
 * Payment Repository Port
 *
 * Interface que define o contrato para o repositório de Payment
 */

import type { Payment } from '../entities/payment.entity';
import { PaymentStatus } from '../value-objects/payment-status.enum';

/**
 * Filtros para busca de payments
 */
export interface PaymentFilters {
  status?: PaymentStatus;
  invoiceId?: string;
  method?: string;
  dateFrom?: Date;
  dateTo?: Date;
  offset?: number;
  limit?: number;
}

/**
 * Resultado paginado
 */
export interface PaginatedPaymentResult {
  data: Payment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Resumo de payments
 */
export interface PaymentSummary {
  totalPaid: number;
  totalRefunded: number;
  totalPending: number;
  count: number;
}

/**
 * Payment Repository Port
 */
export interface IPaymentRepository {
  // CRUD básico
  findById(id: string): Promise<Payment | null>;
  findAll(filters?: PaymentFilters): Promise<Payment[]>;
  findPaginated(filters?: PaymentFilters & { page?: number; limit?: number }): Promise<PaginatedPaymentResult>;
  create(payment: Payment): Promise<Payment>;
  update(payment: Payment): Promise<Payment>;
  delete(id: string): Promise<void>;

  // Queries específicas
  findByStatus(status: PaymentStatus): Promise<Payment[]>;
  findByInvoiceId(invoiceId: string): Promise<Payment[]>;
  findSummary(filters?: PaymentFilters): Promise<PaymentSummary>;

  // Busca por transaction ID
  findByTransactionId(transactionId: string): Promise<Payment | null>;
}
