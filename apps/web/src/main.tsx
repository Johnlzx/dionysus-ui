/**
 * [INPUT]: 依赖 React StrictMode/createRoot、Inter Variable、App 与 Web 专属样式
 * [OUTPUT]: 把 Dionysus UI Web 设计系统挂载到 index.html 的 #root
 * [POS]: web/src 的唯一浏览器启动入口
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/inter";
import { App } from "./app";
import "./styles.css";

const root = document.getElementById("root");
if (!root) throw new Error("Web root element #root is missing");

createRoot(root).render(<StrictMode><App /></StrictMode>);
