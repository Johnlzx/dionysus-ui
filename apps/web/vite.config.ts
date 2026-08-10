/**
 * [INPUT]: 依赖 Vite、React 与 Tailwind CSS v4 插件
 * [OUTPUT]: 对外提供 Web 设计系统站点构建配置和固定 20003 开发端口
 * [POS]: apps/web 的构建边界，与 Desktop 20000、API 20001 和 Agent 20002 端口约定错开
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 20_003, strictPort: true },
  preview: { port: 20_003, strictPort: true },
});
