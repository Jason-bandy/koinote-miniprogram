# KoiNote 微信小程序

KoiNote AI 笔记小程序版，基于 Taro 4 + React 18 + TypeScript。

## 快速开始

```bash
# 安装依赖
npm install

# 开发模式（微信开发者工具打开 dist 目录）
npm run dev:weapp

# 构建
npm run build:weapp
```

## 技术栈

- **框架**: Taro 4.x + React 18
- **语言**: TypeScript
- **样式**: SCSS
- **状态管理**: Zustand
- **HTTP**: Taro.request
- **认证**: Dev Token（复用 Web 端）

## 域名配置

在微信开发者工具中：
1. 详情 → 本地调试 → 勾选「不校验合法域名」（开发阶段）

生产阶段需在微信公众平台配置：
- request 域名: `https://api.koinote.transkoi.com`
- socket 域名: `wss://api.koinote.transkoi.com`

## 项目结构

```
src/
├── types/         # TypeScript 类型定义
├── stores/        # Zustand 状态管理
├── services/      # API 请求 + 业务逻辑
├── hooks/         # 自定义 Hooks
├── utils/         # 工具函数
├── styles/        # 全局样式 + 设计 Token
├── pages/         # 页面
│   ├── index/     # 首页
│   ├── library/   # 知识库
│   ├── search/    # 搜索
│   ├── report/    # 周报
│   ├── record-detail/  # 记录详情
│   ├── note-create/    # 灵感速记
│   ├── meeting/         # 会议录音
│   ├── photo/           # 拍照 OCR
│   └── web-import/      # 链接导入
├── app.tsx        # 应用入口
├── app.config.ts  # 路由配置
└── app.scss       # 全局样式
```
