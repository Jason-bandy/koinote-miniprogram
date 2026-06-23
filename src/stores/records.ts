/**
 * Records store — mirrors records_provider.dart (AsyncNotifier)
 */
import { create } from 'zustand'
import type { RecordDetail, TagModel, WeeklyReport } from '@/types/record'
import * as api from '@/services/api'

const PROCESSING_POLL_INTERVAL = 3000

interface RecordsState {
  records: RecordDetail[]
  isLoading: boolean
  error: string | null

  // Actions
  fetchRecords: (type?: string) => Promise<void>
  toggleStar: (id: string) => Promise<void>
  createNote: (params: { title?: string; content: string }) => Promise<RecordDetail>
  deleteRecord: (id: string) => Promise<void>
  importWebUrl: (url: string) => Promise<RecordDetail>
  search: (q: string) => Promise<RecordDetail[]>
  fetchTags: () => Promise<TagModel[]>
  createWeeklyReport: () => Promise<WeeklyReport>
  refresh: () => Promise<void>
  _schedulePollIfNeeded: () => void
  _pollTimerId: ReturnType<typeof setTimeout> | null
}

export const useRecordsStore = create<RecordsState>((set, get) => ({
  records: [],
  isLoading: false,
  error: null,
  _pollTimerId: null,

  fetchRecords: async (type?: string) => {
    set({ isLoading: true, error: null })
    try {
      const res = await api.listRecords({ type })
      const items = res.items ?? []
      set({ records: items, isLoading: false })
      get()._schedulePollIfNeeded()
    } catch (err: unknown) {
      set({
        error: (err as Error).message || '加载失败',
        isLoading: false,
      })
    }
  },

  toggleStar: async (id: string) => {
    const { records } = get()
    const idx = records.findIndex((r) => r.id === id)
    if (idx === -1) return

    const current = [...records]
    const updated = [...current]
    updated[idx] = {
      ...updated[idx],
      isStarred: !updated[idx].isStarred,
    }
    set({ records: updated })

    try {
      await api.updateRecord(id, {
        is_starred: updated[idx].isStarred,
      })
    } catch {
      set({ records: current }) // rollback
    }
  },

  createNote: async (params: { title?: string; content: string }) => {
    const record = await api.createNote(params)
    set((state) => ({
      records: [record, ...state.records],
    }))
    get()._schedulePollIfNeeded()
    return record
  },

  deleteRecord: async (id: string) => {
    const { records } = get()
    const current = [...records]
    set({ records: records.filter((r) => r.id !== id) })
    try {
      await api.deleteRecord(id)
    } catch {
      set({ records: current })
    }
  },

  importWebUrl: async (url: string) => {
    const res = await api.importWebUrl(url)
    const tempRecord: RecordDetail = {
      id: res.record_id,
      type: 'webLink',
      title: '正在解析...',
      isStarred: false,
      status: 'processing',
      recordedAt: new Date().toISOString(),
      tags: [],
      relations: [],
    }
    set((state) => ({
      records: [tempRecord, ...state.records],
    }))
    get()._schedulePollIfNeeded()
    return tempRecord
  },

  search: async (q: string) => {
    if (!q.trim()) return []
    const res = await api.search(q.trim())
    return res.results
  },

  fetchTags: async () => {
    const tags = await api.listTags()
    return tags
  },

  createWeeklyReport: async () => {
    const res = await api.createWeeklyReport()
    return {
      id: res.id,
      weekStart: res.period_start,
      weekEnd: res.period_end,
      recordCount: res.records_count,
      coreTheme: res.content.core_theme ?? '本周概览',
      keyInsights: (res.content.key_insights ?? []).map((i) =>
        typeof i === 'string' ? i : (i as { insight: string }).insight,
      ),
      topicDistribution: res.content.topic_distribution ?? {},
      representativeQuote: res.content.best_quote,
      nextWeekFocus: res.content.next_week_focus,
      generatedAt: res.created_at,
    }
  },

  refresh: async () => {
    await get().fetchRecords()
  },

  _schedulePollIfNeeded: () => {
    const state = get()
    // Clear existing timer
    if (state._pollTimerId != null) {
      clearTimeout(state._pollTimerId)
    }

    const hasProcessing = state.records.some((r) => r.status === 'processing')
    if (!hasProcessing) return

    const timerId = setTimeout(async () => {
      try {
        await get().fetchRecords()
      } catch {
        // Poll failure is non-critical; will retry on next schedule
      }
    }, PROCESSING_POLL_INTERVAL)

    set({ _pollTimerId: timerId })
  },
}))
