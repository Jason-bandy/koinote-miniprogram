/**
 * Tags store — mirrors tagsProvider
 */
import { create } from 'zustand'
import type { TagModel } from '@/types/record'
import * as api from '@/services/api'

interface TagsState {
  tags: TagModel[]
  isLoading: boolean
  error: string | null
  fetch: () => Promise<void>
}

export const useTagsStore = create<TagsState>((set) => ({
  tags: [],
  isLoading: false,
  error: null,

  fetch: async () => {
    set({ isLoading: true, error: null })
    try {
      const tags = await api.listTags()
      set({ tags, isLoading: false })
    } catch (err: unknown) {
      set({ error: (err as Error).message || '加载标签失败', isLoading: false })
    }
  },
}))
