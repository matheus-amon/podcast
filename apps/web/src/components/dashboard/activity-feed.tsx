'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Mic } from "lucide-react"

interface ActivityFeedProps {
  recentLeads?: Array<{
    id: number
    name: string
    company?: string | null
    avatarUrl?: string | null
  }>
  recentEpisodes?: Array<{
    id: number
    title: string
    status: string
  }>
}

export function ActivityFeed({ recentLeads = [], recentEpisodes = [] }: ActivityFeedProps) {
  const hasNoData = recentLeads.length === 0 && recentEpisodes.length === 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest actions across the platform.</CardDescription>
      </CardHeader>
      <CardContent>
        {hasNoData ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No recent activity
          </div>
        ) : (
          <div className="space-y-6">
            {/* Recent Leads */}
            {recentLeads.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-sm font-medium">New Leads</h4>
                {recentLeads.slice(0, 3).map((lead) => (
                  <div key={lead.id} className="flex items-center">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={lead.avatarUrl || undefined} alt={lead.name} />
                      <AvatarFallback>
                        {lead.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">{lead.name}</p>
                      {lead.company && (
                        <p className="text-sm text-muted-foreground">{lead.company}</p>
                      )}
                    </div>
                    <div className="ml-auto font-medium text-xs text-muted-foreground">
                      New Lead
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Recent Episodes */}
            {recentEpisodes.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Recent Episodes</h4>
                {recentEpisodes.slice(0, 3).map((ep) => (
                  <div key={ep.id} className="flex items-center">
                    <div className="h-9 w-9 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <Mic className="h-4 w-4" />
                    </div>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">{ep.title}</p>
                      <p className="text-sm text-muted-foreground">{ep.status}</p>
                    </div>
                    <div className="ml-auto font-medium text-xs text-muted-foreground">
                      Episode
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
