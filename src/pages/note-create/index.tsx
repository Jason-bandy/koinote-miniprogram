import { View, Text, Textarea, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useRef, useEffect } from 'react'
import { useRecordsStore } from '@/stores/records'
import { AsrService } from '@/services/asr'
import './index.scss'

export default function NoteCreatePage() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isOrganizing, setIsOrganizing] = useState(false)
  const [isOcr, setIsOcr] = useState(false)

  // Voice input state
  const [isVoice, setIsVoice] = useState(false)
  const [voicePartial, setVoicePartial] = useState('')
  const asrRef = useRef<AsrService | null>(null)

  useEffect(() => {
    return () => {
      asrRef.current?.dispose()
    }
  }, [])

  const handleSave = async () => {
    if (!content.trim() || isSaving) return
    setIsSaving(true)
    try {
      const record = await useRecordsStore.getState().createNote({
        title: title.trim() || undefined,
        content: content.trim(),
      })
      Taro.navigateBack()
      Taro.navigateTo({ url: `/pages/record-detail/index?id=${record.id}` })
    } catch (e) {
      Taro.showToast({ title: '保存失败', icon: 'error' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleOrganize = async () => {
    if (!content.trim() || isOrganizing) return
    setIsOrganizing(true)
    try {
      const { organizeContent } = await import('@/services/api')
      const res = await organizeContent(content)
      setContent(res.organized_content || content)
    } catch (e) {
      Taro.showToast({ title: 'AI 整理失败', icon: 'error' })
    } finally {
      setIsOrganizing(false)
    }
  }

  const handlePickImage = async () => {
    if (isOcr) return
    setIsOcr(true)
    try {
      const res = await Taro.chooseMedia({
        count: 1,
        mediaType: ['image'],
        sourceType: ['camera', 'album'],
      })
      if (res.tempFiles.length > 0) {
        const { extractTextFromImage } = await import('@/services/api')
        const text = await extractTextFromImage({
          filePath: res.tempFiles[0].tempFilePath,
        })
        if (text) {
          setContent((prev) => prev + '\n' + text)
        } else {
          Taro.showToast({ title: '未识别到文字', icon: 'none' })
        }
      }
    } catch (e) {
      Taro.showToast({ title: 'OCR 失败', icon: 'error' })
    } finally {
      setIsOcr(false)
    }
  }

  const handleStartVoice = async () => {
    if (isVoice) return
    setIsVoice(true)
    setVoicePartial('')

    const asr = new AsrService()
    asrRef.current = asr

    asr.onSegment((seg) => {
      if (seg.isFinal) {
        setContent((prev) => prev + seg.text)
        setVoicePartial('')
      } else {
        setVoicePartial(seg.text)
      }
    })

    asr.onError((err) => {
      Taro.showToast({ title: `语音失败：${err}`, icon: 'error' })
      setIsVoice(false)
      asr.dispose()
    })

    await asr.start()
  }

  const handleStopVoice = () => {
    asrRef.current?.stop()
    asrRef.current?.dispose()
    asrRef.current = null
    setIsVoice(false)
    setVoicePartial('')
  }

  const handleBack = () => {
    if (isVoice) handleStopVoice()
    Taro.navigateBack()
  }

  return (
    <View className='note-create-page'>
      {/* Header */}
      <View className='note-header'>
        <Text className='note-close' onClick={handleBack}>✕</Text>
        <Text className='note-title'>灵感速记</Text>
        <View
          className={`note-save-btn ${!content.trim() || isSaving ? 'note-save-btn--disabled' : ''}`}
          onClick={handleSave}
        >
          {isSaving ? '保存中...' : '保存'}
        </View>
      </View>

      <View className='divider' />

      {/* Editor */}
      <ScrollView scrollY className='note-editor'>
        <Textarea
          className='note-title-input'
          placeholder='标题（选填，AI 会自动生成）'
          value={title}
          onInput={(e) => setTitle(e.detail.value)}
          autoFocus
        />
        <View className='divider' />
        <Textarea
          className='note-content-input'
          placeholder='写下你的想法...'
          value={content}
          onInput={(e) => setContent(e.detail.value)}
          autoFocus
          style={{ height: '500rpx' }}
        />

        {/* Voice partial preview */}
        {voicePartial && (
          <Text className='voice-partial'>{voicePartial}</Text>
        )}
      </ScrollView>

      {/* Voice panel */}
      {isVoice && (
        <View className='voice-panel'>
          <View className='voice-wave'>
            {[...Array(12)].map((_, i) => (
              <View
                key={i}
                className='voice-bar'
                style={{
                  animationDelay: `${i * 80}ms`,
                  height: `${8 + Math.random() * 18}rpx`,
                }}
              />
            ))}
          </View>
          <Text className='voice-text'>聆听中，说话吧</Text>
          <View className='voice-stop-btn' onClick={handleStopVoice}>
            <Text>停止</Text>
          </View>
        </View>
      )}

      {/* Bottom toolbar */}
      <View className='note-toolbar'>
        <View className='toolbar-item' onClick={handlePickImage}>
          <Text className='toolbar-icon'>{isOcr ? '⏳' : '🖼'}</Text>
        </View>
        <View className='toolbar-item' onClick={handleStartVoice}>
          <Text className='toolbar-icon'>🎙</Text>
        </View>
        <View style={{ flex: 1 }} />
        <View
          className={`toolbar-organize ${isOrganizing ? 'toolbar-organize--loading' : ''}`}
          onClick={handleOrganize}
        >
          {isOrganizing ? (
            <Text>AI 整理中...</Text>
          ) : (
            <Text>✨ AI 自动整理</Text>
          )}
        </View>
      </View>
    </View>
  )
}
