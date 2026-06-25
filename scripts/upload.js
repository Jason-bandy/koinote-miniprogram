const ci = require('miniprogram-ci')
const path = require('path')

const projectPath = path.resolve(__dirname, '..')
const privateKeyPath = '/Users/zhengzhican/Jobs/zplus/private.wx477490faadd9ec0e.key'
const appid = 'wx477490faadd9ec0e'

async function upload () {
  const project = new ci.Project({
    appid,
    type: 'miniProgram',
    projectPath,
    privateKeyPath,
    ignores: ['node_modules/**/*'],
  })

  console.log('Uploading to WeChat miniprogram...')
  const result = await ci.upload({
    project,
    robot: 1,
    version: '1.0.3',
    desc: '录音登录检查：未登录提示跳转，微信登录后可直接录音',
    setting: {
      es6: true,
      enhance: true,
      minified: true,
      autoRemoveUnusedNodeModules: true,
    },
    uploadRateLimiter: 0,
    onProgressUpdate: (info) => {
      console.log(`Upload progress: ${info.progress}% (${info.msg})`)
    },
  })

  console.log('Upload result:', JSON.stringify(result, null, 2))
  console.log('Version:', result?.version)
  console.log('Upload complete!')
}

upload().catch((err) => {
  console.error('Upload failed:', err)
  process.exit(1)
})
