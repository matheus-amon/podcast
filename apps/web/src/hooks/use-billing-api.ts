import { fetchAPI } from "@/lib/api"
import type { Invoice, Payment, CreateInvoiceDTO, CreatePaymentDTO, UpdateInvoiceDTO, BillingSummary } from "@/types/billing"

export async function getInvoices(): Promise<Invoice[]> {
  return fetchAPI('/api/billing/invoices')
}

export async function getBillingSummary(): Promise<BillingSummary> {
  return fetchAPI('/api/billing/invoices/summary')
}

export async function createInvoice(data: CreateInvoiceDTO): Promise<Invoice> {
  return fetchAPI('/api/billing/invoices', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateInvoice(data: UpdateInvoiceDTO): Promise<Invoice> {
  return fetchAPI(`/api/billing/invoices/${data.id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function cancelInvoice(id: number): Promise<Invoice> {
  return fetchAPI(`/api/billing/invoices/${id}/cancel`, {
    method: 'POST',
  })
}

export async function processPayment(data: CreatePaymentDTO): Promise<{ payment: Payment; invoice: Invoice }> {
  return fetchAPI('/api/billing/payments', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function approvePayment(paymentId: number): Promise<{ payment: Payment; invoice: Invoice }> {
  return fetchAPI(`/api/billing/payments/${paymentId}/approve`, {
    method: 'POST',
  })
}

export async function refundPayment(paymentId: number, reason: string): Promise<Payment> {
  return fetchAPI(`/api/billing/payments/${paymentId}/refund`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  })
}
