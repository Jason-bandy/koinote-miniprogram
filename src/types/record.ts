// ── Enums ─────────────────────────────────────────────────────────────────────

export type RecordType = 'meeting' | 'note' | 'photo' | 'webLink'
export type RecordStatus = 'processing' | 'ready' | 'error'

// ── Shared types ──────────────────────────────────────────────────────────────

export interface TagModel {
  id: string
  name: string
  color?: string
}

export interface ActionItem {
  task: string
  assignee?: string
  deadline?: string
  priority: 'high' | 'medium' | 'low'
}

export interface KeyDecision {
  decision: string
  context: string
}

export interface TopicTimestamp {
  timestamp: string
  topic: string
  keyPoint: string
}

export interface Flashcard {
  question: string
  answer: string
}

export interface MeetingDetails {
  summary?: string
  keyDecisions: KeyDecision[]
  actionItems: ActionItem[]
  openQuestions: string[]
  topicsTimeline: TopicTimestamp[]
  participants: string[]
  isClassMode: boolean
  subject?: string
  lessonTopic?: string
  flashcards: Flashcard[]
}

export interface WebLinkKeyPoint {
  point: string
  detail?: string
}

export interface WebLinkDetails {
  sourceUrl: string
  siteName?: string
  author?: string
  publishedAt?: string
  contentType: 'article' | 'video'
  wordCount?: number
  summary?: string
  keyPoints: WebLinkKeyPoint[]
  quotes: string[]
  actionItems: string[]
  topics: string[]
  thumbnailUrl?: string
  videoDuration?: string
}

export interface OcrDetails {
  scene: string
  pageCount: number
  rawOcrText?: string
  cleanedText?: string
  accuracy?: number
  detectedLanguage?: string
  isMultiPage: boolean
}

export interface RecordSummary {
  id: string
  type: RecordType
  title?: string
  contentSummary?: string
  isStarred: boolean
  status: RecordStatus
  recordedAt: string
  tags: TagModel[]
  errorMessage?: string
}

export interface RelatedRecord {
  id: string
  relationType: string
  relationText?: string
  record: RecordSummary
}

export interface RecordDetail extends RecordSummary {
  content?: string
  audioUrl?: string
  audioDuration?: number
  imageUrls?: string[]
  meetingDetails?: MeetingDetails
  ocrDetails?: OcrDetails
  webLinkDetails?: WebLinkDetails
  relations: RelatedRecord[]
}

export interface WeeklyReport {
  id: string
  weekStart: string
  weekEnd: string
  recordCount: number
  coreTheme: string
  keyInsights: string[]
  topicDistribution: Record<string, number>
  representativeQuote?: string
  nextWeekFocus?: string
  generatedAt: string
}
