/**
 * Postgres Payment Repository
 *
 * Implementação do Payment Repository usando PostgreSQL
 */

import { db } from '@db/index';
import { payments, type Payments as DbPayment } from '@db/schema';
import { eq, desc, and, gte, lte, sql, sum } from 'drizzle-orm';
import type { IPaymentRepository, PaymentFilters, PaginatedPaymentResult, PaymentSummary } from '@domain/billing/ports/payment-repository.port';
import { Payment } from '@domain/billing/entities/payment.entity';
import { PaymentStatus } from '@domain/billing/value-objects/payment-status.enum';
import { PaymentMethod } from '@domain/billing/value-objects/payment-method.enum';

/**
 * Mapper: Database → Domain
 */
function mapDbToDomain(dbPayment: DbPayment): Payment {
  return Payment.fromProps({
    id: dbPayment.id.toString(),
    invoiceId: dbPayment.invoiceId.toString(),
    amount: dbPayment.amount,
    method: dbPayment.method as PaymentMethod,
    status: dbPayment.status as PaymentStatus,
    transactionId: dbPayment.transactionId ?? undefined,
    paidAt: dbPayment.paidAt ? new Date(dbPayment.paidAt) : undefined,
    refundedAt: dbPayment.refundedAt ? new Date(dbPayment.refundedAt) : undefined,
    refundReason: dbPayment.refundReason ?? undefined,
    metadata: dbPayment.metadata as Record<string, any> ?? undefined,
    createdAt: dbPayment.createdAt ? new Date(dbPayment.createdAt) : new Date(),
    updatedAt: dbPayment.updatedAt ? new Date(dbPayment.updatedAt) : new Date(),
    deletedAt: dbPayment.deletedAt ? new Date(dbPayment.deletedAt) : undefined,
  });
}

/**
 * Mapper: Domain → Database
 */
function mapDomainToDb(payment: Payment): Omit<DbPayment, 'id' | 'createdAt'> {
  return {
    invoiceId: parseInt(payment.invoiceId),
    amount: payment.amount,
    method: payment.method,
    status: payment.status,
    transactionId: payment.transactionId ?? null,
    paidAt: payment.paidAt ?? null,
    refundedAt: payment.refundedAt ?? null,
    refundReason: payment.refundReason ?? null,
    metadata: payment.metadata ?? null,
    updatedAt: new Date(),
    deletedAt: payment.deletedAt ? new Date(payment.deletedAt) : null,
  };
}

export class PostgresPaymentRepository implements IPaymentRepository {
  /**
   * Buscar payment por ID
   */
  async findById(id: string): Promise<Payment | null> {
    const result = await db.query.payments.findFirst({
      where: eq(payments.id, parseInt(id)),
    });

    if (!result) return null;
    return mapDbToDomain(result);
  }

  /**
   * Buscar todos os payments
   */
  async findAll(filters?: PaymentFilters): Promise<Payment[]> {
    const where = this.buildWhereClause(filters);

    const results = await db
      .select()
      .from(payments)
      .where(where)
      .orderBy(desc(payments.createdAt));

    return results.map(mapDbToDomain);
  }

