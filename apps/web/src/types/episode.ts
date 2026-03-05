export interface Episode {
  id: number
  title: string
  description?: string | null
  season?: number | null
  number?: number | null
  status: 'PLANNED' | 'SCRIPTING' | 'RECORDED' | 'EDITING' | 'PUBLISHED'
  publishDate?: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateEpisodeDTO {
  title: string
  description?: string
  season?: number
  number?: number
  status?: 'PLANNED' | 'SCRIPTING' | 'RECORDED' | 'EDITING' | 'PUBLISHED'
  publishDate?: string
}

export interface UpdateEpisodeDTO extends Partial<CreateEpisodeDTO> {
  id: number
}

export const EPISODE_STATUS = [
  { id: 'PLANNED', label: 'Planned', color: 'bg-slate-400' },
  { id: 'SCRIPTING', label: 'Scripting', color: 'bg-blue-400' },
  { id: 'RECORDED', label: 'Recorded', color: 'bg-green-500' },
  { id: 'EDITING', label: 'Editing', color: 'bg-yellow-400' },
  { id: 'PUBLISHED', label: 'Published', color: 'bg-purple-500' },
] as const

export type EpisodeStatus = typeof EPISODE_STATUS[number]['id']
