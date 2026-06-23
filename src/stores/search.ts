/**
 * Search store — mirrors searchQueryProvider + searchResultsProvider
 */
import { create } from 'zustand'
import type { RecordDetail } from '@/types/record'
import * as api from '@/services/api'

interface SearchState {
  query: string
  results: RecordDetail[]
  isLoading: boolean
  error: string | null

  setSearch: (q: string) => void
  executeSearch: (q: string) => Promise<void>
  clear: () => void
}

export const useSearchStore = create<SearchState>((set) => ({
  query: '',
  results: [],
  isLoading: false,
  error: null,

  setSearch: (q: string) => set({ query: q }),

  executeSearch: async (q: string) => {
    set({ query: q, isLoading: true, error: null })
    if (!q.trim()) {
      set({ results: [], isLoading: false })
      return
    }
    try {
      const res = await api.search(q.trim())
      set({ results: res.results, isLoading: false })
    } catch (err: unknown) {
      set({ error: (err as Error).message || '搜索失败', isLoading: false })
    }
  },

  clear: () => set({ query: '', results: [], isLoading: false, error: null }),
}))
