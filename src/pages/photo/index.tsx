import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import { useRecordsStore } from '@/stores/records'
import './index.scss'

type PhotoState = 'choose' | 'preview' | 'processing'

const scenes = [
  { value: 'book', label: '📚 书籍' },
  { value: 'whiteboard', label: '📋 白板' },
  { value: 'ppt', label: '📊 PPT' },
  { value: 'business_card', label: '💼 名片' },
  { value: 'formula', label: '🔢 公式' },
  { value: 'unknown', label: '📷 通用' },
]

export default function PhotoPage() {
  const [state, setState] = useState<PhotoState>('choose')
  const [selectedScene, setSelectedScene] = useState('book')
  const [images, setImages] = useState<string[]>([])

  const handleCamera = async () => {
    const res = await Taro.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['camera'],
    })
    if (res.tempFiles.length > 0) {
      setImages(res.tempFiles.map((f) => f.tempFilePath))
      setState('preview')
    }
  }

  const handleAlbum = async () => {
    const res = await Taro.chooseMedia({
      count: 9,
      mediaType: ['image'],
      sourceType: ['album'],
    })
    if (res.tempFiles.length > 0) {
      setImages(res.tempFiles.map((f) => f.tempFilePath))
      setState('preview')
    }
  }

  const handleOcr = async () => {
    if (images.length === 0) return
    setState('processing')

    try {
      const { uploadImagesOcr } = await import('@/services/api')
      const record = await uploadImagesOcr({
        filePaths: images,
        scene: selectedScene,
      })

      useRecordsStore.getState().refresh()
      setState('choose')
      setImages([])
      Taro.navigateBack()
      Taro.navigateTo({ url: `/pages/record-detail/index?id=${record.id}` })
    } catch (e) {
      setState('preview')
      Taro.showToast({ title: '识别失败', icon: 'error' })
    }
  }

  const sceneLabel = (s: string) =>
    scenes.find((sc) => sc.value === s)?.label || '📷 通用'

  const handleBack = () => {
    setState('choose')
    setImages([])
    Taro.navigateBack()
  }

  if (state === 'processing') {
    return (
      <View className='photo-page'>
        <View className='photo-header'>
          <Text className='photo-close' onClick={handleBack}>✕</Text>
          <Text className='photo-title'>拍照 OCR</Text>
          <View style={{ width: '40rpx' }} />
        </View>
        <View className='photo-processing'>
          <Text className='photo-processing-text'>正在上传图片...</Text>
          <Text className='photo-processing-sub'>稍后 AI 会自动识别并整理文字</Text>
        </View>
      </View>
    )
  }

  return (
    <View className='photo-page'>
      {/* Header */}
      <View className='photo-header'>
        <Text className='photo-close' onClick={handleBack}>✕</Text>
        <Text className='photo-title'>拍照 OCR</Text>
        <View style={{ width: '40rpx' }} />
      </View>

      {state === 'choose' && (
        <View className='photo-choose'>
          <Text className='section-title'>识别场景</Text>
          <View className='scene-grid'>
            {scenes.map((s) => (
              <View
                key={s.value}
                className={`scene-chip ${selectedScene === s.value ? 'scene-chip--active' : ''}`}
                onClick={() => setSelectedScene(s.value)}
              >
                <Text>{s.label}</Text>
              </View>
            ))}
          </View>

          <View className='photo-actions'>
            <View className='photo-btn' onClick={handleCamera}>
              <Text>📷 拍照</Text>
            </View>
            <View
              className='photo-btn photo-btn--outline'
              onClick={handleAlbum}
            >
              <Text>🖼 从相册选择（支持多张）</Text>
            </View>
          </View>
        </View>
      )}

      {state === 'preview' && (
        <View className='photo-preview'>
          <View className='photo-preview-info'>
            <Text>已选 {images.length} 张 · {sceneLabel(selectedScene)}</Text>
            <Text className='photo-preview-rechoose' onClick={() => setState('choose')}>
              重新选择
            </Text>
          </View>

          <View
            className='photo-btn'
            onClick={handleOcr}
            style={{ marginTop: '24rpx' }}
          >
            📄 开始 OCR 识别
          </View>
        </View>
      )}
    </View>
  )
}
