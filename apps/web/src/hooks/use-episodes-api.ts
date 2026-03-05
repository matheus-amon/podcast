import { fetchAPI } from "@/lib/api"
import type { Episode, CreateEpisodeDTO, UpdateEpisodeDTO } from "@/types/episode"

export async function getEpisodes(): Promise<Episode[]> {
  return fetchAPI('/api/episodes')
}

export async function getEpisodeById(id: number): Promise<Episode> {
  return fetchAPI(`/api/episodes/${id}`)
}

export async function createEpisode(data: CreateEpisodeDTO): Promise<Episode> {
  return fetchAPI('/api/episodes', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateEpisode(data: UpdateEpisodeDTO): Promise<Episode> {
  return fetchAPI(`/api/episodes/${data.id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deleteEpisode(id: number): Promise<void> {
  return fetchAPI(`/api/episodes/${id}`, {
    method: 'DELETE',
  })
}
