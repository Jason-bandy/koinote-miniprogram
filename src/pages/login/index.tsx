import { View, Text, Input, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import { useAuthStore } from '@/stores/auth'
import './index.scss'

import KOI_LOGO from '../../assets/icons/koi-logo.png'

type SubMode = 'register' | 'login'
type PageMode = 'wechat' | 'nickname'

export default function LoginPage() {
  const { wxLogin, nicknameLogin, nicknameRegister } = useAuthStore()

  const [pageMode, setPageMode] = useState<PageMode>('wechat')
  const [subMode, setSubMode] = useState<SubMode>('register')

  // Nickname fields
  const [nickname, setNickname] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)

  // Loading state
  const [isProcessing, setIsProcessing] = useState(false)

  const handleWxLogin = async () => {
    setIsProcessing(true)
    try {
      await wxLogin()
      const state = useAuthStore.getState()
      if (state.needsBinding) {
        // Show modal: bind now or skip
        Taro.showModal({
          title: '绑定账号',
          content: '绑定手机或邮箱后可以跨设备同步数据。现在绑定还是稍后在个人中心绑定？',
          confirmText: '现在绑定',
          cancelText: '稍后绑定',
          success: (res) => {
            if (res.confirm) {
              Taro.navigateTo({ url: '/pages/bind-account/index' })
            } else {
              Taro.switchTab({ url: '/pages/index/index' })
            }
          },
        })
      } else {
        // Already bound, go to home
        Taro.switchTab({ url: '/pages/index/index' })
      }
    } catch {
      // toast already shown in store
    } finally {
      setIsProcessing(false)
    }
  }

  const handleNicknameAction = async () => {
    const nick = nickname.trim()
    if (nick.length < 2) {
      Taro.showToast({ title: '昵称至少2个字符', icon: 'none' })
      return
    }
    if (password.length < 4) {
      Taro.showToast({ title: '密码至少4个字符', icon: 'none' })
      return
    }
    if (subMode === 'register' && password !== confirmPassword) {
      Taro.showToast({ title: '两次密码不一致', icon: 'none' })
      return
    }
    if (subMode === 'register' && !agreeTerms) {
      Taro.showToast({ title: '请先同意用户协议和隐私政策', icon: 'none' })
      return
    }

    setIsProcessing(true)
    try {
      if (subMode === 'register') {
        await nicknameRegister(nick, password)
      } else {
        await nicknameLogin(nick, password)
      }
      // Navigate to home
      Taro.switchTab({ url: '/pages/index/index' })
    } catch {
      // toast shown in store
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBack = () => {
    Taro.navigateBack()
  }

  return (
    <View className='login-page'>
      {/* Back button */}
      <Text className='login-back' onClick={handleBack}>✕</Text>

      {/* Header */}
      <View className='login-header'>
        <Image className='login-logo' src={KOI_LOGO} mode='aspectFit' />
        <Text className='login-title'>KoiNote</Text>
        <Text className='login-subtitle'>AI 智能笔记，你的第二大脑</Text>
      </View>

      {/* Mode switcher */}
      <View className='login-mode-toggle'>
        <View
          className={`login-mode-btn ${pageMode === 'wechat' ? 'login-mode-btn--active' : ''}`}
          onClick={() => setPageMode('wechat')}
        >
          <Text>🟢 微信登录</Text>
        </View>
        <View
          className={`login-mode-btn ${pageMode === 'nickname' ? 'login-mode-btn--active' : ''}`}
          onClick={() => setPageMode('nickname')}
        >
          <Text>👤 昵称</Text>
        </View>
      </View>

      {pageMode === 'wechat' && (
        /* ── WeChat login ─────────────────────────────────────────────── */
        <View className='login-content'>
          <View
            className={`wechat-btn ${isProcessing ? 'wechat-btn--loading' : ''}`}
            onClick={!isProcessing ? handleWxLogin : undefined}
          >
            {isProcessing ? (
              <Text>登录中...</Text>
            ) : (
              <Text>微信一键登录</Text>
            )}
          </View>

          <Text className='login-tip'>
            首次微信登录后将引导绑定手机或邮箱
          </Text>
        </View>
      )}

      {pageMode === 'nickname' && (
        /* ── Nickname mode ────────────────────────────────────────────── */
        <View className='login-content'>
          {/* Sub-mode tabs */}
          <View className='nickname-tabs'>
            <View
              className={`nickname-tab ${subMode === 'register' ? 'nickname-tab--active' : ''}`}
              onClick={() => setSubMode('register')}
            >
              <Text>注册</Text>
            </View>
            <View
              className={`nickname-tab ${subMode === 'login' ? 'nickname-tab--active' : ''}`}
              onClick={() => setSubMode('login')}
            >
              <Text>登录</Text>
            </View>
          </View>

          {/* Nickname */}
          <View className='input-group'>
            <Text className='input-label'>昵称</Text>
            <Input
              className='input-field'
              placeholder='2-20 个字符'
              value={nickname}
              onInput={(e) => setNickname(e.detail.value)}
              maxlength={20}
            />
          </View>

          {/* Password */}
          <View className='input-group'>
            <Text className='input-label'>密码</Text>
            <Input
              className='input-field'
              placeholder='4 个以上字符'
              password
              value={password}
              onInput={(e) => setPassword(e.detail.value)}
            />
          </View>

          {/* Confirm password (register only) */}
          {subMode === 'register' && (
            <View className='input-group'>
              <Text className='input-label'>确认密码</Text>
              <Input
                className='input-field'
                placeholder='再次输入密码'
                password
                value={confirmPassword}
                onInput={(e) => setConfirmPassword(e.detail.value)}
              />
            </View>
          )}

          {/* Terms (register only) */}
          {subMode === 'register' && (
            <View className='terms-row'>
              <View
                className={`checkbox ${agreeTerms ? 'checkbox--checked' : ''}`}
                onClick={() => setAgreeTerms(!agreeTerms)}
              >
                {agreeTerms && <Text>✓</Text>}
              </View>
              <Text className='terms-text'>
                我已阅读并同意{' '}
                <Text className='terms-link' onClick={() => {}}>
                  《用户协议》
                </Text>
                和{' '}
                <Text className='terms-link' onClick={() => {}}>
                  《隐私政策》
                </Text>
              </Text>
            </View>
          )}

          {/* Submit */}
          <View
            className={`submit-btn ${isProcessing ? 'submit-btn--loading' : ''}`}
            onClick={!isProcessing ? handleNicknameAction : undefined}
          >
            <Text>
              {isProcessing
                ? '处理中...'
                : subMode === 'register'
                ? '创建账号'
                : '登 录'}
            </Text>
          </View>
        </View>
      )}

      {/* Footer */}
      <View className='login-footer'>
        <Text className='login-footer-text'>
          继续使用即表示同意我们的条款
        </Text>
      </View>
    </View>
  )
}
