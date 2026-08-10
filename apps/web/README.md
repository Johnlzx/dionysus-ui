# Dionysus UI Web

独立的 Dionysus 设计系统站点。它使用 `@dionysus/ui` 的真实 Token 与组件构建自身，提供 Overview、Foundations、Components、Patterns、Resources 五级信息架构。

## 本地运行

```bash
pnpm dev:web
```

打开 <http://127.0.0.1:20003/overview>。

## 验证

```bash
pnpm --filter @dionysus/ui typecheck
pnpm --filter @dionysus/web typecheck
pnpm --filter @dionysus/web build
```

## 当前边界

- 设计系统站点不连接 API、Supabase、Electron IPC 或本地文件系统。
- 共享基础包当前包含 Token、Button、Badge、Avatar、Input、SearchField、Surface 和主题控制。
- Desktop 仍使用既有 Renderer 组件；迁移为共同消费 `@dionysus/ui` 是下一阶段工作。
- React Bits Pro Fog Sphere 不进入共享基础包；Glass Surface 与 Multica 相关实现公开分发前仍需许可复核或替换。

[PROTOCOL]: 变更时更新此文档，然后检查 `AGENTS.md` 与根级第三方许可记录。
