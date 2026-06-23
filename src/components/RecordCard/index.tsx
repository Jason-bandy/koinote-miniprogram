import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useRecordsStore } from '@/stores/records'
import { formatRelative, formatDuration } from '@/utils/format'
import type { RecordDetail, RecordType } from '@/types/record'
import './index.scss'

const typeMeta: Record<
  RecordType,
  { icon: string; label: string; color: string; bg: string }
> = {
  meeting: {
    icon: '🎙',
    label: '会议',
    color: 'var(--color-meeting-text)',
    bg: 'var(--color-meeting-bg)',
  },
  note: {
    icon: '💡',
    label: '灵感',
    color: 'var(--color-idea-text)',
    bg: 'var(--color-idea-bg)',
  },
  photo: {
    icon: '📷',
    label: '拍照',
    color: 'var(--color-photo-text)',
    bg: 'var(--color-photo-bg)',
  },
  webLink: {
    icon: '🌐',
    label: '链接',
    color: 'var(--color-web-link-text)',
    bg: 'var(--color-web-link-bg)',
  },
}

interface RecordCardProps {
  record: RecordDetail
}

export default function RecordCard({ record }: RecordCardProps) {
  const meta = typeMeta[record.type]

  const navigateToRecord = () => {
    Taro.navigateTo({ url: `/pages/record-detail/index?id=${record.id}` })
  }

  const handleToggleStar = (event: { stopPropagation?: () => void }) => {
    event.stopPropagation?.()
    useRecordsStore.getState().toggleStar(record.id)
  }

  return (
    <View className='record-card' onClick={navigateToRecord}>
      <View className='record-card-header'>
        <View className='record-type-chip' style={{ backgroundColor: meta.bg }}>
          <Text className='record-type-icon' style={{ color: meta.color }}>
            {meta.icon}
          </Text>
          <Text className='record-type-label' style={{ color: meta.color }}>
            {meta.label}
          </Text>
        </View>

        <View className='record-card-header-spacer' />

        {record.status === 'processing' && (
          <View className='record-status record-status--processing'>
            <Text className='record-status-dot' />
            <Text className='record-status-text'>AI 处理中</Text>
          </View>
        )}

        {record.status === 'error' && (
          <View className='record-status record-status--error'>
            <Text className='record-status-text record-status-text--error'>
              导入失败
            </Text>
          </View>
        )}

        <Text
          className={`record-star ${record.isStarred ? 'record-star--active' : ''}`}
          onClick={handleToggleStar}
        >
          {record.isStarred ? '★' : '☆'}
        </Text>
      </View>

      {record.status === 'error' ? (
        <Text className='record-card-title record-card-title--error'>
          {record.errorMessage || '导入失败'}
        </Text>
      ) : (
        <>
          {record.title && (
            <Text className='record-card-title'>{record.title}</Text>
          )}
          {record.contentSummary && (
            <Text className='record-card-summary'>{record.contentSummary}</Text>
          )}
        </>
      )}

      {record.tags.length > 0 && (
        <View className='record-tags'>
          {record.tags.slice(0, 4).map((tag) => (
            <Text
              key={tag.id}
              className='record-tag'
              style={{ color: meta.color }}
            >
              #{tag.name}
            </Text>
          ))}
        </View>
      )}

      <View className='record-card-footer'>
        <Text className='record-footer-icon'>◷</Text>
        <Text className='record-card-time'>{formatRelative(record.recordedAt)}</Text>
        {record.type === 'meeting' && record.audioDuration != null && (
          <>
            <Text className='record-footer-separator'>·</Text>
            <Text className='record-footer-icon'>🎙</Text>
            <Text className='record-card-time'>
              {formatDuration(record.audioDuration)}
            </Text>
          </>
        )}
      </View>
    </View>
  )
}
