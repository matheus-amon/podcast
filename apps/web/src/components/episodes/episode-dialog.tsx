'use client'

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useCreateEpisode, useUpdateEpisode } from "@/hooks/use-episodes"
import { Episode, EPISODE_STATUS } from "@/types/episode"

const episodeSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().optional().nullable(),
  season: z.number().optional(),
  number: z.number().optional(),
  status: z.enum(["PLANNED", "SCRIPTING", "RECORDED", "EDITING", "PUBLISHED"]),
  publishDate: z.string().optional().nullable(),
})

type EpisodeFormValues = z.infer<typeof episodeSchema>

interface EpisodeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  episode?: Episode | null
}

const defaultValues: EpisodeFormValues = {
  title: "",
  description: null,
  season: undefined,
  number: undefined,
  status: "PLANNED",
  publishDate: null,
}

export function EpisodeDialog({ open, onOpenChange, episode }: EpisodeDialogProps) {
  const createEpisode = useCreateEpisode()
  const updateEpisode = useUpdateEpisode()

  const form = useForm<EpisodeFormValues>({
    resolver: zodResolver(episodeSchema),
    defaultValues,
    values: episode ? {
      title: episode.title,
      description: episode.description ?? null,
      season: episode.season ?? undefined,
      number: episode.number ?? undefined,
      status: episode.status,
      publishDate: episode.publishDate ?? null,
    } : defaultValues,
  })

  const onSubmit = async (data: EpisodeFormValues) => {
    try {
      const cleanData: any = {
        ...Object.fromEntries(
          Object.entries(data).filter(([_, v]) => v != null && v !== '')
        ),
      }

      if (episode) {
        await updateEpisode.mutateAsync({ id: episode.id, ...cleanData })
      } else {
        await createEpisode.mutateAsync(cleanData)
      }
      
      form.reset()
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to save episode:", error)
    }
  }

  const isEditing = !!episode

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Episode' : 'Add New Episode'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update episode details.'
              : 'Create a new episode for your podcast.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            {/* Title */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">Title</Label>
              <Input
                id="title"
                className="col-span-3"
                {...form.register("title")}
              />
            </div>
            {form.formState.errors.title && (
              <p className="text-sm text-destructive col-span-4 col-start-2">
                {form.formState.errors.title.message}
              </p>
            )}

            {/* Description */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">Description</Label>
              <Textarea
                id="description"
                className="col-span-3"
                {...form.register("description")}
              />
            </div>

            {/* Season & Number */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid grid-cols-4 items-center gap-2">
                <Label htmlFor="season" className="text-right">Season</Label>
                <Input
                  id="season"
                  type="number"
                  className="col-span-2"
                  {...form.register("season", { valueAsNumber: true })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-2">
                <Label htmlFor="number" className="text-right">Number</Label>
                <Input
                  id="number"
                  type="number"
                  className="col-span-2"
                  {...form.register("number", { valueAsNumber: true })}
                />
              </div>
            </div>

            {/* Status */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">Status</Label>
              <Select
                onValueChange={(value) => form.setValue("status", value as any)}
                defaultValue={form.getValues("status")}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {EPISODE_STATUS.map((status) => (
                    <SelectItem key={status.id} value={status.id}>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${status.color}`} />
                        {status.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Publish Date */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="publishDate" className="text-right">Publish Date</Label>
              <Input
                id="publishDate"
                type="date"
                className="col-span-3"
                {...form.register("publishDate")}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createEpisode.isPending || updateEpisode.isPending}>
              {(createEpisode.isPending || updateEpisode.isPending) ? "Saving..." : (isEditing ? "Update" : "Create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
