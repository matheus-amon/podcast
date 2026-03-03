/**
 * Billing Controller
 *
 * Controller HTTP para operações de Billing (Invoices e Payments)
 * Expõe endpoints RESTful para a API
 */

import { Elysia, t } from 'elysia';
import { GenerateInvoiceUseCase } from '@application/billing/use-cases/generate-invoice.use-case';
import { UpdateInvoiceUseCase } from '@application/billing/use-cases/update-invoice.use-case';
import { CancelInvoiceUseCase } from '@application/billing/use-cases/cancel-invoice.use-case';
import { ListInvoicesUseCase } from '@application/billing/use-cases/list-invoices.use-case';
import { GetInvoiceUseCase } from '@application/billing/use-cases/get-invoice.use-case';
import { GetBillingSummaryUseCase } from '@application/billing/use-cases/get-billing-summary.use-case';
import { ProcessPaymentUseCase } from '@application/billing/use-cases/process-payment.use-case';
import { ApprovePaymentUseCase } from '@application/billing/use-cases/approve-payment.use-case';
import { RefundPaymentUseCase } from '@application/billing/use-cases/refund-payment.use-case';
import { ListPaymentsUseCase } from '@application/billing/use-cases/list-payments.use-case';
import { GetPaymentUseCase } from '@application/billing/use-cases/get-payment.use-case';
import { BillingStatus } from '@domain/billing/value-objects/billing-status.enum';
import { PaymentMethod } from '@domain/billing/value-objects/payment-method.enum';
import { PaymentStatus } from '@domain/billing/value-objects/payment-status.enum';

export class BillingController {
  public routes: Elysia;

  constructor(
    private readonly generateInvoiceUseCase: GenerateInvoiceUseCase,
    private readonly updateInvoiceUseCase: UpdateInvoiceUseCase,
    private readonly cancelInvoiceUseCase: CancelInvoiceUseCase,
    private readonly listInvoicesUseCase: ListInvoicesUseCase,
    private readonly getInvoiceUseCase: GetInvoiceUseCase,
    private readonly getBillingSummaryUseCase: GetBillingSummaryUseCase,
    private readonly processPaymentUseCase: ProcessPaymentUseCase,
    private readonly approvePaymentUseCase: ApprovePaymentUseCase,
    private readonly refundPaymentUseCase: RefundPaymentUseCase,
    private readonly listPaymentsUseCase: ListPaymentsUseCase,
    private readonly getPaymentUseCase: GetPaymentUseCase
  ) {
    this.routes = this.createRoutes();
  }

