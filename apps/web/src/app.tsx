/**
 * [INPUT]: 依赖 React Router、设计系统图标与导航模型、DocsShell 和 DocsPage
 * [OUTPUT]: 对外提供 Web 设计系统的 BrowserRouter 路由树、默认跳转和 404 页面
 * [POS]: web/src 的应用组合根，使每个设计资产拥有可刷新、可复制的稳定 URL
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Button, Surface } from "@dionysus/ui";
import { ArrowLeft, FileQuestion } from "@dionysus/ui/icons";
import { DocsShell } from "./docs-shell";
import { DocsPage } from "./pages";
import { DEFAULT_DOC_PATH, DOC_ITEMS } from "./navigation";

function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Surface variant="flat" className="max-w-md text-center">
        <span className="mx-auto flex size-11 items-center justify-center rounded-xl bg-muted text-muted-foreground"><FileQuestion className="size-5" /></span>
        <p className="mt-6 font-mono text-micro text-muted-foreground">404 · DOCUMENT NOT FOUND</p>
        <h1 className="mt-3 text-xl font-medium tracking-tight">这个设计资产还不存在。</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">返回总览继续浏览现有 Foundations、Components 和 Patterns。</p>
        <Button className="mt-6" onClick={() => { window.location.href = DEFAULT_DOC_PATH; }}><ArrowLeft />返回总览</Button>
      </Surface>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={DEFAULT_DOC_PATH} replace />} />
        {DOC_ITEMS.map((item) => (
          <Route key={item.id} path={item.path} element={<DocsShell><DocsPage pageId={item.id} /></DocsShell>} />
        ))}
        <Route path="*" element={<DocsShell><NotFoundPage /></DocsShell>} />
      </Routes>
    </BrowserRouter>
  );
}

export { App };