  /**
   * Buscar payments com paginação
   */
  async findPaginated(filters?: PaymentFilters & { page?: number; limit?: number }): Promise<PaginatedPaymentResult> {
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 10;
    const offset = (page - 1) * limit;

    const where = this.buildWhereClause(filters);

    // Buscar total
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(payments)
      .where(where);
    const total = Number(totalResult[0]?.count ?? 0);

    // Buscar dados paginados
    const results = await db
      .select()
      .from(payments)
      .where(where)
      .orderBy(desc(payments.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      data: results.map(mapDbToDomain),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Criar novo payment
   */
  async create(payment: Payment): Promise<Payment> {
    const dbData = mapDomainToDb(payment);

    const result = await db
      .insert(payments)
      .values(dbData)
      .returning();

    return mapDbToDomain(result[0]);
  }

  /**
   * Atualizar payment
   */
  async update(payment: Payment): Promise<Payment> {
    const dbData = mapDomainToDb(payment);

    const result = await db
      .update(payments)
      .set(dbData)
      .where(eq(payments.id, parseInt(payment.id)))
      .returning();

    if (!result[0]) {
      throw new Error('Payment not found');
    }

    return mapDbToDomain(result[0]);
  }

  /**
   * Deletar payment (soft delete via entity)
   */
  async delete(id: string): Promise<void> {
    await db.delete(payments).where(eq(payments.id, parseInt(id)));
  }

  /**
   * Buscar payments por status
   */
  async findByStatus(status: PaymentStatus): Promise<Payment[]> {
    const results = await db
      .select()
      .from(payments)
      .where(eq(payments.status, status))
      .orderBy(desc(payments.createdAt));

    return results.map(mapDbToDomain);
  }

  /**
   * Buscar payments por invoice ID
   */
  async findByInvoiceId(invoiceId: string): Promise<Payment[]> {
    const results = await db
      .select()
      .from(payments)
      .where(eq(payments.invoiceId, parseInt(invoiceId)))
      .orderBy(desc(payments.createdAt));

    return results.map(mapDbToDomain);
  }

  /**
   * Buscar resumo de payments
   */
  async findSummary(filters?: PaymentFilters): Promise<PaymentSummary> {
    const where = this.buildWhereClause(filters);

    // Total paid
    const totalPaidResult = await db
      .select({ value: sum(payments.amount) })
      .from(payments)
      .where(where ? and(where, eq(payments.status, PaymentStatus.APPROVED)) : eq(payments.status, PaymentStatus.APPROVED));

    // Total refunded
    const totalRefundedResult = await db
      .select({ value: sum(payments.amount) })
      .from(payments)
      .where(where ? and(where, eq(payments.status, PaymentStatus.REFUNDED)) : eq(payments.status, PaymentStatus.REFUNDED));

    // Total pending
    const totalPendingResult = await db
      .select({ value: sum(payments.amount) })
      .from(payments)
      .where(where ? and(where, eq(payments.status, PaymentStatus.PENDING)) : eq(payments.status, PaymentStatus.PENDING));

    // Count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(payments)
      .where(where);

    const totalPaid = Number(totalPaidResult[0]?.value ?? 0);
    const totalRefunded = Number(totalRefundedResult[0]?.value ?? 0);
    const totalPending = Number(totalPendingResult[0]?.value ?? 0);
    const count = Number(countResult[0]?.count ?? 0);

    return {
      totalPaid,
      totalRefunded,
      totalPending,
      count,
    };
  }

  /**
   * Buscar payment por transaction ID
   */
  async findByTransactionId(transactionId: string): Promise<Payment | null> {
    const result = await db.query.payments.findFirst({
      where: eq(payments.transactionId, transactionId),
    });

    if (!result) return null;
    return mapDbToDomain(result);
  }

  /**
   * Construir cláusula WHERE dinâmica
   */
  private buildWhereClause(filters?: PaymentFilters) {
    const conditions = [];

    if (filters?.status) {
      conditions.push(eq(payments.status, filters.status));
    }

    if (filters?.invoiceId) {
      conditions.push(eq(payments.invoiceId, parseInt(filters.invoiceId)));
    }

    if (filters?.method) {
      conditions.push(eq(payments.method, filters.method));
    }

    if (filters?.dateFrom) {
      conditions.push(gte(payments.createdAt, filters.dateFrom));
    }

    if (filters?.dateTo) {
      conditions.push(lte(payments.createdAt, filters.dateTo));
    }

    // Excluir deletados
    conditions.push(eq(payments.deletedAt, null));

    if (conditions.length === 0) {
      return undefined;
    }

    return conditions.length === 1 ? conditions[0] : and(...conditions);
  }
}
