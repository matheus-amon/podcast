'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Episode, EPISODE_STATUS } from '@/types/episode'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Mic } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface UseEpisodeColumnsProps {
  onEdit?: (episode: Episode) => void
  onDelete?: (episode: Episode) => void
}

export function useEpisodeColumns({ onEdit, onDelete }: UseEpisodeColumnsProps = {}): ColumnDef<Episode>[] {
  const getStatusVariant = (status: Episode['status']) => {
    switch (status) {
      case 'PUBLISHED':
        return 'success' as const
      case 'RECORDED':
        return 'default' as const
      case 'EDITING':
        return 'warning' as const
      case 'SCRIPTING':
        return 'secondary' as const
      case 'PLANNED':
        return 'outline' as const
      default:
        return 'outline' as const
    }
  }

  return [
    {
      accessorKey: 'title',
      header: 'Episode',
      cell: ({ row }) => {
        const episode = row.original
        return (
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <Mic className="h-4 w-4" />
            </div>
            <div>
              <div className="font-medium">{episode.title}</div>
              {episode.description && (
                <div className="text-xs text-muted-foreground truncate max-w-md">
                  {episode.description}
                </div>
              )}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'season',
      header: 'Season',
      cell: ({ row }) => {
        const season = row.original.season
        const number = row.original.number
        if (!season && !number) return '-'
        return (
          <div className="text-sm">
            {season && `S${season}`}
            {number && ` E${number}`}
          </div>
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status
        return (
          <Badge variant={getStatusVariant(status)}>
            {EPISODE_STATUS.find((s) => s.id === status)?.label || status}
          </Badge>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: 'publishDate',
      header: 'Publish Date',
      cell: ({ row }) => {
        const date = row.original.publishDate
        if (!date) return '-'
        return (
          <div className="text-sm">
            {format(new Date(date), 'MMM d, yyyy', { locale: ptBR })}
          </div>
        )
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const episode = row.original
        return (
          <div className="flex items-center gap-2">
            {onEdit && (
              <Button variant="ghost" size="sm" onClick={() => onEdit(episode)}>
                Edit
              </Button>
            )}
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        )
      },
    },
  ]
}
