import { View, Text, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import { useRecordsStore } from '@/stores/records'
import './index.scss'

type ImportState = 'idle' | 'loading' | 'done' | 'error'

export default function WebImportPage() {
  const [url, setUrl] = useState('')
  const [state, setState] = useState<ImportState>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async () => {
    if (!url.trim() || state === 'loading' || state === 'done') return

    setState('loading')
    try {
      const tempRecord = await useRecordsStore.getState().importWebUrl(url.trim())
      setState('done')

      await new Promise((resolve) => setTimeout(resolve, 800))

      Taro.navigateBack()
      Taro.navigateTo({ url: `/pages/record-detail/index?id=${tempRecord.id}` })
    } catch (e) {
      setErrorMsg((e as Error).message || '导入失败')
      setState('error')
    }
  }

  const handleBack = () => {
    setState('idle')
    setUrl('')
    Taro.navigateBack()
  }

  return (
    <View className='web-import-page'>
      {/* Header */}
      <View className='web-import-header'>
        <Text className='web-import-close' onClick={handleBack}>✕</Text>
        <Text className='web-import-title'>导入链接</Text>
        <View style={{ width: '40rpx' }} />
      </View>

      <View className='web-import-content'>
        {/* Hero */}
        <View className='web-import-hero'>
          <Text className='web-import-hero-icon'>🔗</Text>
          <Text className='web-import-hero-title'>AI 阅读助手</Text>
          <Text className='web-import-hero-sub'>
            自动提炼核心观点，保存到知识库
          </Text>
        </View>

        {/* Title */}
        <Text className='section-title' style={{ marginTop: '64rpx' }}>
          粘贴链接
        </Text>
        <Text className='text-hint' style={{ fontSize: '24rpx', marginTop: '16rpx' }}>
          支持网页文章、YouTube 视频、B站视频等
        </Text>

        {/* URL input */}
        <View
          className={`url-input ${state === 'loading' || state === 'done' ? 'url-input--disabled' : ''}`}
        >
          <Input
            className='url-input-field'
            placeholder='https://...'
            value={url}
            onInput={(e) => setUrl(e.detail.value)}
            type='text'
            confirmType='go'
            onConfirm={handleSubmit}
            disabled={state === 'loading' || state === 'done'}
          />
          {url && (
            <Text
              className='url-clear'
              onClick={() => setUrl('')}
            >✕</Text>
          )}
        </View>

        {/* Error */}
        {state === 'error' && (
          <View className='error-message'>
            <Text>导入失败：{errorMsg}</Text>
          </View>
        )}

        {/* Submit */}
        <View
          className={`submit-btn ${state === 'loading' || state === 'done' ? 'submit-btn--disabled' : ''}`}
          onClick={handleSubmit}
        >
          {state === 'loading' && <Text>导入并分析</Text>}
          {state === 'done' && <Text>已提交，正在处理</Text>}
          {!['loading', 'done'].includes(state) && <Text>导入并分析</Text>}
        </View>

        {/* Supported sources */}
        <View className='supported-sources'>
          <Text className='text-hint' style={{ fontSize: '24rpx' }}>
            支持来源
          </Text>
          <View className='source-grid'>
            {[
              { icon: '📄', label: '新闻/博客' },
              { icon: '🎬', label: 'YouTube' },
              { icon: '📺', label: 'B站' },
              { icon: '💬', label: '公众号' },
            ].map((s) => (
              <View key={s.label} className='source-item'>
                <View className='source-icon'>
                  <Text>{s.icon}</Text>
                </View>
                <Text className='source-label'>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  )
}
