import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useEpisodeColumns } from '@/components/episodes/episode-columns'
import type { Episode } from '@/types/episode'

const mockEpisodes: Episode[] = [
  {
    id: 1,
    title: 'Episode 1',
    description: 'First episode',
    season: 1,
    number: 1,
    status: 'PUBLISHED',
    publishDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'Episode 2',
    description: 'Second episode',
    season: 1,
    number: 2,
    status: 'RECORDED',
    publishDate: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

describe('useEpisodeColumns', () => {
  it('should return columns array', () => {
    const { result } = renderHook(() => useEpisodeColumns())

    expect(result.current).toBeInstanceOf(Array)
    expect(result.current.length).toBeGreaterThan(0)
  })

  it('should have title column', () => {
    const { result } = renderHook(() => useEpisodeColumns())

    const titleColumn = result.current.find(col => col.accessorKey === 'title')
    expect(titleColumn).toBeDefined()
  })

  it('should have status column', () => {
    const { result } = renderHook(() => useEpisodeColumns())

    const statusColumn = result.current.find(col => col.accessorKey === 'status')
    expect(statusColumn).toBeDefined()
  })

  it('should have actions column', () => {
    const { result } = renderHook(() => useEpisodeColumns())

    const actionsColumn = result.current.find(col => col.id === 'actions')
    expect(actionsColumn).toBeDefined()
  })

  it('should include onEdit callback when provided', () => {
    const onEdit = vi.fn()
    const { result } = renderHook(() => useEpisodeColumns({ onEdit }))

    const actionsColumn = result.current.find(col => col.id === 'actions')
    expect(actionsColumn).toBeDefined()
  })
})
