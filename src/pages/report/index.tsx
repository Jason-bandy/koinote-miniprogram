import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import { useRecords } from '@/hooks/useRecords'
import { formatShort } from '@/utils/format'
import type { WeeklyReport } from '@/types/record'
import './index.scss'

export default function ReportPage() {
  const { records } = useRecords()
  const [report, setReport] = useState<WeeklyReport | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay() + 1)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)

  const handleGenerate = async () => {
    if (records.length === 0 || isGenerating) return
    setIsGenerating(true)
    try {
      const { useRecordsStore } = await import('@/stores/records')
      const rpt = await useRecordsStore.getState().createWeeklyReport()
      setReport(rpt)
    } catch (e) {
      console.error('生成周报失败', e)
    } finally {
      setIsGenerating(false)
    }
  }

  if (report) {
    return <ReportView report={report} onBack={() => setReport(null)} />
  }

  return (
    <ScrollView scrollY className='report-page'>
      <View className='report-container'>
        {/* Header */}
        <View className='report-header-row'>
          <Text className='report-header-back' onClick={() => Taro.navigateBack()}>←</Text>
          <Text className='report-header-title'>AI 总结</Text>
          <View style={{ width: '40rpx' }} />
        </View>

        {/* Week card */}
        <View className='week-card'>
          <Text className='week-card-label'>本周</Text>
          <Text className='week-card-date'>
            {formatShort(weekStart)} — {formatShort(weekEnd)}
          </Text>
        </View>

        {/* Stats */}
        <View className='report-section'>
          <Text className='section-title'>本周记录</Text>
          <View className='stats-row'>
            <View className='stat-box'>
              <Text className='stat-number'>{records.length}</Text>
              <Text className='stat-label'>全部</Text>
            </View>
            <View className='stat-box'>
              <Text className='stat-number' style={{ color: 'var(--color-meeting)' }}>
                {records.filter((r) => r.type === 'meeting').length}
              </Text>
              <Text className='stat-label'>会议</Text>
            </View>
            <View className='stat-box'>
              <Text className='stat-number' style={{ color: 'var(--color-idea)' }}>
                {records.filter((r) => r.type === 'note').length}
              </Text>
              <Text className='stat-label'>笔记</Text>
            </View>
            <View className='stat-box'>
              <Text className='stat-number' style={{ color: 'var(--color-photo)' }}>
                {records.filter((r) => r.type === 'photo').length}
              </Text>
              <Text className='stat-label'>拍照</Text>
            </View>
          </View>
        </View>

        {/* Generate button */}
        <View
          className={`generate-btn ${records.length === 0 || isGenerating ? 'generate-btn--disabled' : ''}`}
          onClick={handleGenerate}
        >
          {isGenerating ? (
            <Text>AI 生成中...</Text>
          ) : (
            <Text>✨ 生成本周报告</Text>
          )}
        </View>

        {records.length === 0 && (
          <Text className='text-hint' style={{ textAlign: 'center', marginTop: '24rpx' }}>
            需要至少 1 条记录才能生成周报
          </Text>
        )}
      </View>
    </ScrollView>
  )
}

/* ── Report View ─────────────────────────────────────────────────────────────── */

interface ReportViewProps {
  report: WeeklyReport
  onBack: () => void
}

function ReportView({ report, onBack }: ReportViewProps) {
  const total = Object.values(report.topicDistribution).reduce((a, b) => a + b, 0)
  const colors = [
    'var(--color-meeting)',
    'var(--color-idea)',
    'var(--color-photo)',
    'var(--color-summary)',
    'var(--color-success)',
  ]

  return (
    <ScrollView scrollY className='report-page'>
      <View className='report-container'>
        <View className='report-header'>
          <View>
            <Text className='report-dates'>
              {formatShort(report.weekStart)} — {formatShort(report.weekEnd)}
            </Text>
            <Text className='report-count'>共 {report.recordCount} 条记录</Text>
          </View>
          <Text className='report-back' onClick={onBack}>
            返回
          </Text>
        </View>

        {/* Core theme */}
        <View className='core-theme-card'>
          <Text className='core-theme-label'>✨ 本周核心主题</Text>
          <Text className='core-theme-text'>{report.coreTheme}</Text>
        </View>

        {/* Key insights */}
        <Text className='section-title' style={{ marginTop: '40rpx' }}>
          本周洞察
        </Text>
        {report.keyInsights.map((insight, i) => (
          <View key={i} className='insight-item'>
            <View className='insight-number'>
              <Text>{i + 1}</Text>
            </View>
            <Text className='insight-text'>{insight}</Text>
          </View>
        ))}

        {/* Topic distribution */}
        <Text className='section-title' style={{ marginTop: '40rpx' }}>
          话题分布
        </Text>
        {Object.entries(report.topicDistribution).map(([topic, count], i) => {
          const pct = total > 0 ? count / total : 0
          return (
            <View key={topic} style={{ marginBottom: '20rpx' }}>
              <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: '26rpx', color: 'var(--color-text-body)' }}>{topic}</Text>
                <Text style={{ fontSize: '24rpx', color: 'var(--color-text-hint)' }}>{count} 条</Text>
              </View>
              <View className='progress-bar'>
                <View
                  className='progress-fill'
                  style={{
                    width: `${pct * 100}%`,
                    backgroundColor: colors[i % colors.length],
                  }}
                />
              </View>
            </View>
          )
        })}

        {/* Representative quote */}
        {report.representativeQuote && (
          <View className='quote-card' style={{ marginTop: '40rpx' }}>
            <Text className='quote-label'>本周代表性语录</Text>
            <Text className='quote-text'>"{report.representativeQuote}"</Text>
          </View>
        )}

        {/* Next week focus */}
        {report.nextWeekFocus && (
          <View className='next-week-card' style={{ marginTop: '40rpx' }}>
            <Text className='next-week-label'>⏭ 下周关注</Text>
            <Text className='next-week-text'>{report.nextWeekFocus}</Text>
          </View>
        )}

        <Text className='report-footer'>
          由 AI 生成 · {formatShort(report.generatedAt)}
        </Text>
      </View>
    </ScrollView>
  )
}
