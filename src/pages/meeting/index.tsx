import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useRef, useEffect } from 'react'
import { AsrService, type AsrSegment } from '@/services/asr'
import { useRecordsStore } from '@/stores/records'
import './index.scss'

type RecordingState = 'idle' | 'connecting' | 'recording' | 'processing'

export default function MeetingPage() {
  const [state, setState] = useState<RecordingState>('idle')
  const [duration, setDuration] = useState(0)
  const [segments, setSegments] = useState<AsrSegment[]>([])
  const [partialText, setPartialText] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isClassMode, setIsClassMode] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const asrRef = useRef<AsrService | null>(null)

  useEffect(() => {
    return () => {
      asrRef.current?.dispose()
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const startRecording = async () => {
    setSegments([])
    setPartialText('')
    setErrorMessage('')
    setDuration(0)
    setState('connecting')

    const asr = new AsrService()
    asrRef.current = asr

    asr.onSegment((seg) => {
      if (seg.isFinal) {
        setSegments((prev) => [...prev, seg])
        setPartialText('')
      } else {
        setPartialText(seg.text)
      }
    })

    asr.onError((err) => {
      setErrorMessage(err)
      setState('idle')
    })

    asr.onConnected((connected) => {
      if (connected) {
        setState('recording')
        timerRef.current = setInterval(() => {
          setDuration((d) => d + 1)
        }, 1000)
      }
    })

    await asr.start()
  }

  const stopRecording = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    setState('processing')
    await asrRef.current?.stop()

    const transcript = [
      ...segments.map((s) => s.text),
      partialText,
    ]
      .filter(Boolean)
      .join(' ')

    if (transcript.trim()) {
      try {
        const { saveMeetingTranscript } = await import('@/services/api')
        const now = new Date()
        const label = `${now.getMonth() + 1}月${now.getDate()}日 ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
        const record = await saveMeetingTranscript({
          transcript: transcript.trim(),
          title: `${isClassMode ? '课堂笔记' : '会议记录'} ${label}`,
          durationSeconds: duration,
          isClassMode,
        })

        useRecordsStore.getState().refresh()
        setState('idle')
        Taro.navigateBack()
        Taro.navigateTo({ url: `/pages/record-detail/index?id=${record.id}` })
      } catch (e) {
        setErrorMessage(`保存失败：${(e as Error).message}`)
        setState('idle')
      }
    } else {
      setState('idle')
    }
  }

  const handleBack = () => {
    if (state === 'idle') {
      Taro.navigateBack()
    }
  }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <View className='meeting-page'>
      {/* Header */}
      <View className='meeting-header'>
        <Text className='meeting-close' onClick={handleBack}>✕</Text>
        <Text className='meeting-title'>
          {isClassMode ? '课堂录音' : '会议录音'}
        </Text>
        {state === 'idle' && (
          <View className='mode-toggle'>
            <View
              className={`mode-tab ${!isClassMode ? 'mode-tab--active' : ''}`}
              onClick={() => setIsClassMode(false)}
            >
              <Text>🎙 会议</Text>
            </View>
            <View
              className={`mode-tab ${isClassMode ? 'mode-tab--active' : ''}`}
              onClick={() => setIsClassMode(true)}
            >
              <Text>🎓 上课</Text>
            </View>
          </View>
        )}
      </View>

      {/* Transcript */}
      <ScrollView
        scrollY
        scrollIntoView='bottom'
        className='meeting-transcript'
      >
        {state === 'idle' && segments.length === 0 && (
          <View className='meeting-idle'>
            <Text className='meeting-idle-icon'>
              {isClassMode ? '🎓' : '🎙'}
            </Text>
            <Text className='meeting-idle-text'>
              {isClassMode ? '点击开始录制课堂' : '点击开始录制会议'}
            </Text>
            <Text className='meeting-idle-sub'>
              实时转写 · AI 自动生成会议纪要
            </Text>
          </View>
        )}

        {segments.map((seg, i) => (
          <Text key={i} className='transcript-line'>{seg.text}</Text>
        ))}

        {partialText && (
          <Text className='transcript-line transcript-line--partial'>{partialText}</Text>
        )}
      </ScrollView>

      {/* Error */}
      {errorMessage && (
        <View className='meeting-error'>
          <Text>{errorMessage}</Text>
        </View>
      )}

      {/* Timer */}
      {state === 'recording' && (
        <View className='meeting-timer'>
          <View className='meeting-rec-dot' />
          <Text className='meeting-timer-text'>{formatTime(duration)}</Text>
        </View>
      )}

      {/* Record button */}
      <View className='meeting-controls'>
        {state === 'connecting' || state === 'processing' ? (
          <View className='record-btn record-btn--loading'>
            <Text className='record-btn-text'>
              {state === 'processing' ? 'AI 生成中...' : '连接中...'}
            </Text>
          </View>
        ) : state === 'recording' ? (
          <View className='record-btn record-btn--recording' onClick={stopRecording}>
            <Text className='record-btn-text'>⏹</Text>
          </View>
        ) : (
          <View className='record-btn' onClick={startRecording}>
            <Text className='record-btn-text'>🎙</Text>
          </View>
        )}

        {state !== 'idle' && (
          <Text className='meeting-status'>
            {state === 'connecting' && '正在连接实时转写服务...'}
            {state === 'recording' && '转写中 · 轻触停止'}
            {state === 'processing' && 'AI 生成会议纪要中...'}
          </Text>
        )}
      </View>
    </View>
  )
}
