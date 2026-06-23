import Taro from '@tarojs/taro'
import { API_BASE_URL, TOKEN_STORAGE_KEY } from '@/utils/constants'

/**
 * Wrapped Taro.request with JWT interceptor + 401 retry.
 */
export interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  data?: Record<string, unknown> | string
  header?: Record<string, string>
  timeout?: number
}

export interface Response<T = unknown> {
  data: T
  statusCode: number
}

async function getToken(): Promise<string | undefined> {
  try {
    return Taro.getStorageSync(TOKEN_STORAGE_KEY)
  } catch {
    return undefined
  }
}

async function fetchDevToken(): Promise<string | undefined> {
  try {
    const res = await Taro.request<Record<string, unknown>>({
      url: `${API_BASE_URL}/api/v1/auth/dev-token`,
      method: 'POST',
      timeout: 10000,
    })
    const token = (res.data as Record<string, unknown>)['access_token'] as
      | string
      | undefined
    if (token) {
      Taro.setStorageSync(TOKEN_STORAGE_KEY, token)
    }
    return token
  } catch {
    return undefined
  }
}

async function ensureToken(): Promise<string | undefined> {
  let token = await getToken()
  if (!token) {
    token = await fetchDevToken()
  }
  return token
}

export async function request<T = unknown>(
  options: RequestOptions,
  isRetry = false,
): Promise<T> {
  const { url, method = 'GET', data, header = {}, timeout = 30000 } = options

  let token = await getToken()
  if (!token && !isRetry) {
    token = await fetchDevToken()
  }

  const authHeader: Record<string, string> = {}
  if (token) {
    authHeader['Authorization'] = `Bearer ${token}`
  }

  try {
    const res = await Taro.request<T>({
      url: `${API_BASE_URL}${url}`,
      method: method.toUpperCase() as 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
      data,
      header: {
        'Content-Type': 'application/json',
        ...authHeader,
        ...header,
      },
      timeout,
    })

    return res.data
  } catch (err: unknown) {
    const httpErr = err as { statusCode?: number; data?: Record<string, unknown> }
    if (httpErr.statusCode === 401 && !isRetry) {
      // Token expired — refresh and retry once
      const newToken = await fetchDevToken()
      if (newToken) {
        return request<T>(options, true)
      }
    }
    throw err
  }
}

/** Ensure the user is authenticated (fetch dev token if needed). */
export async function ensureAuthenticated(): Promise<void> {
  await ensureToken()
}
