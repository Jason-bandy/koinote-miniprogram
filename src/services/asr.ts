/**
 * Real-time ASR service
 *
 * Maps from Flutter's RealtimeAsrService:
 *   RecorderManager (PCM 16kHz) → WebSocket → parse JSON results
 */
import Taro from '@tarojs/taro'
import { WS_BASE_URL, TOKEN_STORAGE_KEY } from '@/utils/constants'

export interface AsrSegment {
  text: string
  isFinal: boolean
}

export type AsrState = 'idle' | 'connecting' | 'recording' | 'processing'

/** Simple event emitter pattern for segment/error/connected callbacks */
type Listener<T> = (value: T) => void

export class AsrService {
  private recorder: Taro.RecorderManager | null = null
  private socketTask: Taro.SocketTask | null = null
  private _isRunning = false

  private segmentListeners: Listener<AsrSegment>[] = []
  private errorListeners: Listener<string>[] = []
  private connectedListeners: Listener<boolean>[] = []

  private _state: AsrState = 'idle'
  get state(): AsrState {
    return this._state
  }

  onSegment(cb: Listener<AsrSegment>) {
    this.segmentListeners.push(cb)
    return () => {
      this.segmentListeners = this.segmentListeners.filter((l) => l !== cb)
    }
  }

  onError(cb: Listener<string>) {
    this.errorListeners.push(cb)
    return () => {
      this.errorListeners = this.errorListeners.filter((l) => l !== cb)
    }
  }

  onConnected(cb: Listener<boolean>) {
    this.connectedListeners.push(cb)
    return () => {
      this.connectedListeners = this.connectedListeners.filter((l) => l !== cb)
    }
  }

  private _setState(state: AsrState) {
    this._state = state
  }

  private _emitSegment(seg: AsrSegment) {
    this.segmentListeners.forEach((cb) => cb(seg))
  }

  private _emitError(msg: string) {
    this.errorListeners.forEach((cb) => cb(msg))
  }

  private _emitConnected(isConnected: boolean) {
    this.connectedListeners.forEach((cb) => cb(isConnected))
  }

  async start(): Promise<void> {
    if (this._isRunning) return

    // Request microphone permission
    try {
      await Taro.authorize({ scope: 'scope.record' })
    } catch {
      this._emitError('需要麦克风权限才能录音')
      return
    }

    try {
      await this._connect()
      this._isRunning = true
    } catch (e: unknown) {
      this._emitError(`连接失败：${(e as Error).message}`)
      await this._cleanup()
    }
  }

  async stop(): Promise<void> {
    if (!this._isRunning) return
    this._isRunning = false
    await this._cleanup()
    this._emitConnected(false)
  }

  dispose(): void {
    this.stop()
    this.segmentListeners = []
    this.errorListeners = []
    this.connectedListeners = []
  }

  private async _connect(): Promise<void> {
    const token = Taro.getStorageSync(TOKEN_STORAGE_KEY) || ''
    const wsUrl = `${WS_BASE_URL}/ws/transcribe?token=${encodeURIComponent(token)}`

    this._setState('connecting')

    // Connect WebSocket
    const socketTask = await Taro.connectSocket({
      url: wsUrl,
      fail: (err) => {
        this._emitError(`WebSocket 连接失败：${JSON.stringify(err)}`)
      },
    })

    if (!socketTask) {
      throw new Error('WebSocket 连接失败')
    }

    this.socketTask = socketTask

    // Wait for ready signal
    await this._waitForReady()

    // Start recording
    await this._startRecording()
  }

  private _waitForReady(): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('连接超时'))
      }, 8000)

      if (!this.socketTask) {
        reject(new Error('Socket not initialized'))
        return
      }

      this.socketTask.onMessage((res) => {
        try {
          const json = JSON.parse(res.data as string) as Record<
            string,
            unknown
          >
          if (json['status'] === 'ready') {
            clearTimeout(timeout)
            this._setState('recording')
            this._emitConnected(true)
            resolve()
            return
          }
          if (json['error']) {
            clearTimeout(timeout)
            reject(new Error(json['error'] as string))
          }
        } catch {
          // ignore parse errors
        }
      })

      this.socketTask!.onError((err) => {
        clearTimeout(timeout)
        reject(new Error(`WebSocket error: ${JSON.stringify(err)}`))
      })
    })
  }

  private async _startRecording(): Promise<void> {
    this.recorder = Taro.getRecorderManager()

    // Set up ALL listeners BEFORE starting
    this.recorder.onError((err) => {
      this._emitError(`录音错误：${err.errMsg}`)
    })

    // Use onFrameRecorded for streaming audio data
    this.recorder.onFrameRecorded((res) => {
      if (this._isRunning && this.socketTask && res.frameBuffer) {
        this.socketTask.send({
          data: res.frameBuffer,
          fail: () => {},
        })
      }
    })

    this.recorder.onStop((res) => {
      // Recording stopped
    })

    // Set up WebSocket message handler
    this.socketTask?.onMessage((res) => {
      // Handle messages that come after ready
      try {
        const json = JSON.parse(res.data as string) as Record<
          string,
          unknown
        >
        if (json['text']) {
          this._emitSegment({
            text: json['text'] as string,
            isFinal: (json['is_final'] as boolean) ?? false,
          })
        }
        if (json['error']) {
          this._emitError(json['error'] as string)
        }
      } catch {
        // ignore
      }
    })

    // Start recording with smaller frame size for lower latency
    this.recorder.start({
      format: 'PCM',
      sampleRate: 16000,
      numberOfChannels: 1,
      encodeBitRate: 96000, // Max allowed: 96000 bps
      frameSize: 40, // 25ms per frame at 16kHz (lower latency)
    })
  }

  private async _cleanup(): Promise<void> {
    try {
      this.recorder?.stop()
    } catch {
      // ignore
    }
    this.recorder = null

    try {
      this.socketTask?.close({})
    } catch {
      // ignore
    }
    this.socketTask = null

    this._setState('idle')
  }
}

// Singleton instance
let instance: AsrService | null = null
export function getAsrService(): AsrService {
  if (!instance) {
    instance = new AsrService()
  }
  return instance
}
