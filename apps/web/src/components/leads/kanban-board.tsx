'use client'

import { KanbanColumn } from "./kanban-column"
import { Lead, LEAD_COLUMNS, LeadColumnId } from "@/types/lead"
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core"
import { LeadCard } from "./lead-card"
import { useState } from "react"

interface KanbanBoardProps {
  leads: Lead[]
  onLeadsChange: (leads: Lead[]) => void
  onLeadClick?: (lead: Lead) => void
  onAddLead?: (columnId: LeadColumnId) => void
}

export function KanbanBoard({
  leads,
  onLeadsChange,
  onLeadClick,
  onAddLead,
}: KanbanBoardProps) {
  const [activeLead, setActiveLead] = useState<Lead | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const leadId = Number(event.active.id)
    const lead = leads.find((l) => l.id === leadId)
    if (lead) {
      setActiveLead(lead)
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = Number(active.id)
    const overId = over.id

    // Find the column we're hovering over
    const overColumn = LEAD_COLUMNS.find((col) => overId === col.id)
    if (!overColumn) return

    const activeLead = leads.find((l) => l.id === activeId)
    if (!activeLead || activeLead.status === overColumn.id) return

    // Update lead status optimistically
    const updatedLeads = leads.map((lead) =>
      lead.id === activeId ? { ...lead, status: overColumn.id } : lead
    )
    onLeadsChange(updatedLeads)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveLead(null)

    if (!over) return

    const activeId = Number(active.id)
    const overId = over.id

    const overColumn = LEAD_COLUMNS.find((col) => overId === col.id)
    if (!overColumn) return

    const lead = leads.find((l) => l.id === activeId)
    if (!lead || lead.status === overColumn.id) return

    // API call to update status
    try {
      const response = await fetch(`/api/leads/${activeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: overColumn.id }),
      })

      if (!response.ok) {
        // Revert on error
        const updatedLeads = leads.map((l) =>
          l.id === activeId ? { ...l, status: lead.status } : l
        )
        onLeadsChange(updatedLeads)
      }
    } catch (error) {
      console.error('Failed to update lead status:', error)
      // Revert on error
      const updatedLeads = leads.map((l) =>
        l.id === activeId ? { ...l, status: lead.status } : l
      )
      onLeadsChange(updatedLeads)
    }
  }

  const getLeadsByColumn = (columnId: LeadColumnId) => {
    return leads.filter((lead) => lead.status === columnId)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-full gap-4 overflow-x-auto pb-4">
        {LEAD_COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            color={column.color}
            leads={getLeadsByColumn(column.id)}
            onLeadClick={onLeadClick}
            onAddLead={onAddLead ? () => onAddLead(column.id) : undefined}
          />
        ))}
      </div>

      <DragOverlay>
        {activeLead && (
          <div className="w-[280px] rotate-3 shadow-xl">
            <LeadCard lead={activeLead} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
