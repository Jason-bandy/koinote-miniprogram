import { View, Text, ScrollView } from '@tarojs/components'
import { useState } from 'react'
import RecordCard from '@/components/RecordCard'
import { useRecords } from '@/hooks/useRecords'
import type { RecordType } from '@/types/record'
import './index.scss'

type FilterType = RecordType | null

const filters: { type: FilterType; label: string }[] = [
  { type: null, label: '全部' },
  { type: 'note', label: '灵感' },
  { type: 'meeting', label: '会议' },
  { type: 'photo', label: '拍照' },
  { type: 'webLink', label: '链接' },
]

export default function LibraryPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>(null)
  const { records, isLoading } = useRecords()

  const filtered = activeFilter
    ? records.filter((r) => r.type === activeFilter)
    : records

  return (
    <View className='library-page'>
      <View className='filter-bar'>
        <ScrollView scrollX className='filter-scroll'>
          {filters.map((f) => (
            <View
              key={f.type || 'all'}
              className={`filter-chip ${activeFilter === f.type ? 'filter-chip--active' : ''}`}
              onClick={() => setActiveFilter(f.type)}
            >
              <Text>{f.label}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <ScrollView scrollY className='library-scroll'>
        {isLoading && filtered.length === 0 && (
          <View className='loading-wrapper'>
            <Text className='text-hint'>加载中...</Text>
          </View>
        )}

        {filtered.length === 0 && !isLoading && (
          <View className='library-empty-state'>
            <Text className='library-empty-icon'>□</Text>
            <Text className='library-empty-title'>还没有记录</Text>
            <Text className='library-empty-sub'>快速记录</Text>
          </View>
        )}

        <View className='library-record-list'>
          {filtered.map((record) => (
            <RecordCard key={record.id} record={record} />
          ))}
        </View>
      </ScrollView>
    </View>
  )
}
