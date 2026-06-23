import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useEffect, useRef } from 'react'
import { useRecordDetail } from '@/hooks/useRecordDetail'
import { useRecordsStore } from '@/stores/records'
import { formatFull, formatDuration } from '@/utils/format'
import type { RecordType, RecordDetail } from '@/types/record'
import './index.scss'

const typeLabels: Record<RecordType, string> = {
  meeting: '会议录音',
  note: '灵感笔记',
  photo: '拍照 OCR',
  webLink: '链接导入',
}

const typeColors: Record<RecordType, { color: string }> = {
  meeting: { color: 'var(--color-meeting)' },
  note: { color: 'var(--color-idea)' },
  photo: { color: 'var(--color-photo)' },
  webLink: { color: 'var(--color-web-link)' },
}

const processingPollInterval = 3000

const processingMessages: Record<RecordType | 'default', string> = {
  meeting: '音频已上传，AI 正在转录并生成摘要，完成后会通知你',
  note: '笔记已保存，AI 正在整理标签和关联内容，完成后会通知你',
  photo: '图片已上传，AI 正在识别文字并进行分析，完成后会通知你',
  webLink: '链接已接收，AI 正在解析网页内容并生成摘要，完成后会通知你',
  default: 'AI 正在处理中，完成后会通知你',
}

export default function RecordDetailPage() {
  const router = useRouter()
  const id = router.params.id || ''
  const { record, isLoading, error } = useRecordDetail(id)

  if (isLoading) {
    return (
      <View className='detail-loading'>
        <Text className='text-hint'>加载中...</Text>
      </View>
    )
  }

  if (error || !record) {
    return (
      <View className='detail-error'>
        <Text>加载失败，请重试</Text>
      </View>
    )
  }

  return <DetailContent record={record} />
}

/* ── Detail Content ──────────────────────────────────────────────────────────── */

interface DetailContentProps {
  record: RecordDetail
}

function DetailContent({ record }: DetailContentProps) {
  const colors = typeColors[record.type]
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isProcessing = record.status === 'processing'

  // Auto-poll for processing records
  useEffect(() => {
    if (!isProcessing) {
      if (pollTimerRef.current != null) {
        clearTimeout(pollTimerRef.current)
        pollTimerRef.current = null
      }
      return
    }

    const poll = () => {
      pollTimerRef.current = setTimeout(async () => {
        try {
          await useRecordsStore.getState().refresh()
        } catch {
          // Non-critical; will retry
        }
        poll()
      }, processingPollInterval)
    }

    poll()

    return () => {
      if (pollTimerRef.current != null) {
        clearTimeout(pollTimerRef.current)
        pollTimerRef.current = null
      }
    }
  }, [isProcessing])

  const handleBack = () => {
    Taro.navigateBack()
  }

  return (
    <ScrollView scrollY className='detail-page'>
      {/* Header */}
      <View className='detail-header'>
        <Text className='detail-back' onClick={handleBack}>
          ←
        </Text>
        <Text className='detail-title' style={{ color: colors.color }}>
          {typeLabels[record.type]}
        </Text>
        <View style={{ width: '60rpx' }} />
      </View>

      <View className='detail-content'>
        {/* Meta */}
        <View style={{ marginBottom: '40rpx' }}>
          {record.title && (
            <Text className='detail-record-title'>{record.title}</Text>
          )}
          <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <Text className='detail-time'>
              {formatFull(record.recordedAt)}
            </Text>
            {record.audioDuration && (
              <Text className='detail-time'>
                {' · '}{formatDuration(record.audioDuration)}
              </Text>
            )}
          </View>
        </View>

        {/* Processing */}
        {record.status === 'processing' && (
          <View className='processing-card'>
            <Text className='processing-text'>AI 正在处理中...</Text>
            <Text className='processing-sub'>
              {processingMessages[record.type] ?? processingMessages.default}
            </Text>
          </View>
        )}

        {/* Error */}
        {record.status === 'error' && (
          <View className='error-card'>
            <Text className='error-card-title'>导入失败</Text>
            <Text className='error-card-message'>
              {record.errorMessage || 'AI 处理时发生未知错误'}
            </Text>
          </View>
        )}

        {/* Meeting details */}
        {record.meetingDetails && (
          <MeetingSection details={record.meetingDetails} color={colors.color} />
        )}

        {/* OCR details */}
        {record.ocrDetails && (
          <OcrSection details={record.ocrDetails} color={colors.color} />
        )}

        {/* Web link details */}
        {record.webLinkDetails && (
          <WebLinkSection details={record.webLinkDetails} color={colors.color} />
        )}

        {/* Note content */}
        {!record.meetingDetails && !record.ocrDetails && !record.webLinkDetails && record.content && (
          <Text className='detail-note-content'>{record.content}</Text>
        )}
      </View>
    </ScrollView>
  )
}

