import type { RecordDetail } from '../types/record'

// ── Request types ─────────────────────────────────────────────────────────────

export interface ListRecordsParams {
  type?: string
  q?: string
  offset?: number
  limit?: number
}

export interface CreateNoteParams {
  title?: string
  content: string
}

export interface UpdateRecordParams {
  is_starred?: boolean
  title?: string
}

export interface SearchParams {
  q: string
  limit?: number
}

export interface UploadAudioParams {
  mode: 'meeting' | 'class'
  title?: string
}

export interface UploadImagesOcrParams {
  scene: string
  filePaths: string[]
}

export interface SaveMeetingTranscriptParams {
  transcript: string
  title?: string
  durationSeconds?: number
  isClassMode?: boolean
}

export interface ExtractTextParams {
  filePath: string
  scene?: string
}

export interface OrganizeContentParams {
  content: string
}

export interface ImportWebUrlParams {
  url: string
}

// ── Response types ────────────────────────────────────────────────────────────

export interface ListRecordsResponse {
  items: RecordDetail[]
  total?: number
}

export interface SearchResponse {
  results: RecordDetail[]
}

export interface UploadAudioResponse {
  record_id: string
  status: string
}

export interface ImportWebUrlResponse {
  record_id: string
}

export interface ExtractTextResponse {
  text: string
}

export interface WeeklyReportResponse {
  id: string
  period_start: string
  period_end: string
  records_count: number
  content: {
    key_insights: (string | { insight: string })[]
    topic_distribution: Record<string, number>
    core_theme?: string
    best_quote?: string
    next_week_focus?: string
  }
  created_at: string
}
