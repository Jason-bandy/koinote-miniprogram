import Taro from '@tarojs/taro'
import { API_BASE_URL, TOKEN_STORAGE_KEY } from '@/utils/constants'

/**
 * Wrapped Taro.request with JWT interceptor + 401 retry.
 * Does NOT auto-fetch demo token — user must explicitly log in.
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

/** Public getter for the stored token (for uploadFile headers, etc.). */
export async function getToken(): Promise<string | undefined> {
  try {
    return Taro.getStorageSync(TOKEN_STORAGE_KEY)
  } catch {
    return undefined
  }
}

export async function request<T = unknown>(
  options: RequestOptions,
  isRetry = false,
): Promise<T> {
  const { url, method = 'GET', data, header = {}, timeout = 30000 } = options

  const token = await getToken()

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
    if (httpErr.statusCode === 401 && !isRetry && token) {
      // Token expired — user needs to log in again
      // We do NOT auto-fetch demo token; user must explicitly log in
      Taro.removeStorageSync(TOKEN_STORAGE_KEY)
    }
    throw err
  }
}
