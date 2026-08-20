# Dionysus UI

Dionysus UI 是一套面向高密度创作工具的 React 设计系统。它采用克制的中性色、悬浮内容工作区、宽侧栏导航和语义化 light/dark Token，在保证信息密度的同时维持安静、清晰的界面层级。

本仓库当前包含：

- `packages/ui`：语义 Token、Button、PrismaticButton、Badge、Avatar、Input、SearchField、DropdownMenu、InlineEdit、InlineEditSelect、Surface、Dialog、SegmentedControl 与主题控制。
- `apps/web`：使用真实共享组件构建的设计系统文档站。
- `docs`：设计语言规范、视觉提取评估与后续产品化路线。

## 本地运行

要求 Node.js 24 和 pnpm 10。

```bash
pnpm install
pnpm dev
```

打开 <http://127.0.0.1:20003/overview>。

## 验证

```bash
pnpm typecheck
pnpm build
```

## 当前发布状态

这是设计系统的源码预览仓库。`@dionysus/ui` 暂未发布到 npm，shadcn Registry 与独立 Starter 也尚未开放。公开发布或重新分发前，必须完成许可证选择与第三方视觉来源审计，具体见 `THIRD_PARTY_NOTICES.md`。

当前仓库未附加开源许可证；保留所有未明确授予的权利。
