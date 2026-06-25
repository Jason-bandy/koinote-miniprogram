/**
 * Auth store — mirrors auth_provider.dart + LoginViewModel
 */
import { create } from 'zustand'
import Taro from '@tarojs/taro'
import { request } from '@/services/request'
import { TOKEN_STORAGE_KEY } from '@/utils/constants'
import type { UserProfile } from '@/types/user'

interface AuthState {
  user: UserProfile | null
  token: string | null
  isAuthenticated: boolean
  needsBinding: boolean

  // Actions
  wxLogin: () => Promise<void>
  nicknameLogin: (nick: string, pass: string) => Promise<void>
  nicknameRegister: (nick: string, pass: string) => Promise<void>
  sendCode: (phone?: string, email?: string) => Promise<void>
  codeLogin: (phone: string | undefined, email: string | undefined, code: string) => Promise<void>
  bindAccount: (phone: string | undefined, email: string | undefined, code: string) => Promise<void>
  logout: () => Promise<void>
  fetchProfile: () => Promise<void>
  loadCachedUser: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  needsBinding: false,

  loadCachedUser: async () => {
    const token = Taro.getStorageSync(TOKEN_STORAGE_KEY)
    if (token) {
      set({ token, isAuthenticated: true })
      await get().fetchProfile()
    }
    // Do NOT auto-fetch demo token — user starts unauthenticated and can
    // choose to log in via WeChat or other methods
  },

  wxLogin: async () => {
    try {
      // Clear any existing token (e.g., demo token) before WeChat login
      Taro.removeStorageSync(TOKEN_STORAGE_KEY)
      set({ token: null, isAuthenticated: false })

      const { code } = await Taro.login()
      const res = await request<{ access_token: string; is_bound: boolean }>({
        url: '/api/v1/auth/wx-login',
        method: 'POST',
        data: { code },
      })

      Taro.setStorageSync(TOKEN_STORAGE_KEY, res.access_token)
      const needsBinding = !res.is_bound
      set({ token: res.access_token, isAuthenticated: true, needsBinding })

      if (!needsBinding) {
        await get().fetchProfile()
      }
    } catch (e) {
      Taro.showToast({ title: '微信登录失败', icon: 'error' })
      throw e
    }
  },

  nicknameLogin: async (nick: string, pass: string) => {
    try {
      const res = await request<{ access_token: string }>({
        url: '/api/v1/auth/nickname-login',
        method: 'POST',
        data: { nickname: nick, password: pass },
      })
      Taro.setStorageSync(TOKEN_STORAGE_KEY, res.access_token)
      set({ token: res.access_token, isAuthenticated: true, needsBinding: false })
      await get().fetchProfile()
      Taro.showToast({ title: '登录成功', icon: 'success' })
    } catch (e: unknown) {
      const err = e as { statusCode?: number; data?: Record<string, unknown> }
      const msg = (err.data as Record<string, unknown> | undefined)?.['detail'] ?? '登录失败'
      Taro.showToast({ title: String(msg), icon: 'error' })
    }
  },

  nicknameRegister: async (nick: string, pass: string) => {
    try {
      const res = await request<{ access_token: string }>({
        url: '/api/v1/auth/nickname-register',
        method: 'POST',
        data: { nickname: nick, password: pass },
      })
      Taro.setStorageSync(TOKEN_STORAGE_KEY, res.access_token)
      set({ token: res.access_token, isAuthenticated: true, needsBinding: false })
      await get().fetchProfile()
      Taro.showToast({ title: '注册成功', icon: 'success' })
    } catch (e: unknown) {
      const err = e as { statusCode?: number; data?: Record<string, unknown> }
      if (err.statusCode === 409) {
        Taro.showToast({
          title: '该昵称已被注册，请换一个',
          icon: 'error',
        })
      } else {
        const msg = (err.data as Record<string, unknown> | undefined)?.['detail'] ?? '注册失败'
        Taro.showToast({ title: String(msg), icon: 'error' })
      }
    }
  },

  sendCode: async (phone?: string, email?: string) => {
    try {
      const res = await request({
        url: '/api/v1/auth/send-code',
        method: 'POST',
        data: phone ? { phone, code_type: 'login' } : { email, code_type: 'login' },
      })
      Taro.showToast({ title: '验证码已发送', icon: 'success' })
      // In dev mode, the code is returned in the response - show it for testing
      if (res && (res as any).code) {
        Taro.showModal({
          title: '验证码',
          content: `测试验证码：${(res as any).code}`,
          showCancel: false,
        })
      }
    } catch (e: unknown) {
      const err = e as { statusCode?: number; data?: Record<string, unknown> }
      const msg = (err.data as Record<string, unknown> | undefined)?.['detail'] ?? '发送失败'
      Taro.showToast({ title: String(msg), icon: 'error' })
    }
  },

  codeLogin: async (phone?: string, email?: string, code = '') => {
    try {
      const res = await request<{ access_token: string }>({
        url: '/api/v1/auth/code-login',
        method: 'POST',
        data: { phone, email, code },
      })
      Taro.setStorageSync(TOKEN_STORAGE_KEY, res.access_token)
      set({ token: res.access_token, isAuthenticated: true, needsBinding: false })
      await get().fetchProfile()
      Taro.showToast({ title: '登录成功', icon: 'success' })
    } catch (e: unknown) {
      const err = e as { statusCode?: number; data?: Record<string, unknown> }
      const msg = (err.data as Record<string, unknown> | undefined)?.['detail'] ?? '登录失败'
      Taro.showToast({ title: String(msg), icon: 'error' })
    }
  },

  bindAccount: async (phone?: string, email?: string, code = '') => {
    try {
      await request({
        url: '/api/v1/auth/wx-bind',
        method: 'POST',
        data: { phone, email, code },
      })
      set({ needsBinding: false })
      Taro.showToast({ title: '绑定成功', icon: 'success' })
      await get().fetchProfile()
    } catch (e: unknown) {
      const err = e as { statusCode?: number; data?: Record<string, unknown> }
      const msg = (err.data as Record<string, unknown> | undefined)?.['detail'] ?? '绑定失败'
      Taro.showToast({ title: String(msg), icon: 'error' })
    }
  },

  logout: async () => {
    try {
      await request({ url: '/api/v1/auth/logout', method: 'POST' })
    } catch {
      // ignore
    }
    Taro.removeStorageSync(TOKEN_STORAGE_KEY)
    set({ user: null, token: null, isAuthenticated: false, needsBinding: false })
  },

  fetchProfile: async () => {
    try {
      const user = await request<UserProfile>({
        url: '/api/v1/auth/me',
        method: 'GET',
      })
      set({ user })
    } catch {
      // token expired or invalid
      set({ user: null, isAuthenticated: false })
    }
  },
}))
