import type { UserConfigExport } from '@tarojs/cli'
import * as path from 'path'
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'

const config: UserConfigExport<'webpack5'> = {
  projectName: 'koinote-miniprogram',
  date: '2025-6-10',
  designWidth: 750,
  deviceRatio: {
    640: 1.17,
    750: 1,
    828: 0.905,
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  framework: 'react',
  plugins: ['@tarojs/plugin-framework-react'],
  compiler: {
    type: 'webpack5',
    prebundle: { enable: false },
  },
  alias: {
    '@/types': path.resolve(__dirname, '../src/types'),
    '@/stores': path.resolve(__dirname, '../src/stores'),
    '@/services': path.resolve(__dirname, '../src/services'),
    '@/hooks': path.resolve(__dirname, '../src/hooks'),
    '@/utils': path.resolve(__dirname, '../src/utils'),
    '@/styles': path.resolve(__dirname, '../src/styles'),
    '@/components': path.resolve(__dirname, '../src/components'),
    '@/pages': path.resolve(__dirname, '../src/pages'),
  },
  mini: {
    postcss: {
      pxtransform: { enable: true },
      url: { enable: true, config: { limit: 1024 } },
    },
    webpackChain(chain: any) {
      chain.resolve.plugin('tsconfig-paths').use(TsconfigPathsPlugin, [])
    },
  },
  h5: {
    postcss: { autoprefixer: { enable: true } },
  },
}

export default config