  /**
   * Cria as rotas do controller
   */
  private createRoutes(): Elysia {
    return new Elysia({ prefix: '/billing' })
      // ==================== INVOICES ====================
      
      // GET /billing/invoices - Listar todas as invoices
      .get(
        '/invoices',
        async ({ query }) => {
          const filters = {
            page: query.page,
            limit: query.limit,
            status: query.status as BillingStatus | undefined,
            subscriptionPlan: query.subscriptionPlan,
            dueDateFrom: query.dueDateFrom ? new Date(query.dueDateFrom) : undefined,
            dueDateTo: query.dueDateTo ? new Date(query.dueDateTo) : undefined,
            clientName: query.clientName,
          };

          const result = await this.listInvoicesUseCase.execute(filters);

          return {
            data: result.data.map((invoice) => this.invoiceToResponse(invoice)),
            pagination: {
              page: result.page,
              limit: result.limit,
              total: result.total,
              totalPages: result.totalPages,
            },
          };
        },
        {
          query: t.Object({
            page: t.Optional(t.Number()),
            limit: t.Optional(t.Number()),
            status: t.Optional(t.Enum(BillingStatus)),
            subscriptionPlan: t.Optional(t.String()),
            dueDateFrom: t.Optional(t.String({ format: 'date-time' })),
            dueDateTo: t.Optional(t.String({ format: 'date-time' })),
            clientName: t.Optional(t.String()),
          }),
        }
      )

      // GET /billing/invoices/summary - Resumo de billing
      .get(
        '/invoices/summary',
        async ({ query }) => {
          const filters = {
            status: query.status as BillingStatus | undefined,
            subscriptionPlan: query.subscriptionPlan,
            dueDateFrom: query.dueDateFrom ? new Date(query.dueDateFrom) : undefined,
            dueDateTo: query.dueDateTo ? new Date(query.dueDateTo) : undefined,
          };

          const summary = await this.getBillingSummaryUseCase.execute(filters);

          return {
            totalBilled: summary.totalBilled,
            totalPaid: summary.totalPaid,
            totalPending: summary.totalPending,
            totalOverdue: summary.totalOverdue,
            count: summary.count,
          };
        },
        {
          query: t.Optional(
            t.Object({
              status: t.Optional(t.Enum(BillingStatus)),
              subscriptionPlan: t.Optional(t.String()),
              dueDateFrom: t.Optional(t.String({ format: 'date-time' })),
              dueDateTo: t.Optional(t.String({ format: 'date-time' })),
            })
          ),
        }
      )

      // GET /billing/invoices/:id - Buscar invoice por ID
      .get(
        '/invoices/:id',
        async ({ params }) => {
          const invoice = await this.getInvoiceUseCase.execute({ id: params.id });
          return this.invoiceToResponse(invoice);
        },
        {
          params: t.Object({
            id: t.String(),
          }),
        }
      )

      // POST /billing/invoices - Gerar nova invoice
      .post(
        '/invoices',
        async ({ body }) => {
          const invoice = await this.generateInvoiceUseCase.execute({
            clientName: body.clientName,
            amount: body.amount,
            dueDate: new Date(body.dueDate),
            invoiceNumber: body.invoiceNumber,
            subscriptionPlan: body.subscriptionPlan,
            description: body.description,
          });

          return this.invoiceToResponse(invoice);
        },
        {
          body: t.Object({
            clientName: t.String(),
            amount: t.Number(),
            dueDate: t.String({ format: 'date-time' }),
            invoiceNumber: t.Optional(t.String()),
            subscriptionPlan: t.Optional(t.String()),
            description: t.Optional(t.String()),
          }),
        }
      )

      // PUT /billing/invoices/:id - Atualizar invoice
      .put(
        '/invoices/:id',
        async ({ params, body }) => {
          const invoice = await this.updateInvoiceUseCase.execute({
            id: params.id,
            clientName: body.clientName,
            amount: body.amount,
            dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
            invoiceNumber: body.invoiceNumber,
            subscriptionPlan: body.subscriptionPlan,
            description: body.description,
            status: body.status,
          });

          return this.invoiceToResponse(invoice);
        },
        {
          params: t.Object({
            id: t.String(),
          }),
          body: t.Object({
            clientName: t.Optional(t.String()),
            amount: t.Optional(t.Number()),
            dueDate: t.Optional(t.String({ format: 'date-time' })),
            invoiceNumber: t.Optional(t.String()),
            subscriptionPlan: t.Optional(t.String()),
            description: t.Optional(t.String()),
            status: t.Optional(t.Enum(BillingStatus)),
          }),
        }
      )

      // POST /billing/invoices/:id/cancel - Cancelar invoice
      .post(
        '/invoices/:id/cancel',
        async ({ params }) => {
          const invoice = await this.cancelInvoiceUseCase.execute({ id: params.id });
          return this.invoiceToResponse(invoice);
        },
        {
          params: t.Object({
            id: t.String(),
          }),
        }
      )

      // ==================== PAYMENTS ====================

      // GET /billing/payments - Listar todos os payments
      .get(
        '/payments',
        async ({ query }) => {
          const filters = {
            page: query.page,
            limit: query.limit,
            status: query.status as PaymentStatus | undefined,
            invoiceId: query.invoiceId,
            method: query.method as PaymentMethod | undefined,
            dateFrom: query.dateFrom ? new Date(query.dateFrom) : undefined,
            dateTo: query.dateTo ? new Date(query.dateTo) : undefined,
          };

          const result = await this.listPaymentsUseCase.execute(filters);

          return {
            data: result.data.map((payment) => this.paymentToResponse(payment)),
            pagination: {
              page: result.page,
              limit: result.limit,
              total: result.total,
              totalPages: result.totalPages,
            },
          };
        },
        {
          query: t.Object({
            page: t.Optional(t.Number()),
            limit: t.Optional(t.Number()),
            status: t.Optional(t.Enum(PaymentStatus)),
            invoiceId: t.Optional(t.String()),
            method: t.Optional(t.Enum(PaymentMethod)),
            dateFrom: t.Optional(t.String({ format: 'date-time' })),
            dateTo: t.Optional(t.String({ format: 'date-time' })),
          }),
        }
      )

      // GET /billing/payments/:id - Buscar payment por ID
      .get(
        '/payments/:id',
        async ({ params }) => {
          const payment = await this.getPaymentUseCase.execute({ id: params.id });
          return this.paymentToResponse(payment);
        },
        {
          params: t.Object({
            id: t.String(),
          }),
        }
      )

      // POST /billing/payments - Processar pagamento
      .post(
        '/payments',
        async ({ body }) => {
          const result = await this.processPaymentUseCase.execute({
            invoiceId: body.invoiceId,
            amount: body.amount,
            method: body.method,
            transactionId: body.transactionId,
            autoApprove: body.autoApprove ?? true,
          });

          return {
            payment: this.paymentToResponse(result.payment),
            invoice: this.invoiceToResponse(result.invoice),
          };
        },
        {
          body: t.Object({
            invoiceId: t.String(),
            amount: t.Optional(t.Number()),
            method: t.Enum(PaymentMethod),
            transactionId: t.Optional(t.String()),
            autoApprove: t.Optional(t.Boolean()),
          }),
        }
      )

      // POST /billing/payments/:id/approve - Aprovar payment
      .post(
        '/payments/:id/approve',
        async ({ params }) => {
          const result = await this.approvePaymentUseCase.execute({
            paymentId: params.id,
          });

          return {
            payment: this.paymentToResponse(result.payment),
            invoice: this.invoiceToResponse(result.invoice),
          };
        },
        {
          params: t.Object({
            id: t.String(),
          }),
        }
      )

      // POST /billing/payments/:id/refund - Estornar payment
      .post(
        '/payments/:id/refund',
        async ({ params, body }) => {
          const payment = await this.refundPaymentUseCase.execute({
            paymentId: params.id,
            reason: body.reason,
          });

          return this.paymentToResponse(payment);
        },
        {
          params: t.Object({
            id: t.String(),
          }),
          body: t.Object({
            reason: t.String(),
          }),
        }
      );
  }

