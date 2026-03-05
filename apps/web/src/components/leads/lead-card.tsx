'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Lead, LeadColumnId } from "@/types/lead"
import { Mail, Phone } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface LeadCardProps {
  lead: Lead
  onClick?: (lead: Lead) => void
}

export function LeadCard({ lead, onClick }: LeadCardProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
  }

  const getStatusVariant = (status: Lead['status']) => {
    switch (status) {
      case 'CONFIRMED':
      case 'RECORDED':
        return 'success' as const
      case 'CONTACTED':
        return 'default' as const
      case 'PROSPECT':
        return 'secondary' as const
      default:
        return 'outline' as const
    }
  }

  return (
    <Card
      className="p-4 cursor-pointer hover:shadow-md transition-shadow bg-card"
      onClick={() => onClick?.(lead)}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={lead.avatarUrl || undefined} alt={lead.name} />
            <AvatarFallback className="text-xs">
              {getInitials(lead.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm truncate">{lead.name}</h4>
            {lead.position && (
              <p className="text-xs text-muted-foreground truncate">
                {lead.position}
                {lead.company && ` at ${lead.company}`}
              </p>
            )}
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-1.5">
          {lead.email && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Mail className="h-3 w-3" />
              <span className="truncate">{lead.email}</span>
            </div>
          )}
          {lead.phone && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Phone className="h-3 w-3" />
              <span>{lead.phone}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t">
          <Badge variant={getStatusVariant(lead.status)} className="text-xs">
            {lead.status}
          </Badge>
          {lead.lastContact && (
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(lead.lastContact), {
                addSuffix: true,
                locale: ptBR,
              })}
            </span>
          )}
        </div>
      </div>
    </Card>
  )
}
