export default {
  pages: [
    'pages/index/index',
    'pages/library/index',
    'pages/search/index',
    'pages/report/index',
    'pages/login/index',
    'pages/bind-account/index',
    'pages/profile/index',
    'pages/record-detail/index',
    'pages/note-create/index',
    'pages/meeting/index',
    'pages/photo/index',
    'pages/web-import/index',
  ],
  tabBar: {
    color: '#888780',
    selectedColor: '#0F172A',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
      },
      {
        pagePath: 'pages/library/index',
        text: '知识库',
      },
      {
        pagePath: 'pages/search/index',
        text: '搜索',
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的',
      },
    ],
  },
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#FFFFFF',
    navigationBarTitleText: 'KoiNote',
    navigationBarTextStyle: 'black',
    backgroundColor: '#FFFFFF',
  },
}
