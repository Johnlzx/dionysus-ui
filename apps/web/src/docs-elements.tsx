/**
 * [INPUT]: 依赖 React 状态、Lucide 图标与 @dionysus/ui 真实 Button/Badge/Surface/SegmentedControl 原语
 * [OUTPUT]: 对外提供文档页标题、Section、Specimen、代码复制、Token 行、属性表和规则提示组件
 * [POS]: web/src 的文档呈现层，只组织设计系统信息，不创建平行基础组件
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
import { useState, type ReactNode } from "react";
import { Check, Clipboard, Info, ShieldCheck } from "lucide-react";
import { Badge, Button, SegmentedControl, Surface, cn } from "@dionysus/ui";

interface PageIntroProps {
  eyebrow: string;
  title: string;
  description: string;
  status?: string;
  meta?: ReactNode;
}

function PageIntro({ eyebrow, title, description, status, meta }: PageIntroProps) {
  return (
    <header className="border-b border-border pb-10 pt-2">
      <div className="mb-5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span>{eyebrow}</span>
        <span aria-hidden>·</span>
        <span>Dionysus UI</span>
        {status ? <Badge variant="success" size="xs">{status}</Badge> : null}
      </div>
      <h1 className="max-w-3xl text-3xl font-medium tracking-[-0.035em] text-foreground sm:text-4xl">{title}</h1>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">{description}</p>
      {meta ? <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">{meta}</div> : null}
    </header>
  );
}

interface DocSectionProps {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

function DocSection({ id, title, description, children, className }: DocSectionProps) {
  return (
    <section id={id} className={cn("scroll-mt-20 border-b border-border py-10 last:border-b-0", className)}>
      <div className="mb-6 max-w-2xl">
        <h2 className="text-base font-medium tracking-tight">{title}</h2>
        {description ? <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

interface SpecimenProps {
  title: string;
  description: string;
  children: ReactNode;
  code: string;
  previewClassName?: string;
}

function Specimen({ title, description, children, code, previewClassName }: SpecimenProps) {
  const [view, setView] = useState<"preview" | "code">("preview");
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1_400);
  };

  return (
    <Surface className="overflow-hidden">
      <div className="flex min-h-12 flex-wrap items-center gap-3 border-b border-border px-3 py-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium">{title}</p>
          <p className="mt-0.5 text-micro leading-4 text-muted-foreground">{description}</p>
        </div>
        <SegmentedControl
          value={view}
          onValueChange={(nextView) => setView(nextView === "code" ? "code" : "preview")}
          label={`${title} 展示方式`}
          items={[
            { value: "preview", label: "预览" },
            { value: "code", label: "代码" },
          ]}
        />
      </div>
      {view === "preview" ? (
        <div className={cn("specimen-enter flex min-h-56 items-center justify-center bg-muted/15 p-6 sm:p-10", previewClassName)}>
          {children}
        </div>
      ) : (
        <div className="docs-code specimen-enter relative min-h-56 p-4">
          <Button variant="ghost" size="icon-sm" className="docs-code-copy absolute right-3 top-3" aria-label="复制代码" title="复制代码" onClick={() => void copy()}>
            {copied ? <Check /> : <Clipboard />}
          </Button>
          <pre className="overflow-x-auto pr-10 font-mono text-xs leading-6"><code>{code}</code></pre>
        </div>
      )}
    </Surface>
  );
}

function InlineCode({ children }: { children: ReactNode }) {
  return <code className="rounded-md border border-border bg-muted/55 px-1.5 py-0.5 font-mono text-[0.75rem] text-foreground">{children}</code>;
}

interface TokenRowProps {
  name: string;
  role: string;
  value: string;
  swatchClassName: string;
}

function TokenRow({ name, role, value, swatchClassName }: TokenRowProps) {
  return (
    <div className="grid min-h-16 grid-cols-[2.5rem_minmax(0,1fr)] items-center gap-3 border-b border-border/80 py-3 last:border-b-0 sm:grid-cols-[2.5rem_minmax(10rem,1fr)_minmax(12rem,1.2fr)_auto]">
      <span className={cn("size-8 rounded-lg border border-foreground/8 shadow-[var(--surface-shadow)]", swatchClassName)} />
      <div className="min-w-0">
        <code className="block truncate font-mono text-xs">--{name}</code>
        <span className="mt-0.5 block text-micro text-muted-foreground sm:hidden">{role}</span>
      </div>
      <p className="hidden text-xs leading-5 text-muted-foreground sm:block">{role}</p>
      <code className="col-span-2 truncate font-mono text-micro text-muted-foreground sm:col-span-1">{value}</code>
    </div>
  );
}

interface PropRow {
  name: string;
  type: string;
  defaultValue: string;
  description: string;
}

function PropTable({ rows }: { rows: PropRow[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[42rem] border-collapse text-left text-xs">
        <thead className="bg-muted/45 text-muted-foreground">
          <tr>
            <th className="px-3 py-2.5 font-medium">Prop</th>
            <th className="px-3 py-2.5 font-medium">Type</th>
            <th className="px-3 py-2.5 font-medium">Default</th>
            <th className="px-3 py-2.5 font-medium">说明</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name} className="border-t border-border align-top">
              <td className="px-3 py-3 font-mono text-foreground">{row.name}</td>
              <td className="px-3 py-3 font-mono text-info-foreground">{row.type}</td>
              <td className="px-3 py-3 font-mono text-muted-foreground">{row.defaultValue}</td>
              <td className="px-3 py-3 leading-5 text-muted-foreground">{row.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RuleNote({ children, kind = "info" }: { children: ReactNode; kind?: "info" | "safety" }) {
  const Icon = kind === "safety" ? ShieldCheck : Info;
  return (
    <div className={cn("flex gap-3 rounded-xl border p-3 text-xs leading-5", kind === "safety" ? "border-success/20 bg-success/5 text-success-foreground" : "border-info/20 bg-info/5 text-foreground")}>
      <Icon aria-hidden className={cn("mt-0.5 size-4 shrink-0", kind === "info" && "text-info-foreground")} />
      <div>{children}</div>
    </div>
  );
}

export { DocSection, InlineCode, PageIntro, PropTable, RuleNote, Specimen, TokenRow };
export type { PropRow };
