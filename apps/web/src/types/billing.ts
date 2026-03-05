export interface Invoice {
  id: number
  clientName: string
  amount: number
  dueDate: string
  status: 'PAID' | 'PENDING' | 'OVERDUE' | 'CANCELLED'
  invoiceNumber?: string | null
  subscriptionPlan?: string | null
  description?: string | null
  paidAt?: string | null
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export interface Payment {
  id: number
  invoiceId: number
  amount: number
  method: 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX' | 'BOLETO' | 'BANK_TRANSFER' | 'PAYPAL' | 'STRIPE'
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REFUNDED' | 'CHARGEBACK'
  transactionId?: string | null
  paidAt?: string | null
  refundedAt?: string | null
  refundReason?: string | null
  metadata?: any | null
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export interface CreateInvoiceDTO {
  clientName: string
  amount: number
  dueDate: string
  invoiceNumber?: string
  subscriptionPlan?: string
  description?: string
}

export interface CreatePaymentDTO {
  invoiceId: number
  amount: number
  method: Payment['method']
  transactionId?: string
}

export interface UpdateInvoiceDTO extends Partial<CreateInvoiceDTO> {
  id: number
}

export interface BillingSummary {
  totalBilled: number
  totalPaid: number
  totalPending: number
  totalOverdue: number
  count: number
}

export const INVOICE_STATUS = [
  { id: 'PENDING', label: 'Pending', color: 'bg-yellow-400' },
  { id: 'PAID', label: 'Paid', color: 'bg-green-500' },
  { id: 'OVERDUE', label: 'Overdue', color: 'bg-red-500' },
  { id: 'CANCELLED', label: 'Cancelled', color: 'bg-slate-400' },
] as const

export const PAYMENT_STATUS = [
  { id: 'PENDING', label: 'Pending', color: 'bg-yellow-400' },
  { id: 'APPROVED', label: 'Approved', color: 'bg-green-500' },
  { id: 'REJECTED', label: 'Rejected', color: 'bg-red-500' },
  { id: 'REFUNDED', label: 'Refunded', color: 'bg-blue-400' },
  { id: 'CHARGEBACK', label: 'Chargeback', color: 'bg-purple-500' },
] as const

export const PAYMENT_METHODS = [
  { id: 'CREDIT_CARD', label: 'Credit Card', icon: '💳' },
  { id: 'DEBIT_CARD', label: 'Debit Card', icon: '💳' },
  { id: 'PIX', label: 'PIX', icon: '⚡' },
  { id: 'BOLETO', label: 'Boleto', icon: '📄' },
  { id: 'BANK_TRANSFER', label: 'Bank Transfer', icon: '🏦' },
  { id: 'PAYPAL', label: 'PayPal', icon: '🅿️' },
  { id: 'STRIPE', label: 'Stripe', icon: '💙' },
] as const

export type InvoiceStatus = typeof INVOICE_STATUS[number]['id']
export type PaymentStatus = typeof PAYMENT_STATUS[number]['id']
export type PaymentMethod = typeof PAYMENT_METHODS[number]['id']
