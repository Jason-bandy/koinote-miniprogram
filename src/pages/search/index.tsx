import { View, Text, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import { useSearchStore } from '@/stores/search'
import { useTagsStore } from '@/stores/tags'
import { formatRelative } from '@/utils/format'
import type { RecordType } from '@/types/record'
import './index.scss'

const typeEmojis: Record<RecordType, string> = {
  meeting: '🎙',
  note: '💡',
  photo: '📷',
  webLink: '🌐',
}

const typeColors: Record<RecordType, { color: string; bg: string }> = {
  meeting: { color: 'var(--color-meeting)', bg: 'var(--color-meeting-bg)' },
  note: { color: 'var(--color-idea)', bg: 'var(--color-idea-bg)' },
  photo: { color: 'var(--color-photo)', bg: 'var(--color-photo-bg)' },
  webLink: { color: 'var(--color-web-link)', bg: 'var(--color-web-link-bg)' },
}

const suggestions = ['知识管理', '费曼学习法', '本周的会议', 'AI 工具']

export default function SearchPage() {
  const [inputValue, setInputValue] = useState('')
  const { query, results, isLoading, error, executeSearch, clear, setSearch } =
    useSearchStore()
  const { tags } = useTagsStore()

  const hasQuery = query.trim().length > 0

  const handleSearch = (value: string) => {
    setSearch(value)
    executeSearch(value)
  }

  const handleTagClick = (tagName: string) => {
    handleSearch(tagName)
  }

  const handleSuggestionClick = (text: string) => {
    handleSearch(text)
  }

  const navigateToRecord = (id: string) => {
    Taro.navigateTo({ url: `/pages/record-detail/index?id=${id}` })
  }

  return (
    <View className='search-page'>
      {/* Search input */}
      <View className='search-header'>
        <Input
          className='search-input'
          placeholder='搜索笔记、会议、OCR...'
          value={inputValue}
          onInput={(e) => {
            setInputValue(e.detail.value)
          }}
          onConfirm={(e) => {
            handleSearch(e.detail.value)
          }}
          confirmType='search'
          autoFocus
        />
        {inputValue && (
          <Text
            className='search-clear'
            onClick={() => {
              setInputValue('')
              clear()
            }}
          >
            ✕
          </Text>
        )}
        <View className='divider' />
      </View>

      {/* Results or idle view */}
      <View className='search-content'>
        {hasQuery && (
          <View>
            {isLoading && (
              <View className='loading-wrapper'>
                <Text className='text-hint'>搜索中...</Text>
              </View>
            )}
            {error && (
              <View className='error-wrapper'>
                <Text className='text-hint'>搜索失败：{error}</Text>
              </View>
            )}
            {!isLoading && !error && results.length === 0 && (
              <View className='empty-state'>
                <Text>没有找到「{query}」</Text>
                <Text className='text-hint' style={{ marginTop: '16rpx' }}>换个关键词试试</Text>
              </View>
            )}
            {results.map((record) => (
              <View
                key={record.id}
                className='record-card'
                onClick={() => navigateToRecord(record.id)}
              >
                <View className='record-card-type-row'>
                  <View
                    className='record-type-chip'
                    style={{ backgroundColor: typeColors[record.type].bg }}
                  >
                    <Text
                      className='record-type-label'
                      style={{ color: typeColors[record.type].color }}
                    >
                      {typeEmojis[record.type]}{' '}
                      {record.type === 'meeting'
                        ? '会议'
                        : record.type === 'note'
                        ? '灵感'
                        : record.type === 'photo'
                        ? '拍照'
                        : '链接'}
                    </Text>
                  </View>
                </View>
                {record.title && (
                  <Text className='record-card-title'>{record.title}</Text>
                )}
                {record.contentSummary && (
                  <Text className='record-card-summary'>{record.contentSummary}</Text>
                )}
                <Text className='record-card-time'>
                  {formatRelative(record.recordedAt)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {!hasQuery && (
          <View className='search-idle'>
            {/* Hot tags */}
            <Text className='section-title'>热门标签</Text>
            <View className='tag-list'>
              {tags.slice(0, 12).map((tag) => (
                <View
                  key={tag.id}
                  className='tag-chip'
                  onClick={() => handleTagClick(tag.name)}
                >
                  <Text>#{tag.name}</Text>
                </View>
              ))}
            </View>

            {/* Suggestions */}
            <Text className='section-title' style={{ marginTop: '56rpx' }}>
              试着搜索
            </Text>
            {suggestions.map((s) => (
              <View
                key={s}
                className='suggestion-item'
                onClick={() => handleSuggestionClick(s)}
              >
                <Text className='suggestion-icon'>🔍</Text>
                <Text className='suggestion-text'>{s}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  )
}
