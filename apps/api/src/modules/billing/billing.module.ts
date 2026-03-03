/**
 * Billing Module Composition Root
 *
 * Configura injeção de dependência para o módulo Billing
 * Este é o ponto de composição do módulo
 */

import { PostgresInvoiceRepository } from '@infrastructure/database/adapters/invoice-repository.adapter';
import { PostgresPaymentRepository } from '@infrastructure/database/adapters/payment-repository.adapter';
import { BillingController } from '@infrastructure/http/adapters/billing.controller';
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

/**
 * Cria e configura todas as dependências do módulo Billing
 */
export function createBillingModule(): BillingController {
  // Infrastructure layer (repository adapters)
  const invoiceRepository = new PostgresInvoiceRepository();
  const paymentRepository = new PostgresPaymentRepository();

  // Application layer (use cases - Invoice)
  const generateInvoiceUseCase = new GenerateInvoiceUseCase(invoiceRepository);
  const updateInvoiceUseCase = new UpdateInvoiceUseCase(invoiceRepository);
  const cancelInvoiceUseCase = new CancelInvoiceUseCase(invoiceRepository);
  const listInvoicesUseCase = new ListInvoicesUseCase(invoiceRepository);
  const getInvoiceUseCase = new GetInvoiceUseCase(invoiceRepository);
  const getBillingSummaryUseCase = new GetBillingSummaryUseCase(invoiceRepository);

  // Application layer (use cases - Payment)
  const processPaymentUseCase = new ProcessPaymentUseCase(paymentRepository, invoiceRepository);
  const approvePaymentUseCase = new ApprovePaymentUseCase(paymentRepository, invoiceRepository);
  const refundPaymentUseCase = new RefundPaymentUseCase(paymentRepository);
  const listPaymentsUseCase = new ListPaymentsUseCase(paymentRepository);
  const getPaymentUseCase = new GetPaymentUseCase(paymentRepository);

  // Infrastructure layer (HTTP controller)
  const billingController = new BillingController(
    generateInvoiceUseCase,
    updateInvoiceUseCase,
    cancelInvoiceUseCase,
    listInvoicesUseCase,
    getInvoiceUseCase,
    getBillingSummaryUseCase,
    processPaymentUseCase,
    approvePaymentUseCase,
    refundPaymentUseCase,
    listPaymentsUseCase,
    getPaymentUseCase
  );

  return billingController;
}
