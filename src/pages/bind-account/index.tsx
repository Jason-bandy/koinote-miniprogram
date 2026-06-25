import { View, Text, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/auth'
import './index.scss'

type BindType = 'phone' | 'email'

export default function BindAccountPage() {
  const { bindAccount, sendCode } = useAuthStore()

  const [bindType, setBindType] = useState<BindType>('phone')
  const [contact, setContact] = useState('')
  const [code, setCode] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)

  const openUserAgreement = () => {
    Taro.navigateTo({
      url: '/pages/webview/index?url=https://api.transkoi.luckjingle.com/api/apis/public/webview/appArticles/502',
    })
  }

  const openPrivacyPolicy = () => {
    Taro.navigateTo({
      url: '/pages/webview/index?url=https://api.transkoi.luckjingle.com/api/apis/public/webview/appArticles/500',
    })
  }

  const handleSkip = () => {
    Taro.showModal({
      title: '确认跳过',
      content: '绑定手机或邮箱后可以跨设备同步数据，确定要跳过吗？',
      success: (res) => {
        if (res.confirm) {
          Taro.switchTab({ url: '/pages/index/index' })
        }
      },
    })
  }

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return undefined

    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer)
          return 0
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [countdown])

  const handleSendCode = async () => {
    if (countdown > 0) return
    if (!contact.trim()) {
      Taro.showToast({ title: '请输入' + (bindType === 'phone' ? '手机号' : '邮箱'), icon: 'none' })
      return
    }
    try {
      if (bindType === 'phone') {
        await sendCode(contact)
      } else {
        await sendCode(undefined, contact)
      }
      setCountdown(120)
    } catch {
      // toast shown in store
    }
  }

  const handleBind = async () => {
    if (!code.trim()) {
      Taro.showToast({ title: '请输入验证码', icon: 'none' })
      return
    }
    setIsProcessing(true)
    try {
      if (bindType === 'phone') {
        await bindAccount(contact, undefined, code)
      } else {
        await bindAccount(undefined, contact, code)
      }
      Taro.switchTab({ url: '/pages/index/index' })
    } catch {
      // toast shown in store
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <View className='bind-page'>
      {/* Header */}
      <View className='bind-header'>
        <Text className='bind-back' onClick={() => Taro.navigateBack()}>✕</Text>
        <Text className='bind-title'>绑定账号</Text>
        <View style={{ width: '40rpx' }} />
      </View>

      {/* Description */}
      <View className='bind-desc'>
        <Text className='bind-desc-icon'>🔗</Text>
        <Text className='bind-desc-text'>
          绑定手机或邮箱后可跨平台使用
        </Text>
      </View>

      {/* Type switcher */}
      <View className='bind-type-toggle'>
        <View
          className={`bind-type-btn ${bindType === 'phone' ? 'bind-type-btn--active' : ''}`}
          onClick={() => setBindType('phone')}
        >
          <Text>手机号</Text>
        </View>
        <View
          className={`bind-type-btn ${bindType === 'email' ? 'bind-type-btn--active' : ''}`}
          onClick={() => setBindType('email')}
        >
          <Text>邮箱</Text>
        </View>
      </View>

      {/* Contact input */}
      <View className='input-group'>
        <Text className='input-label'>
          {bindType === 'phone' ? '手机号' : '邮箱地址'}
        </Text>
        <Input
          className='input-field'
          placeholder={bindType === 'phone' ? '请输入手机号' : '请输入邮箱'}
          type={bindType === 'email' ? 'text' : 'number'}
          value={contact}
          onInput={(e) => setContact(e.detail.value)}
        />
      </View>

      {/* Code */}
      <View className='input-group'>
        <Text className='input-label'>验证码</Text>
        <View className='code-row'>
          <Input
            className='input-field code-input'
            placeholder='输入验证码'
            type='number'
            value={code}
            onInput={(e) => setCode(e.detail.value)}
            maxlength={6}
          />
          <View
            className={`code-btn ${countdown > 0 ? 'code-btn--disabled' : ''}`}
            onClick={handleSendCode}
          >
            <Text>
              {countdown > 0 ? `${countdown}s` : '获取验证码'}
            </Text>
          </View>
        </View>
      </View>

      {/* Submit */}
      <View
        className={`bind-submit ${isProcessing ? 'bind-submit--loading' : ''}`}
        onClick={!isProcessing ? handleBind : undefined}
      >
        <Text>{isProcessing ? '绑定中...' : '完成绑定'}</Text>
      </View>

      {/* Agreement */}
      <View className='bind-agreement'>
        <Text className='bind-agreement-text'>
          点击绑定即表示同意{' '}
          <Text className='bind-agreement-link' onClick={openUserAgreement}>
            《用户协议》
          </Text>
          {' '}和{' '}
          <Text className='bind-agreement-link' onClick={openPrivacyPolicy}>
            《隐私政策》
          </Text>
        </Text>
      </View>

      {/* Skip */}
      <Text className='bind-skip' onClick={handleSkip}>
        跳过绑定 ›
      </Text>
    </View>
  )
}
