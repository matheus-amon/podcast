'use client'

import { useState } from "react"
import { EpisodeDialog } from "@/components/episodes/episode-dialog"
import { DataTable } from "@/components/episodes/episode-table"
import { useEpisodeColumns } from "@/components/episodes/episode-columns"
import { PageHeader } from "@/components/dashboard/page-header"
import { Button } from "@/components/ui/button"
import { useEpisodes, useDeleteEpisode } from "@/hooks/use-episodes"
import { Episode } from "@/types/episode"
import { Plus } from "lucide-react"

export default function EpisodesPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null)

  const { data: episodes = [], isLoading, error } = useEpisodes()
  const deleteEpisode = useDeleteEpisode()

  const columns = useEpisodeColumns({
    onEdit: (episode) => {
      setSelectedEpisode(episode)
      setDialogOpen(true)
    },
  })

  const handleDelete = async (episode: Episode) => {
    if (confirm(`Are you sure you want to delete "${episode.title}"?`)) {
      await deleteEpisode.mutateAsync(episode.id)
    }
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Failed to load episodes</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Episodes"
        description="Manage your podcast episodes."
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Episode
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
            <p className="text-muted-foreground">Loading episodes...</p>
          </div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={episodes}
          searchKey="title"
          searchPlaceholder="Search episodes..."
          pageSize={10}
        />
      )}

      <EpisodeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        episode={selectedEpisode}
      />
    </div>
  )
}
