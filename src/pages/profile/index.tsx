import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth'
import './index.scss'

export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated) {
      useAuthStore.getState().fetchProfile()
    }
  }, [])

  const handleLogin = () => {
    Taro.navigateTo({ url: '/pages/login/index' })
  }

  const handleLogout = () => {
    Taro.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: async (res) => {
        if (res.confirm) {
          await logout()
          Taro.showToast({ title: '已退出', icon: 'success' })
        }
      },
    })
  }

  // ── Not logged in ──────────────────────────────────────────────────────

  if (!isAuthenticated) {
    return (
      <View className='profile-page'>
        <View className='profile-empty'>
          <Text className='profile-empty-icon'>👤</Text>
          <Text className='profile-empty-title'>暂无登录</Text>
          <Text className='profile-empty-sub'>登录后同步所有数据</Text>
          <View className='profile-login-btn' onClick={handleLogin}>
            <Text>登录 / 注册</Text>
          </View>
        </View>
      </View>
    )
  }

  // ── Logged in ─────────────────────────────────────────────────────────

  return (
    <ScrollView scrollY className='profile-page'>
      {/* User card */}
      <View className='profile-card'>
        <View className='profile-avatar'>
          <Text className='profile-avatar-icon'>
            {user?.avatarUrl ? '' : '🎋'}
          </Text>
          {user?.avatarUrl && (
            <Text className='profile-avatar-url'>{user.avatarUrl}</Text>
          )}
        </View>
        <Text className='profile-name'>{user?.displayName || '锦鲤用户'}</Text>
        {user?.handle && (
          <Text className='profile-handle'>@{user.handle}</Text>
        )}
        <View className='profile-tier'>
          <Text className='profile-tier-text'>
            {user?.subscriptionTier === 'pro' ? '✨ Pro' : '🎋 Free'}
          </Text>
        </View>
      </View>

      {/* Account info */}
      <View className='profile-section'>
        <Text className='section-title'>账号信息</Text>

        {user?.phone && (
          <View className='profile-row'>
            <Text className='profile-row-icon'>📱</Text>
            <View className='profile-row-content'>
              <Text className='profile-row-label'>手机号</Text>
              <Text className='profile-row-value'>{user.phone}</Text>
            </View>
          </View>
        )}

        {user?.email && (
          <View className='profile-row'>
            <Text className='profile-row-icon'>📧</Text>
            <View className='profile-row-content'>
              <Text className='profile-row-label'>邮箱</Text>
              <Text className='profile-row-value'>{user.email}</Text>
            </View>
          </View>
        )}

        {!user?.phone && !user?.email && (
          <View className='profile-row'>
            <Text className='profile-row-icon'>🔗</Text>
            <View className='profile-row-content'>
              <Text className='profile-row-label'>绑定手机/邮箱</Text>
              <Text
                className='profile-row-bind'
                onClick={() => Taro.navigateTo({ url: '/pages/bind-account/index' })}
              >
                去绑定 ›
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* AI quota */}
      <View className='profile-section'>
        <Text className='section-title'>AI 使用情况</Text>
        <View className='profile-quota'>
          <View className='profile-quota-row'>
            <Text className='profile-quota-label'>本月已用</Text>
            <Text className='profile-quota-value'>
              {user?.aiCallsUsedMonth ?? 0} /{' '}
              {user?.aiCallsLimit === -1 ? '∞' : user?.aiCallsLimit ?? 50}
            </Text>
          </View>
        </View>
      </View>

      {/* Settings */}
      <View className='profile-section'>
        <Text className='section-title'>设置</Text>

        <View className='profile-row' onClick={() => Taro.navigateTo({ url: '/pages/web-import/index' })}>
          <Text className='profile-row-icon'>🔗</Text>
          <Text className='profile-row-label'>链接导入</Text>
          <Text className='profile-row-arrow'>›</Text>
        </View>

        <View className='profile-row' onClick={handleLogout}>
          <Text className='profile-row-icon'>🚪</Text>
          <Text className='profile-row-label profile-row-danger'>退出登录</Text>
          <Text className='profile-row-arrow'>›</Text>
        </View>
      </View>

      <View style={{ height: '100rpx' }} />
    </ScrollView>
  )
}
