/**
 * User profile types
 */

export interface UserProfile {
  id: string
  displayName: string
  handle?: string
  avatarUrl?: string
  phone?: string
  email?: string
  subscriptionTier: string
  aiCallsUsedMonth: number
  aiCallsLimit: number
  wechatLinked: boolean
}

export interface TokenResponse {
  access_token: string
  token_type: string
  is_bound?: boolean
}