/* ── Meeting Section ─────────────────────────────────────────────────────────── */

function MeetingSection({ details, color }: { details: NonNullable<RecordDetail['meetingDetails']>; color: string }) {
  return (
    <View>
      {details.summary && (
        <View style={{ marginBottom: '40rpx' }}>
          <View className='section-label' style={{ color }}>
            <Text>📝 {details.isClassMode ? '课堂笔记摘要' : '会议摘要'}</Text>
          </View>
          <View className='content-card'>
            <Text className='content-text'>{details.summary}</Text>
          </View>
        </View>
      )}

      {/* Key decisions */}
      {!details.isClassMode && details.keyDecisions.length > 0 && (
        <View style={{ marginBottom: '40rpx' }}>
          <View className='section-label' style={{ color }}>
            <Text>✅ 关键决策</Text>
          </View>
          <View className='content-card'>
            {details.keyDecisions.map((d, i) => (
              <View key={i} style={{ marginBottom: i < details.keyDecisions.length - 1 ? '24rpx' : 0 }}>
                <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start' }}>
                  <View style={{ width: '40rpx', height: '40rpx', backgroundColor: color, borderRadius: '20rpx', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: '#fff', fontSize: '22rpx' }}>{i + 1}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: '20rpx' }}>
                    <Text style={{ fontSize: '28rpx', fontWeight: '500' }}>{d.decision}</Text>
                    <Text className='text-hint' style={{ fontSize: '24rpx' }}>{d.context}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Timeline */}
      {details.topicsTimeline.length > 0 && (
        <View style={{ marginBottom: '40rpx' }}>
          <View className='section-label' style={{ color }}>
            <Text>⏱ 时间轴</Text>
          </View>
          <View className='content-card'>
            {details.topicsTimeline.map((t, i) => (
              <View key={i} style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', marginBottom: i < details.topicsTimeline.length - 1 ? '24rpx' : 0 }}>
                <View style={{ width: '64rpx', backgroundColor: `${color}10`, borderRadius: '8rpx', padding: '6rpx', textAlign: 'center' }}>
                  <Text style={{ fontSize: '20rpx', color, fontWeight: '500' }}>{t.timestamp}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: '24rpx' }}>
                  <Text style={{ fontSize: '26rpx', fontWeight: '500' }}>{t.topic}</Text>
                  <Text className='text-hint' style={{ fontSize: '24rpx' }}>{t.keyPoint}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Open questions */}
      {details.openQuestions.length > 0 && (
        <View style={{ marginBottom: '40rpx' }}>
          <View className='section-label' style={{ color }}>
            <Text>❓ 待解决问题</Text>
          </View>
          <View className='content-card'>
            {details.openQuestions.map((q, i) => (
              <Text key={i} style={{ fontSize: '26rpx', marginBottom: '16rpx', display: 'block' }}>
                • {q}
              </Text>
            ))}
          </View>
        </View>
      )}

      {/* Participants */}
      {details.participants.length > 0 && (
        <View style={{ marginBottom: '40rpx' }}>
          <View className='section-label' style={{ color }}>
            <Text>👥 参会人</Text>
          </View>
          <View style={{ display: 'flex', flexWrap: 'wrap', gap: '16rpx' }}>
            {details.participants.map((p) => (
              <View key={p} style={{ padding: '12rpx 24rpx', borderRadius: '999rpx', border: '0.5px solid var(--color-border-hover)', backgroundColor: 'var(--color-bg-card)' }}>
                <Text style={{ fontSize: '24rpx' }}>{p}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  )
}

/* ── OCR Section ─────────────────────────────────────────────────────────────── */

function OcrSection({ details, color }: { details: NonNullable<RecordDetail['ocrDetails']>; color: string }) {
  const sceneLabels: Record<string, string> = {
    book: '📚 书籍',
    whiteboard: '📋 白板',
    business_card: '💼 名片',
    ppt: '📊 PPT',
    formula: '🔢 公式',
  }

  return (
    <View>
      <View className='section-label' style={{ color }}>
        <Text>📄 识别文字</Text>
      </View>
      <View className='content-card' style={{ marginTop: '20rpx' }}>
        <Text className='content-text'>
          {details.cleanedText || details.rawOcrText || '识别结果为空'}
        </Text>
      </View>
      <View style={{ display: 'flex', flexDirection: 'row', gap: '16rpx', marginTop: '16rpx' }}>
        <View style={{ padding: '6rpx 16rpx', borderRadius: '8rpx', backgroundColor: 'var(--color-bg-card)', border: '0.5px solid var(--color-border-hover)' }}>
          <Text style={{ fontSize: '22rpx', color: 'var(--color-text-hint)' }}>
            {sceneLabels[details.scene] || '📷 通用'}
          </Text>
        </View>
        {details.accuracy != null && (
          <View style={{ padding: '6rpx 16rpx', borderRadius: '8rpx', backgroundColor: 'var(--color-bg-card)', border: '0.5px solid var(--color-border-hover)' }}>
            <Text style={{ fontSize: '22rpx', color: 'var(--color-text-hint)' }}>
              准确率 {(details.accuracy * 100).toFixed(0)}%
            </Text>
          </View>
        )}
      </View>
    </View>
  )
}

/* ── Web Link Section ────────────────────────────────────────────────────────── */

function WebLinkSection({ details, color }: { details: NonNullable<RecordDetail['webLinkDetails']>; color: string }) {
  return (
    <View>
      {/* Source card */}
      <View style={{ padding: '28rpx', borderRadius: '24rpx', backgroundColor: `${color}10`, border: `0.5px solid ${color}30`, marginBottom: '40rpx' }}>
        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: '44rpx' }}>{details.contentType === 'video' ? '🎬' : '📄'}</Text>
          <View style={{ flex: 1, marginLeft: '24rpx' }}>
            <Text style={{ fontSize: '24rpx', fontWeight: '500', color }}>{details.siteName || '网页'}</Text>
            <Text className='text-hint' style={{ fontSize: '22rpx', display: 'block', marginTop: '4rpx' }}>
              {details.sourceUrl}
            </Text>
          </View>
        </View>
      </View>

      {/* Summary */}
      {details.summary && (
        <View style={{ marginBottom: '40rpx' }}>
          <View className='section-label' style={{ color }}>
            <Text>✨ AI 总结</Text>
          </View>
          <View className='content-card'>
            <Text className='content-text'>{details.summary}</Text>
          </View>
        </View>
      )}

      {/* Key points */}
      {details.keyPoints.length > 0 && (
        <View style={{ marginBottom: '40rpx' }}>
          <View className='section-label' style={{ color }}>
            <Text>📋 核心观点</Text>
          </View>
          {details.keyPoints.map((kp, i) => (
            <View key={i} style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', marginBottom: '24rpx' }}>
              <View style={{ width: '44rpx', height: '44rpx', backgroundColor: `${color}20`, borderRadius: '12rpx', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: '22rpx', color, fontWeight: '500' }}>{i + 1}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: '20rpx' }}>
                <Text style={{ fontSize: '28rpx', fontWeight: '500', color: 'var(--color-text-primary)' }}>{kp.point}</Text>
                {kp.detail && (
                  <Text className='text-hint' style={{ fontSize: '24rpx', marginTop: '6rpx', display: 'block' }}>{kp.detail}</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Quotes */}
      {details.quotes.length > 0 && (
        <View style={{ marginBottom: '40rpx' }}>
          <View className='section-label' style={{ color }}>
            <Text>❝ 精彩引用</Text>
          </View>
          {details.quotes.map((q, i) => (
            <View key={i} style={{ padding: '24rpx', backgroundColor: `${color}10`, borderLeft: `6rpx solid ${color}`, borderRadius: '16rpx', marginBottom: '24rpx' }}>
              <Text style={{ fontSize: '26rpx', fontStyle: 'italic', color: 'var(--color-text-body)', lineHeight: '1.6' }}>{q}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}