  /**
   * Mapeia Invoice entity para resposta HTTP
   */
  private invoiceToResponse(invoice: any): any {
    return {
      id: invoice.id,
      clientName: invoice.clientName,
      amount: invoice.amount,
      dueDate: invoice.dueDate instanceof Date ? invoice.dueDate.toISOString() : invoice.dueDate,
      status: invoice.status,
      invoiceNumber: invoice.invoiceNumber,
      subscriptionPlan: invoice.subscriptionPlan,
      description: invoice.description,
      paidAt: invoice.paidAt instanceof Date ? invoice.paidAt.toISOString() : invoice.paidAt,
      createdAt: invoice.createdAt instanceof Date ? invoice.createdAt.toISOString() : invoice.createdAt,
      updatedAt: invoice.updatedAt instanceof Date ? invoice.updatedAt.toISOString() : invoice.updatedAt,
    };
  }

  /**
   * Mapeia Payment entity para resposta HTTP
   */
  private paymentToResponse(payment: any): any {
    return {
      id: payment.id,
      invoiceId: payment.invoiceId,
      amount: payment.amount,
      method: payment.method,
      status: payment.status,
      transactionId: payment.transactionId,
      paidAt: payment.paidAt instanceof Date ? payment.paidAt.toISOString() : payment.paidAt,
      refundedAt: payment.refundedAt instanceof Date ? payment.refundedAt.toISOString() : payment.refundedAt,
      refundReason: payment.refundReason,
      metadata: payment.metadata,
      createdAt: payment.createdAt instanceof Date ? payment.createdAt.toISOString() : payment.createdAt,
      updatedAt: payment.updatedAt instanceof Date ? payment.updatedAt.toISOString() : payment.updatedAt,
    };
  }
}
