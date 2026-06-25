import { View, WebView } from '@tarojs/components'
import { useRoute } from '@tarojs/runtime'
import './index.scss'

export default function WebViewPage() {
  const route = useRoute()
  const url = route?.params?.url || ''

  return (
    <View className='webview-page'>
      <WebView src={url} />
    </View>
  )
}
