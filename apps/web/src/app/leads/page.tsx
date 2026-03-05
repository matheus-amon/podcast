'use client'

import { useState } from "react"
import { KanbanBoard } from "@/components/leads/kanban-board"
import { LeadDialog } from "@/components/leads/lead-dialog"
import { PageHeader } from "@/components/dashboard/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useLeads, useUpdateLeadStatus } from "@/hooks/use-leads"
import { Lead, LeadColumnId } from "@/types/lead"
import { Plus, Search } from "lucide-react"

export default function LeadsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [defaultStatus, setDefaultStatus] = useState<Lead["status"] | undefined>()
  const [search, setSearch] = useState("")

  const { data: leads = [], isLoading, error } = useLeads()

  const handleAddLead = (columnId: LeadColumnId) => {
    setDefaultStatus(columnId)
    setDialogOpen(true)
  }

  const handleLeadsChange = (updatedLeads: Lead[]) => {
    // Optimistic update handled by React Query
  }

  const filteredLeads = leads.filter((lead) =>
    lead.name.toLowerCase().includes(search.toLowerCase()) ||
    lead.email.toLowerCase().includes(search.toLowerCase()) ||
    (lead.company && lead.company.toLowerCase().includes(search.toLowerCase()))
  )

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Failed to load leads</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <PageHeader
        title="Leads Pipeline"
        description="Manage your podcast guests and leads."
        actions={
          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search leads..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Lead
            </Button>
          </div>
        }
      />

      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
              <p className="text-muted-foreground">Loading leads...</p>
            </div>
          </div>
        ) : (
          <KanbanBoard
            leads={filteredLeads}
            onLeadsChange={handleLeadsChange}
            onLeadClick={(lead) => console.log("Clicked lead:", lead)}
            onAddLead={handleAddLead}
          />
        )}
      </div>

      <LeadDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultStatus={defaultStatus}
      />
    </div>
  )
}
