import type { UserConfigExport } from '@tarojs/cli'

const config: UserConfigExport<'webpack5'> = {
  mini: {},
  h5: {
    devServer: {
      port: 10086,
    },
  },
}

export default config
