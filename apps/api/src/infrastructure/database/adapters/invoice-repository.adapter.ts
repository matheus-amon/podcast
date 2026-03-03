/**
 * Postgres Invoice Repository
 *
 * Implementação do Invoice Repository usando PostgreSQL
 */

import { db } from '@db/index';
import { billing, type Billing as DbBilling } from '@db/schema';
import { eq, desc, and, gte, lte, sql, sum } from 'drizzle-orm';
import type { IInvoiceRepository, InvoiceFilters, PaginatedInvoiceResult, BillingSummary } from '@domain/billing/ports/invoice-repository.port';
import { Invoice } from '@domain/billing/entities/invoice.entity';
import { BillingStatus } from '@domain/billing/value-objects/billing-status.enum';

/**
 * Mapper: Database → Domain
 */
function mapDbToDomain(dbBilling: DbBilling): Invoice {
  return Invoice.fromProps({
    id: dbBilling.id.toString(),
    clientName: dbBilling.clientName,
    amount: dbBilling.amount,
    dueDate: dbBilling.dueDate ? new Date(dbBilling.dueDate) : new Date(),
    status: dbBilling.status as BillingStatus,
    invoiceNumber: dbBilling.invoiceNumber ?? undefined,
    subscriptionPlan: dbBilling.subscriptionPlan ?? undefined,
    description: dbBilling.description ?? undefined,
    paidAt: dbBilling.paidAt ? new Date(dbBilling.paidAt) : undefined,
    createdAt: dbBilling.createdAt ? new Date(dbBilling.createdAt) : new Date(),
    updatedAt: dbBilling.updatedAt ? new Date(dbBilling.updatedAt) : new Date(),
    deletedAt: dbBilling.deletedAt ? new Date(dbBilling.deletedAt) : undefined,
  });
}

/**
 * Mapper: Domain → Database
 */
function mapDomainToDb(invoice: Invoice): Omit<DbBilling, 'id' | 'createdAt'> {
  return {
    clientName: invoice.clientName,
    amount: invoice.amount,
    dueDate: invoice.dueDate.toISOString().split('T')[0],
    status: invoice.status,
    invoiceNumber: invoice.invoiceNumber ?? null,
    subscriptionPlan: invoice.subscriptionPlan ?? null,
    description: invoice.description ?? null,
    paidAt: invoice.paidAt ?? null,
    updatedAt: new Date(),
    deletedAt: invoice.deletedAt ? new Date(invoice.deletedAt) : null,
  };
}

export class PostgresInvoiceRepository implements IInvoiceRepository {
  /**
   * Buscar invoice por ID
   */
  async findById(id: string): Promise<Invoice | null> {
    const result = await db.query.billing.findFirst({
      where: eq(billing.id, parseInt(id)),
    });

    if (!result) return null;
    return mapDbToDomain(result);
  }

  /**
   * Buscar todas as invoices
   */
  async findAll(filters?: InvoiceFilters): Promise<Invoice[]> {
    const where = this.buildWhereClause(filters);

    const results = await db
      .select()
      .from(billing)
      .where(where)
      .orderBy(desc(billing.dueDate));

    return results.map(mapDbToDomain);
  }

