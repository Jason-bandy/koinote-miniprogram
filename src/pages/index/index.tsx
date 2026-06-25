import { View, Text, ScrollView, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import RecordCard from '@/components/RecordCard'
import { useRecords } from '@/hooks/useRecords'
import { useAuthStore } from '@/stores/auth'
import './index.scss'

import KOI_LOGO from '../../assets/icons/koi-logo.png'

const tools = [
  {
    key: 'meeting',
    label: '会议录音',
    icon: '🎙',
    path: '/pages/meeting/index',
    color: 'var(--color-meeting)',
    textColor: 'var(--color-meeting-text)',
    bg: 'var(--color-meeting-bg)',
  },
  {
    key: 'idea',
    label: '灵感速记',
    icon: '💡',
    path: '/pages/note-create/index',
    color: 'var(--color-idea)',
    textColor: 'var(--color-idea-text)',
    bg: 'var(--color-idea-bg)',
  },
  {
    key: 'photo',
    label: '拍照 OCR',
    icon: '📷',
    path: '/pages/photo/index',
    color: 'var(--color-photo)',
    textColor: 'var(--color-photo-text)',
    bg: 'var(--color-photo-bg)',
  },
  {
    key: 'summary',
    label: 'AI 总结',
    icon: '✨',
    path: '/pages/report/index',
    color: 'var(--color-summary)',
    textColor: 'var(--color-summary-text)',
    bg: 'var(--color-summary-bg)',
  },
] as const

export default function HomePage() {
  const { records, isLoading } = useRecords()
  const { user, isAuthenticated } = useAuthStore()
  const recent = records.slice(0, 5)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? '早上好' : hour < 18 ? '下午好' : '晚上好'
  const displayName = user?.displayName
  const greetingText = displayName
    ? `${greeting}，${displayName}`
    : greeting

  const navigateTo = (url: string) => {
    Taro.navigateTo({ url })
  }

  return (
    <ScrollView scrollY className='home-page'>
      <View className='home-header'>
        <View className='home-header-row'>
          <View className='home-logo'>
            <Image className='home-logo-icon' src='/assets/icons/koi-logo-128.png' mode='aspectFit' />
          </View>
          <Text className='home-title'>锦鲤笔记</Text>
        </View>
        <Text className='home-header-action' onClick={() => Taro.switchTab({ url: '/pages/search/index' })}>
          🔔
        </Text>
      </View>

      <View className='home-content'>
        <View className='home-greeting'>
          <Text className='home-greeting-text'>{greetingText}</Text>
          <Text className='home-greeting-sub'>有什么想记录的？</Text>
        </View>

        <View className='home-section'>
          <Text className='section-title'>快速记录</Text>
          <View className='tool-grid'>
            {tools.map((item) => {
            return (
              <View
                key={item.key}
                className='tool-card'
                style={{ backgroundColor: item.bg, borderColor: item.color }}
                onClick={() => navigateTo(item.path)}
              >
                <Text className='tool-card-icon' style={{ color: item.color }}>
                  {item.icon}
                </Text>
                <Text
                  className='tool-card-label'
                  style={{ color: item.textColor }}
                >
                  {item.label}
                </Text>
              </View>
            )
            })}
          </View>
        </View>

        <View
          className='home-banner home-banner--web'
          onClick={() => navigateTo('/pages/web-import/index')}
        >
          <Text className='banner-icon'>🌐</Text>
          <View className='banner-content'>
            <Text className='banner-title'>导入链接</Text>
            <Text className='banner-sub'>粘贴文章或视频 URL，AI 自动提炼要点</Text>
          </View>
          <Text className='banner-arrow'>›</Text>
        </View>

        {!isAuthenticated && (
          <View
            className='home-banner home-banner--login'
            onClick={() => navigateTo('/pages/login/index')}
          >
            <Text className='banner-icon'>☁️</Text>
            <View className='banner-content'>
              <Text className='banner-title banner-title--login'>登录以同步数据</Text>
              <Text className='banner-sub banner-sub--login'>手机、网页数据同步</Text>
            </View>
            <Text className='banner-arrow banner-arrow--login'>›</Text>
          </View>
        )}

        <View className='home-section home-section--records'>
          <View className='home-section-header'>
            <Text className='section-title'>最近记录</Text>
            <Text className='home-section-more' onClick={() => Taro.switchTab({ url: '/pages/library/index' })}>
              查看全部
            </Text>
          </View>

          {isLoading && recent.length === 0 && (
            <View className='loading-wrapper'>
              <Text className='text-hint'>加载中...</Text>
            </View>
          )}

          {recent.length === 0 && !isLoading && (
            <View className='empty-state home-empty-state'>
              <Text>还没有记录，快去创建第一条吧</Text>
            </View>
          )}

          <View className='record-list'>
            {recent.map((record) => (
              <RecordCard key={record.id} record={record} />
            ))}
          </View>
        </View>
      </View>

      <View style={{ height: '100rpx' }} />
    </ScrollView>
  )
}
