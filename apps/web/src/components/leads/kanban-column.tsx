'use client'

import { LeadCard } from "./lead-card"
import { Lead, LeadColumnId } from "@/types/lead"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface KanbanColumnProps {
  id: LeadColumnId
  title: string
  color: string
  leads: Lead[]
  onLeadClick?: (lead: Lead) => void
  onAddLead?: () => void
}

export function KanbanColumn({
  id,
  title,
  color,
  leads,
  onLeadClick,
  onAddLead,
}: KanbanColumnProps) {
  return (
    <div className="flex flex-col h-full bg-secondary/20 rounded-lg p-4 min-w-[300px] max-w-[300px]">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`h-3 w-3 rounded-full ${color}`} />
          <h3 className="font-semibold text-sm">{title}</h3>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {leads.length}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onAddLead}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} onClick={onLeadClick} />
        ))}
      </div>
    </div>
  )
}
