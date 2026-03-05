'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getInvoices,
  getBillingSummary,
  createInvoice,
  updateInvoice,
  cancelInvoice,
  processPayment,
  approvePayment,
  refundPayment,
} from './use-billing-api'
import type { CreateInvoiceDTO, CreatePaymentDTO } from '@/types/billing'

export function useInvoices() {
  return useQuery({
    queryKey: ['billing', 'invoices'],
    queryFn: getInvoices,
  })
}

export function useBillingSummary() {
  return useQuery({
    queryKey: ['billing', 'summary'],
    queryFn: getBillingSummary,
  })
}

export function useCreateInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateInvoiceDTO) => createInvoice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing', 'invoices'] })
      queryClient.invalidateQueries({ queryKey: ['billing', 'summary'] })
    },
  })
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { id: number } & Partial<CreateInvoiceDTO>) =>
      updateInvoice(data as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing', 'invoices'] })
      queryClient.invalidateQueries({ queryKey: ['billing', 'summary'] })
    },
  })
}

export function useCancelInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => cancelInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing', 'invoices'] })
      queryClient.invalidateQueries({ queryKey: ['billing', 'summary'] })
    },
  })
}

export function useProcessPayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePaymentDTO) => processPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing', 'invoices'] })
      queryClient.invalidateQueries({ queryKey: ['billing', 'summary'] })
    },
  })
}

export function useApprovePayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (paymentId: number) => approvePayment(paymentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing', 'invoices'] })
    },
  })
}

export function useRefundPayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ paymentId, reason }: { paymentId: number; reason: string }) =>
      refundPayment(paymentId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing', 'invoices'] })
    },
  })
}