  /**
   * Buscar invoices com paginação
   */
  async findPaginated(filters?: InvoiceFilters & { page?: number; limit?: number }): Promise<PaginatedInvoiceResult> {
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 10;
    const offset = (page - 1) * limit;

    const where = this.buildWhereClause(filters);

    // Buscar total
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(billing)
      .where(where);
    const total = Number(totalResult[0]?.count ?? 0);

    // Buscar dados paginados
    const results = await db
      .select()
      .from(billing)
      .where(where)
      .orderBy(desc(billing.dueDate))
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
   * Criar nova invoice
   */
  async create(invoice: Invoice): Promise<Invoice> {
    const dbData = mapDomainToDb(invoice);

    const result = await db
      .insert(billing)
      .values(dbData)
      .returning();

    return mapDbToDomain(result[0]);
  }

  /**
   * Atualizar invoice
   */
  async update(invoice: Invoice): Promise<Invoice> {
    const dbData = mapDomainToDb(invoice);

    const result = await db
      .update(billing)
      .set(dbData)
      .where(eq(billing.id, parseInt(invoice.id)))
      .returning();

    if (!result[0]) {
      throw new Error('Invoice not found');
    }

    return mapDbToDomain(result[0]);
  }

  /**
   * Deletar invoice (soft delete via entity)
   */
  async delete(id: string): Promise<void> {
    await db.delete(billing).where(eq(billing.id, parseInt(id)));
  }

  /**
   * Buscar invoices por status
   */
  async findByStatus(status: BillingStatus): Promise<Invoice[]> {
    const results = await db
      .select()
      .from(billing)
      .where(eq(billing.status, status))
      .orderBy(desc(billing.dueDate));

    return results.map(mapDbToDomain);
  }

  /**
   * Buscar invoices por plano de assinatura
   */
  async findBySubscriptionPlan(plan: string): Promise<Invoice[]> {
    const results = await db
      .select()
      .from(billing)
      .where(eq(billing.subscriptionPlan, plan))
      .orderBy(desc(billing.dueDate));

    return results.map(mapDbToDomain);
  }

  /**
   * Buscar invoices vencidas
   */
  async findOverdueInvoices(): Promise<Invoice[]> {
    const now = new Date().toISOString().split('T')[0];

    const results = await db
      .select()
      .from(billing)
      .where(
        and(
          lte(billing.dueDate, now),
          eq(billing.status, BillingStatus.PENDING)
        )
      )
      .orderBy(desc(billing.dueDate));

    return results.map(mapDbToDomain);
  }

  /**
   * Buscar resumo de billing
   */
  async findSummary(filters?: InvoiceFilters): Promise<BillingSummary> {
    const where = this.buildWhereClause(filters);

    // Total billed
    const totalBilledResult = await db
      .select({ value: sum(billing.amount) })
      .from(billing)
      .where(where);

    // Total paid
    const totalPaidResult = await db
      .select({ value: sum(billing.amount) })
      .from(billing)
      .where(where ? and(where, eq(billing.status, BillingStatus.PAID)) : eq(billing.status, BillingStatus.PAID));

    // Total pending
    const totalPendingResult = await db
      .select({ value: sum(billing.amount) })
      .from(billing)
      .where(where ? and(where, eq(billing.status, BillingStatus.PENDING)) : eq(billing.status, BillingStatus.PENDING));

    // Total overdue
    const totalOverdueResult = await db
      .select({ value: sum(billing.amount) })
      .from(billing)
      .where(where ? and(where, eq(billing.status, BillingStatus.OVERDUE)) : eq(billing.status, BillingStatus.OVERDUE));

    // Count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(billing)
      .where(where);

    const totalBilled = Number(totalBilledResult[0]?.value ?? 0);
    const totalPaid = Number(totalPaidResult[0]?.value ?? 0);
    const totalPending = Number(totalPendingResult[0]?.value ?? 0);
    const totalOverdue = Number(totalOverdueResult[0]?.value ?? 0);
    const count = Number(countResult[0]?.count ?? 0);

    return {
      totalBilled,
      totalPaid,
      totalPending,
      totalOverdue,
      count,
    };
  }

  /**
   * Buscar invoice por número
   */
  async findByInvoiceNumber(invoiceNumber: string): Promise<Invoice | null> {
    const result = await db.query.billing.findFirst({
      where: eq(billing.invoiceNumber, invoiceNumber),
    });

    if (!result) return null;
    return mapDbToDomain(result);
  }

  /**
   * Construir cláusula WHERE dinâmica
   */
  private buildWhereClause(filters?: InvoiceFilters) {
    const conditions = [];

    if (filters?.status) {
      conditions.push(eq(billing.status, filters.status));
    }

    if (filters?.subscriptionPlan) {
      conditions.push(eq(billing.subscriptionPlan, filters.subscriptionPlan));
    }

    if (filters?.dueDateFrom) {
      conditions.push(gte(billing.dueDate, filters.dueDateFrom.toISOString().split('T')[0]));
    }

    if (filters?.dueDateTo) {
      conditions.push(lte(billing.dueDate, filters.dueDateTo.toISOString().split('T')[0]));
    }

    if (filters?.clientName) {
      conditions.push(sql`${billing.clientName} ILIKE ${`%${filters.clientName}%`}`);
    }

    // Excluir deletados
    conditions.push(eq(billing.deletedAt, null));

    if (conditions.length === 0) {
      return undefined;
    }

    return conditions.length === 1 ? conditions[0] : and(...conditions);
  }
}
