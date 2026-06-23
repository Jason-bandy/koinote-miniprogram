/**
 * API methods — mirrors api_client.dart
 */
import Taro from '@tarojs/taro'
import { request, getToken } from './request'
import { API_BASE_URL } from '@/utils/constants'
import type {
  ListRecordsResponse,
  SearchResponse,
  UploadAudioResponse,
  ImportWebUrlResponse,
  WeeklyReportResponse,
} from '@/types/api'
import type { RecordDetail, TagModel } from '@/types/record'

// ── Records ───────────────────────────────────────────────────────────────────

export async function listRecords(params?: {
  type?: string
  q?: string
  offset?: number
  limit?: number
}): Promise<ListRecordsResponse> {
  return request<ListRecordsResponse>({
    url: '/api/v1/records',
    method: 'GET',
    data: params,
  })
}

export async function getRecord(id: string): Promise<RecordDetail> {
  return request<RecordDetail>({
    url: `/api/v1/records/${id}`,
    method: 'GET',
  })
}

export async function createNote(params: {
  title?: string
  content: string
}): Promise<RecordDetail> {
  return request<RecordDetail>({
    url: '/api/v1/records/note',
    method: 'POST',
    data: params,
  })
}

export async function updateRecord(
  id: string,
  params: { is_starred?: boolean; title?: string },
): Promise<RecordDetail> {
  return request<RecordDetail>({
    url: `/api/v1/records/${id}`,
    method: 'PATCH',
    data: params,
  })
}

export async function deleteRecord(id: string): Promise<void> {
  return request({
    url: `/api/v1/records/${id}`,
    method: 'DELETE',
  })
}

// ── Search ────────────────────────────────────────────────────────────────────

export async function search(
  q: string,
  limit = 10,
): Promise<SearchResponse> {
  return request<SearchResponse>({
    url: '/api/v1/search',
    method: 'POST',
    data: { q, limit },
  })
}

// ── Tags ──────────────────────────────────────────────────────────────────────

export async function listTags(): Promise<TagModel[]> {
  return request<TagModel[]>({
    url: '/api/v1/tags',
    method: 'GET',
  })
}

// ── Audio / Meeting ───────────────────────────────────────────────────────────

export async function uploadAudio(params: {
  filePath: string
  mode: string
  title?: string
}): Promise<UploadAudioResponse> {
  const token = await import('./request').then((m) => m.getToken())
  const formData: Record<string, unknown> = {
    mode: params.mode,
  }
  if (params.title) formData['title'] = params.title

  const header: Record<string, string> = {}
  if (token) header['Authorization'] = `Bearer ${token}`

  const res = await Taro.uploadFile({
    url: `${API_BASE_URL}/api/v1/records/audio`,
    filePath: params.filePath,
    name: 'audio',
    formData,
    header,
  })

  return JSON.parse(res.data as string)
}

export async function saveMeetingTranscript(params: {
  transcript: string
  title?: string
  durationSeconds?: number
  isClassMode?: boolean
}): Promise<RecordDetail> {
  return request<RecordDetail>({
    url: '/api/v1/records/meeting-transcript',
    method: 'POST',
    data: params,
  })
}

// ── Image / OCR ───────────────────────────────────────────────────────────────

export async function uploadImagesOcr(params: {
  filePaths: string[]
  scene: string
}): Promise<RecordDetail> {
  const token = await getToken()
  const header: Record<string, string> = {}
  if (token) header['Authorization'] = `Bearer ${token}`

  const res = await Taro.uploadFile({
    url: `${API_BASE_URL}/api/v1/records/image-ocr`,
    filePath: params.filePaths[0],
    name: 'images',
    formData: { scene: params.scene },
    header,
  })

  return JSON.parse(res.data as string)
}

export async function extractTextFromImage(params: {
  filePath: string
  scene?: string
}): Promise<string> {
  const token = await getToken()
  const header: Record<string, string> = {}
  if (token) header['Authorization'] = `Bearer ${token}`

  const res = await Taro.uploadFile({
    url: `${API_BASE_URL}/api/v1/ai/ocr-text`,
    filePath: params.filePath,
    name: 'image',
    formData: { scene: params.scene ?? 'unknown' },
    header,
  })

  const json = JSON.parse(res.data as string)
  return (json as Record<string, unknown>).text as string ?? ''
}

// ── AI ────────────────────────────────────────────────────────────────────────

export async function organizeContent(
  content: string,
): Promise<{ organized_content: string }> {
  return request<{ organized_content: string }>({
    url: '/api/v1/ai/organize',
    method: 'POST',
    data: { content },
  })
}

// ── Reports ───────────────────────────────────────────────────────────────────

export async function createWeeklyReport(): Promise<WeeklyReportResponse> {
  return request<WeeklyReportResponse>({
    url: '/api/v1/reports/weekly',
    method: 'POST',
    data: {},
  })
}

// ── Web Import ────────────────────────────────────────────────────────────────

export async function importWebUrl(
  url: string,
): Promise<ImportWebUrlResponse> {
  return request<ImportWebUrlResponse>({
    url: '/api/v1/web-import',
    method: 'POST',
    data: { url },
  })
}
