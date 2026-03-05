'use client'

import { useState } from "react"
import { BillingKPICards } from "@/components/billing/billing-kpi-cards"
import { InvoiceDialog } from "@/components/billing/invoice-dialog"
import { DataTable } from "@/components/episodes/episode-table"
import { useInvoiceColumns } from "@/components/billing/invoice-columns"
import { PageHeader } from "@/components/dashboard/page-header"
import { Button } from "@/components/ui/button"
import { useInvoices, useCancelInvoice, useProcessPayment } from "@/hooks/use-billing"
import { Invoice } from "@/types/billing"
import { Plus } from "lucide-react"

export default function BillingPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)

  const { data: invoices = [], isLoading, error } = useInvoices()
  const cancelInvoice = useCancelInvoice()
  const processPayment = useProcessPayment()

  const columns = useInvoiceColumns({
    onPay: async (invoice) => {
      try {
        await processPayment.mutateAsync({
          invoiceId: invoice.id,
          amount: invoice.amount,
          method: 'PIX',
        })
      } catch (error) {
        console.error("Failed to process payment:", error)
      }
    },
    onCancel: async (invoice) => {
      if (confirm(`Are you sure you want to cancel invoice #${invoice.id}?`)) {
        await cancelInvoice.mutateAsync(invoice.id)
      }
    },
  })

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Failed to load invoices</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing"
        description="Manage your invoices and payments."
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        }
      />

      {/* KPI Cards */}
      <BillingKPICards />

      {/* Invoice Table */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
            <p className="text-muted-foreground">Loading invoices...</p>
          </div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={invoices}
          searchKey="clientName"
          searchPlaceholder="Search invoices..."
          pageSize={10}
        />
      )}

      <InvoiceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        invoice={selectedInvoice}
      />
    </div>
  )
}
