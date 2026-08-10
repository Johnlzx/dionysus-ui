/**
 * [INPUT]: 依赖 Vite client 类型与 Inter Variable 的副作用样式导入
 * [OUTPUT]: 为 Web 源码提供 Vite 环境和字体 CSS 模块声明
 * [POS]: web/src 的构建类型边界，不包含运行时代码
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
/// <reference types="vite/client" />

declare module "@fontsource-variable/inter";
