import { useEffect } from 'react'
import { useLaunch } from '@tarojs/taro'
import { useAuthStore } from '@/stores/auth'
import './app.scss'

function App({ children }: { children: React.ReactNode }) {
  useLaunch(async () => {
    // Load cached auth state
    await useAuthStore.getState().loadCachedUser()
  })

  useEffect(() => {}, [])

  return children
}

export default App
