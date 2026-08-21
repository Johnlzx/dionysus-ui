/**
 * [INPUT]: 依赖 React 状态/DOM 生命周期、Motion、共享 Button/PrismaticButton、受控图标、Agent 浮窗参数与语义 Token
 * [OUTPUT]: 对外提供可缩放、可管理会话、含分阶段右下角形变转场、异步反馈和流式揭示的 AgentConversationCorner 及其数据类型
 * [POS]: ui/src 的高层 Agent 产品交互组件，把触发、浮窗、历史、输入、反馈与无障碍收敛为单一可复用契约
 * [PROTOCOL]: 变更时更新此头部，然后检查 docs/DESIGN_SYSTEM.md 与 docs/reference-analysis/agent-corner/alignment-report.md
 */
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowLeft,
  ArrowUp,
  ChevronDown,
  Copy,
  History,
  Maximize2,
  Minimize2,
  Paperclip,
  Plus,
  RefreshCw,
  Sparkles,
  Square,
  ThumbsDown,
  ThumbsUp,
  Trash2,
} from "./icons";
import { cn } from "./cn";
import { Button } from "./primitives";
import { PrismaticButton } from "./prismatic-button";
import {
  AGENT_CORNER_CONTENT_ENTER,
  AGENT_CORNER_CONTENT_EXIT,
  AGENT_CORNER_ENTER,
  AGENT_CORNER_EXIT,
  AGENT_CORNER_SIZE,
  AGENT_CORNER_SPRING,
  AGENT_CORNER_TRANSFER,
  AGENT_CORNER_TRIGGER_MORPH,
  AGENT_CORNER_VIEW_TRANSITION,
} from "./agent-conversation-motion";

type AgentMessageRole = "assistant" | "user";
type AgentMessageStatus = "complete" | "error" | "stopped" | "streaming";
type AgentFeedbackValue = "down" | "up";

interface AgentMessage {
  id: string;
  role: AgentMessageRole;
  content: string;
  status?: AgentMessageStatus;
}

interface AgentConversation {
  id: string;
  title: string;
  updatedLabel?: string;
  messages: AgentMessage[];
}

interface AgentQuickAction {
  label: string;
  prompt: string;
}

interface AgentConversationSize {
  width: number;
  height: number;
}

interface AgentResponseContext {
  conversationId: string;
  signal: AbortSignal;
}

interface AgentConversationCornerProps {
  className?: string;
  defaultOpen?: boolean;
  defaultSize?: AgentConversationSize;
  emptyDescription?: string;
  emptyTitle?: string;
  initialConversationId?: string;
  initialConversations?: AgentConversation[];
  minSize?: AgentConversationSize;
  onAttach?: () => void;
  onConversationsChange?: (conversations: AgentConversation[]) => void;
  onFeedback?: (message: AgentMessage, feedback: AgentFeedbackValue) => void;
  onGenerateResponse?: (prompt: string, context: AgentResponseContext) => Promise<string> | string;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  placeholder?: string;
  quickActions?: AgentQuickAction[];
  title?: string;
  triggerLabel?: string;
}

type RunState = "idle" | "streaming" | "thinking";
type PanelView = "conversation" | "history";
type ResizeAxis = "both" | "horizontal" | "vertical";

const THINKING_PHASES = [
  { glyph: "✦", label: "理解意图" },
  { glyph: "⋯", label: "检索上下文" },
  { glyph: "∷", label: "连接线索" },
  { glyph: "⌁", label: "组织答案" },
  { glyph: "※", label: "校验表达" },
] as const;

const DEFAULT_QUICK_ACTIONS: AgentQuickAction[] = [
  { label: "梳理重点", prompt: "请帮我梳理当前内容的重点。" },
  { label: "优化表达", prompt: "请优化当前内容的表达，但保留原意。" },
];

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

function wait(duration: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(new Error("aborted"));
      return;
    }
    const timer = window.setTimeout(resolve, duration);
    signal.addEventListener("abort", () => {
      window.clearTimeout(timer);
      reject(new Error("aborted"));
    }, { once: true });
  });
}

function cloneConversations(conversations: AgentConversation[]) {
  return conversations.map((conversation) => ({
    ...conversation,
    messages: conversation.messages.map((message) => ({ ...message })),
  }));
}

function AgentEmptySignal() {
  return (
    <div aria-hidden className="agent-corner-empty-signal">
      <span className="agent-corner-empty-signal__halo" />
      <pre className="agent-corner-empty-signal__glyph">{`╲  ·  ╱\n—  ◇  —\n╱  ·  ╲`}</pre>
    </div>
  );
}

function AgentThinkingIndicator({ index }: { index: number }) {
  const phase = THINKING_PHASES[index % THINKING_PHASES.length];
  return (
    <div className="flex h-7 items-center gap-2 font-mono text-micro text-success-foreground" role="status">
      <span aria-hidden className="agent-corner-thinking-glyph">{phase.glyph}</span>
      <span className="relative inline-flex h-4 min-w-[5.5rem] items-center overflow-hidden">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            className="absolute left-0 whitespace-nowrap"
            exit={{ opacity: 0, y: -5, filter: "blur(2px)" }}
            initial={{ opacity: 0, y: 5, filter: "blur(2px)" }}
            key={phase.label}
            transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
          >
            {phase.label}
          </motion.span>
        </AnimatePresence>
      </span>
    </div>
  );
}

function AgentMessageActions({
  feedback,
  message,
  onCopy,
  onFeedback,
  onRetry,
}: {
  feedback?: AgentFeedbackValue;
  message: AgentMessage;
  onCopy: () => void;
  onFeedback: (value: AgentFeedbackValue) => void;
  onRetry: () => void;
}) {
  if (message.status === "error") {
    return (
      <div className="mt-2 flex items-center gap-1">
        <Button onClick={onRetry} size="xs" variant="ghost"><RefreshCw />重试</Button>
      </div>
    );
  }

  return (
    <div className="mt-2 flex items-center gap-0.5 text-muted-foreground">
      <Button aria-label="复制回答" onClick={onCopy} size="icon-xs" title="复制回答" variant="ghost"><Copy /></Button>
      <Button aria-label="重新生成" onClick={onRetry} size="icon-xs" title="重新生成" variant="ghost"><RefreshCw /></Button>
      <Button
        aria-label="回答有帮助"
        className={feedback === "up" ? "bg-surface-selected text-foreground" : undefined}
        onClick={() => onFeedback("up")}
        size="icon-xs"
        title="回答有帮助"
        variant="ghost"
      ><ThumbsUp /></Button>
      <Button
        aria-label="回答需改进"
        className={feedback === "down" ? "bg-surface-selected text-foreground" : undefined}
        onClick={() => onFeedback("down")}
        size="icon-xs"
        title="回答需改进"
        variant="ghost"
      ><ThumbsDown /></Button>
      {message.status === "stopped" ? <span className="ml-1 text-micro">已停止</span> : null}
    </div>
  );
}

function AgentConversationCorner({
  className,
  defaultOpen = false,
  defaultSize = { width: AGENT_CORNER_SIZE.width, height: AGENT_CORNER_SIZE.height },
  emptyDescription = "可以引用当前页面、整理思路，或直接开始一个任务。",
  emptyTitle = "Agent 已就绪",
  initialConversationId,
  initialConversations = [],
  minSize = { width: AGENT_CORNER_SIZE.minWidth, height: AGENT_CORNER_SIZE.minHeight },
  onAttach,
  onConversationsChange,
  onFeedback,
  onGenerateResponse,
  onOpenChange,
  open,
  placeholder = "描述任务，Enter 发送，Shift + Enter 换行…",
  quickActions = DEFAULT_QUICK_ACTIONS,
  title = "新会话",
  triggerLabel = "打开 Agent",
}: AgentConversationCornerProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const instanceId = useId().replaceAll(":", "");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const activeRequestRef = useRef<AbortController | null>(null);
  const activeResponseMessageRef = useRef<string | null>(null);
  const activeResponseConversationRef = useRef<string | null>(null);
  const resizeCleanupRef = useRef<(() => void) | null>(null);
  const sequenceRef = useRef(1);
  const previousOpenRef = useRef(open ?? defaultOpen);

  const seedConversations = useMemo(() => {
    if (initialConversations.length > 0) return cloneConversations(initialConversations);
    return [{ id: `agent-${instanceId}-0`, title, updatedLabel: "刚刚", messages: [] }];
  }, [initialConversations, instanceId, title]);

  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [conversations, setConversations] = useState<AgentConversation[]>(seedConversations);
  const [activeConversationId, setActiveConversationId] = useState(
    initialConversationId && seedConversations.some(({ id }) => id === initialConversationId)
      ? initialConversationId
      : seedConversations[0].id,
  );
  const [view, setView] = useState<PanelView>("conversation");
  const [manualSize, setManualSize] = useState(defaultSize);
  const [bounds, setBounds] = useState({ width: 1024, height: 720 });
  const [maximized, setMaximized] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [draft, setDraft] = useState("");
  const [runState, setRunState] = useState<RunState>("idle");
  const [thinkingIndex, setThinkingIndex] = useState(0);
  const [deleteCandidate, setDeleteCandidate] = useState<string | null>(null);
  const [feedbackByMessage, setFeedbackByMessage] = useState<Record<string, AgentFeedbackValue>>({});
  const [lastPrompt, setLastPrompt] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const isOpen = open ?? internalOpen;
  const busy = runState !== "idle";

  const activeConversation = conversations.find(({ id }) => id === activeConversationId) ?? conversations[0];
  const messages = activeConversation?.messages ?? [];
  const panelTitle = activeConversation?.title || title;
  const panelInset = AGENT_CORNER_SIZE.inset;
  const maximumSize = {
    width: Math.max(0, bounds.width - panelInset * 2),
    height: Math.max(0, bounds.height - panelInset * 2),
  };
  const minimumSize = {
    width: Math.min(minSize.width, maximumSize.width),
    height: Math.min(minSize.height, maximumSize.height),
  };
  const panelSize = maximized ? maximumSize : {
    width: clamp(manualSize.width, minimumSize.width, maximumSize.width),
    height: clamp(manualSize.height, minimumSize.height, maximumSize.height),
  };

  const setOpen = useCallback((nextOpen: boolean) => {
    if (open === undefined) setInternalOpen(nextOpen);
    onOpenChange?.(nextOpen);
  }, [onOpenChange, open]);

  const updateConversationMessages = useCallback((
    conversationId: string,
    updater: (current: AgentMessage[]) => AgentMessage[],
  ) => {
    setConversations((current) => current.map((conversation) => (
      conversation.id === conversationId
        ? { ...conversation, messages: updater(conversation.messages), updatedLabel: "刚刚" }
        : conversation
    )));
  }, []);

  const createConversation = useCallback(() => {
    const responseConversationId = activeResponseConversationRef.current;
    const responseMessageId = activeResponseMessageRef.current;
    activeRequestRef.current?.abort();
    if (responseConversationId && responseMessageId) {
      updateConversationMessages(responseConversationId, (current) => current.map((message) => (
        message.id === responseMessageId ? { ...message, status: "stopped" } : message
      )));
    }
    activeResponseConversationRef.current = null;
    activeResponseMessageRef.current = null;
    const id = `agent-${instanceId}-${sequenceRef.current++}`;
    setConversations((current) => [
      { id, title, updatedLabel: "刚刚", messages: [] },
      ...current,
    ]);
    setActiveConversationId(id);
    setView("conversation");
    setRunState("idle");
    setDraft("");
    setAnnouncement("已创建新会话");
    window.requestAnimationFrame(() => textareaRef.current?.focus());
  }, [instanceId, title, updateConversationMessages]);

  const deleteConversation = useCallback((conversationId: string) => {
    if (deleteCandidate !== conversationId) {
      setDeleteCandidate(conversationId);
      setAnnouncement("再次按下删除按钮以确认");
      return;
    }
    setDeleteCandidate(null);
    setConversations((current) => {
      const next = current.filter(({ id }) => id !== conversationId);
      if (next.length > 0) {
        if (activeConversationId === conversationId) setActiveConversationId(next[0].id);
        return next;
      }
      const id = `agent-${instanceId}-${sequenceRef.current++}`;
      setActiveConversationId(id);
      return [{ id, title, updatedLabel: "刚刚", messages: [] }];
    });
    setAnnouncement("会话已删除");
  }, [activeConversationId, deleteCandidate, instanceId, title]);

  const stopGeneration = useCallback(() => {
    const responseMessageId = activeResponseMessageRef.current;
    const responseConversationId = activeResponseConversationRef.current ?? activeConversationId;
    activeRequestRef.current?.abort();
    if (responseMessageId) {
      updateConversationMessages(responseConversationId, (current) => current.map((message) => (
        message.id === responseMessageId ? { ...message, status: "stopped" } : message
      )));
    }
    activeResponseConversationRef.current = null;
    activeResponseMessageRef.current = null;
    setRunState("idle");
    setAnnouncement("已停止生成");
  }, [activeConversationId, updateConversationMessages]);

  const sendPrompt = useCallback(async (rawPrompt: string, appendUserMessage = true) => {
    const prompt = rawPrompt.trim();
    if (!prompt || runState !== "idle") return;

    const conversationId = activeConversationId;
    const userMessageId = `message-${instanceId}-${sequenceRef.current++}`;
    const responseMessageId = `message-${instanceId}-${sequenceRef.current++}`;
    const controller = new AbortController();
    activeRequestRef.current?.abort();
    activeRequestRef.current = controller;
    activeResponseMessageRef.current = null;
    setDraft("");
    setLastPrompt(prompt);
    setThinkingIndex(0);
    setRunState("thinking");
    setAnnouncement("Agent 正在理解任务");

    if (appendUserMessage) {
      updateConversationMessages(conversationId, (current) => [
        ...current,
        { id: userMessageId, role: "user", content: prompt, status: "complete" },
      ]);
      setConversations((current) => current.map((conversation) => (
        conversation.id === conversationId && conversation.messages.length === 0
          ? { ...conversation, title: prompt.length > 22 ? `${prompt.slice(0, 22)}…` : prompt }
          : conversation
      )));
    }

    try {
      const responseTask = Promise.resolve(onGenerateResponse?.(prompt, {
        conversationId,
        signal: controller.signal,
      }) ?? "");
      const [response] = await Promise.all([
        responseTask,
        wait(reduceMotion ? 0 : 1_150, controller.signal),
      ]);
      if (controller.signal.aborted) return;
      if (!response) {
        setRunState("idle");
        setAnnouncement("消息已发送");
        return;
      }

      activeResponseConversationRef.current = conversationId;
      activeResponseMessageRef.current = responseMessageId;
      updateConversationMessages(conversationId, (current) => [
        ...current.filter((message) => message.status !== "error"),
        { id: responseMessageId, role: "assistant", content: "", status: "streaming" },
      ]);
      setRunState("streaming");
      setAnnouncement("Agent 正在生成回答");

      const characters = Array.from(response);
      const chunkSize = reduceMotion ? characters.length : Math.max(1, Math.ceil(characters.length / 72));
      for (let index = chunkSize; index <= characters.length + chunkSize; index += chunkSize) {
        if (controller.signal.aborted) return;
        const content = characters.slice(0, Math.min(index, characters.length)).join("");
        updateConversationMessages(conversationId, (current) => current.map((message) => (
          message.id === responseMessageId ? { ...message, content } : message
        )));
        if (content.length === characters.length) break;
        await wait(18, controller.signal);
      }

      updateConversationMessages(conversationId, (current) => current.map((message) => (
        message.id === responseMessageId ? { ...message, status: "complete" } : message
      )));
      activeResponseMessageRef.current = null;
      activeResponseConversationRef.current = null;
      setRunState("idle");
      setAnnouncement("回答已完成");
    } catch (error) {
      if (controller.signal.aborted) return;
      activeResponseMessageRef.current = null;
      activeResponseConversationRef.current = null;
      updateConversationMessages(conversationId, (current) => [
        ...current,
        {
          id: responseMessageId,
          role: "assistant",
          content: error instanceof Error ? error.message : "请求未完成，请重试。",
          status: "error",
        },
      ]);
      setRunState("idle");
      setAnnouncement("请求未完成，请重试");
    }
  }, [activeConversationId, instanceId, onGenerateResponse, reduceMotion, runState, updateConversationMessages]);

  const retryResponse = useCallback((message: AgentMessage) => {
    if (busy) return;
    const messageIndex = messages.findIndex(({ id }) => id === message.id);
    const prompt = [...messages.slice(0, messageIndex)].reverse().find(({ role }) => role === "user")?.content ?? lastPrompt;
    if (!prompt) return;
    updateConversationMessages(activeConversationId, (current) => current.filter(({ id }) => id !== message.id));
    void sendPrompt(prompt, false);
  }, [activeConversationId, busy, lastPrompt, messages, sendPrompt, updateConversationMessages]);

  const beginResize = useCallback((axis: ResizeAxis) => (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    const start = { x: event.clientX, y: event.clientY, ...panelSize };
    setManualSize(panelSize);
    setMaximized(false);
    setResizing(true);

    const onMove = (moveEvent: PointerEvent) => {
      const width = axis === "vertical" ? start.width : start.width + start.x - moveEvent.clientX;
      const height = axis === "horizontal" ? start.height : start.height + start.y - moveEvent.clientY;
      setManualSize({
        width: clamp(width, minimumSize.width, maximumSize.width),
        height: clamp(height, minimumSize.height, maximumSize.height),
      });
    };
    const finish = () => {
      setResizing(false);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", finish);
      resizeCleanupRef.current = null;
    };
    resizeCleanupRef.current?.();
    resizeCleanupRef.current = finish;
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", finish, { once: true });
    window.addEventListener("pointercancel", finish, { once: true });
  }, [maximumSize.height, maximumSize.width, minimumSize.height, minimumSize.width, panelSize]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const measure = () => {
      const rect = root.getBoundingClientRect();
      setBounds({ width: rect.width, height: rect.height });
    };
    measure();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    observer?.observe(root);
    window.addEventListener("resize", measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  useEffect(() => () => {
    activeRequestRef.current?.abort();
    resizeCleanupRef.current?.();
  }, []);

  useEffect(() => {
    if (previousOpenRef.current && !isOpen) {
      window.requestAnimationFrame(() => triggerRef.current?.focus());
    }
    previousOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    onConversationsChange?.(conversations);
  }, [conversations, onConversationsChange]);

  useEffect(() => {
    if (!deleteCandidate) return;
    const timer = window.setTimeout(() => setDeleteCandidate(null), 2_400);
    return () => window.clearTimeout(timer);
  }, [deleteCandidate]);

  useEffect(() => {
    if (!busy) return;
    const timer = window.setInterval(() => {
      setThinkingIndex((current) => (current + 1) % THINKING_PHASES.length);
    }, reduceMotion ? 2_000 : 720);
    return () => window.clearInterval(timer);
  }, [busy, reduceMotion]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "0px";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 104)}px`;
  }, [draft]);

  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;
    scroller.scrollTo({ top: scroller.scrollHeight, behavior: reduceMotion ? "auto" : "smooth" });
  }, [messages, reduceMotion, runState, view]);

  const handleComposerKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return;
    event.preventDefault();
    void sendPrompt(draft);
  };

  const handlePanelKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    if (view === "history") setView("conversation");
    else setOpen(false);
  };

  const copyMessage = async (message: AgentMessage) => {
    if (navigator.clipboard) await navigator.clipboard.writeText(message.content);
    setAnnouncement("回答已复制");
  };

  const setMessageFeedback = (message: AgentMessage, feedback: AgentFeedbackValue) => {
    setFeedbackByMessage((current) => ({ ...current, [message.id]: feedback }));
    onFeedback?.(message, feedback);
    setAnnouncement(feedback === "up" ? "已记录：回答有帮助" : "已记录：回答需改进");
  };

  return (
    <div
      className={cn("pointer-events-none fixed inset-0 z-50 overflow-hidden", className)}
      data-slot="agent-conversation-corner"
      ref={rootRef}
    >
      <span aria-live="polite" className="sr-only">{announcement}</span>
      <motion.div
        className={cn(
          "absolute bottom-3 right-3 z-20 h-10 min-w-36",
          isOpen ? "pointer-events-none" : "pointer-events-auto",
        )}
        data-state={isOpen ? "open" : "closed"}
      >
            <motion.span
              animate={reduceMotion ? { opacity: 0 } : isOpen ? {
                clipPath: [
                  AGENT_CORNER_TRIGGER_MORPH.clip.base,
                  AGENT_CORNER_TRIGGER_MORPH.clip.openTall,
                  AGENT_CORNER_TRIGGER_MORPH.clip.openTall,
                  AGENT_CORNER_TRIGGER_MORPH.clip.openPeak,
                  AGENT_CORNER_TRIGGER_MORPH.clip.openPeak,
                ],
                opacity: [0, 0.7, 0.7, 0.53, 0.21, 0.16, 0.1, 0.08, 0.04, 0],
              } : {
                clipPath: [
                  AGENT_CORNER_TRIGGER_MORPH.clip.closeStart,
                  AGENT_CORNER_TRIGGER_MORPH.clip.closePeak,
                  AGENT_CORNER_TRIGGER_MORPH.clip.closePeak,
                  AGENT_CORNER_TRIGGER_MORPH.clip.closeTall,
                  AGENT_CORNER_TRIGGER_MORPH.clip.closeMedium,
                  AGENT_CORNER_TRIGGER_MORPH.clip.closeLow,
                  AGENT_CORNER_TRIGGER_MORPH.clip.closeNear,
                  AGENT_CORNER_TRIGGER_MORPH.clip.base,
                ],
                opacity: [0.35, 1, 1, 0.78, 0.42, 0.2, 0.08, 0],
              }}
              aria-hidden
              className="pointer-events-none absolute bottom-0 right-0 h-[320%] w-[118%] shadow-[var(--surface-shadow)] [background:var(--prismatic-button-green-gradient)] [will-change:clip-path,opacity]"
              data-slot="agent-trigger-morph"
              initial={false}
              transition={reduceMotion ? { duration: 0 } : isOpen ? {
                  clipPath: {
                    duration: AGENT_CORNER_TRIGGER_MORPH.openDuration,
                    ease: "linear",
                    times: [0, 0.1, 0.18, 0.28, 1],
                  },
                  opacity: {
                    duration: AGENT_CORNER_TRIGGER_MORPH.openDuration,
                    ease: "linear",
                    times: [0, 0.1, 0.18, 0.28, 0.38, 0.56, 0.68, 0.82, 0.92, 1],
                  },
                } : {
                duration: AGENT_CORNER_TRIGGER_MORPH.closeDuration,
                ease: "linear",
                times: [0, 0.1, 0.2, 0.3, 0.4, 0.6, 0.72, 1],
              }}
            />

            <motion.span
              animate={reduceMotion ? { opacity: 0 } : isOpen
                ? { opacity: [0, 0.72, 0.54, 0.2, 0] }
                : { opacity: [0.35, 1, 0.82, 0.35, 0] }}
              aria-hidden
              className="pointer-events-none absolute bottom-0 right-0 z-10 flex h-10 min-w-36 items-center justify-center gap-2 px-4 text-white [font-family:var(--prismatic-button-font-family)] [font-size:var(--prismatic-button-font-size)] [line-height:var(--prismatic-button-line-height)] font-medium whitespace-nowrap"
              data-slot="agent-trigger-morph-label"
              initial={false}
              transition={reduceMotion ? { duration: 0 } : isOpen ? {
                  duration: AGENT_CORNER_TRIGGER_MORPH.openDuration,
                  ease: "linear",
                  times: [0, 0.1, 0.28, 0.62, 1],
                } : {
                duration: AGENT_CORNER_TRIGGER_MORPH.closeDuration,
                ease: "linear",
                times: [0, 0.1, 0.32, 0.68, 1],
              }}
            >
              <Sparkles className="size-4 shrink-0" />{triggerLabel}
            </motion.span>

            <motion.div
              animate={reduceMotion
                ? { opacity: isOpen ? 0 : 1 }
                : isOpen
                  ? { opacity: [1, 0] }
                  : { opacity: [0, 0, 1] }}
              className="absolute bottom-0 right-0 z-20"
              data-slot="agent-trigger-button-layer"
              initial={false}
              transition={reduceMotion ? { duration: 0 } : isOpen
                ? { duration: 0.018, ease: "linear" }
                : {
                    duration: AGENT_CORNER_TRIGGER_MORPH.closeDuration,
                    ease: "linear",
                    times: [0, 0.54, 1],
                  }}
            >
              <PrismaticButton
                aria-hidden={isOpen}
                aria-label={triggerLabel}
                aria-expanded={isOpen}
                className="h-10 w-auto min-w-36 px-4 shadow-[var(--surface-shadow)]"
                disabled={isOpen}
                onClick={() => setOpen(true)}
                ref={triggerRef}
                tabIndex={isOpen ? -1 : undefined}
              >
                <Sparkles />{triggerLabel}
              </PrismaticButton>
            </motion.div>
      </motion.div>

      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.section
            animate={{
              height: panelSize.height,
              opacity: 1,
              scaleX: 1,
              scaleY: 1,
              width: panelSize.width,
            }}
            aria-label="Agent 对话"
            className="pointer-events-auto absolute bottom-3 right-3 z-10 flex origin-bottom-right flex-col overflow-hidden rounded-2xl bg-surface-raised text-surface-foreground shadow-[var(--agent-corner-shadow)] ring-1 ring-inset ring-surface-border"
            data-maximized={maximized}
            data-resizing={resizing}
            exit={reduceMotion ? { opacity: 0 } : {
              opacity: 0,
              scaleX: AGENT_CORNER_TRANSFER.panelScaleX,
              scaleY: AGENT_CORNER_TRANSFER.panelScaleY,
              transition: {
                opacity: { duration: 0.05, ease: "linear" },
                scaleX: AGENT_CORNER_EXIT,
                scaleY: AGENT_CORNER_EXIT,
              },
            }}
            initial={reduceMotion ? { opacity: 0 } : {
              opacity: 0,
              scaleX: AGENT_CORNER_TRANSFER.panelScaleX,
              scaleY: AGENT_CORNER_TRANSFER.panelScaleY,
            }}
            key="agent-panel"
            onKeyDown={handlePanelKeyDown}
            transition={reduceMotion ? { duration: 0 } : {
              height: resizing ? { duration: 0 } : AGENT_CORNER_SPRING,
              opacity: { duration: 0.05, ease: "linear" },
              scaleX: AGENT_CORNER_ENTER,
              scaleY: AGENT_CORNER_ENTER,
              width: resizing ? { duration: 0 } : AGENT_CORNER_SPRING,
            }}
          >
            <div
              aria-hidden
              className="absolute inset-y-9 -left-1.5 z-30 w-3 cursor-ew-resize touch-none"
              onPointerDown={beginResize("horizontal")}
            />
            <div
              aria-hidden
              className="absolute -top-1.5 inset-x-9 z-30 h-3 cursor-ns-resize touch-none"
              onPointerDown={beginResize("vertical")}
            />
            <div
              aria-hidden
              className="absolute -left-1.5 -top-1.5 z-40 size-6 cursor-nwse-resize touch-none"
              onPointerDown={beginResize("both")}
            />

            <motion.div
              animate={{ opacity: 1 }}
              className="flex min-h-0 flex-1 flex-col"
              exit={{ opacity: 0, transition: AGENT_CORNER_CONTENT_EXIT }}
              initial={{ opacity: 0 }}
              transition={reduceMotion ? { duration: 0 } : AGENT_CORNER_CONTENT_ENTER}
            >
              <header
                className="flex h-11 shrink-0 select-none items-center gap-1 border-b border-border/70 px-2"
                onDoubleClick={(event) => {
                  if ((event.target as HTMLElement).closest("button")) return;
                  setMaximized((current) => !current);
                }}
              >
              {view === "history" ? (
                <Button aria-label="返回会话" onClick={() => setView("conversation")} size="icon-sm" title="返回会话" variant="ghost"><ArrowLeft /></Button>
              ) : (
                <Button aria-label="打开会话记录" onClick={() => setView("history")} size="icon-sm" title="会话记录" variant="ghost"><History /></Button>
              )}
              <div className="min-w-0 flex-1 px-1">
                <p className="truncate text-xs font-medium">{view === "history" ? "会话记录" : panelTitle}</p>
                {view === "conversation" && busy ? <p className="truncate text-micro text-muted-foreground">Agent 正在工作</p> : null}
              </div>
              <Button aria-label="新建会话" onClick={createConversation} size="icon-sm" title="新建会话" variant="ghost"><Plus /></Button>
              <Button
                aria-label={maximized ? "恢复窗口" : "最大化窗口"}
                onClick={() => setMaximized((current) => !current)}
                size="icon-sm"
                title={maximized ? "恢复窗口" : "最大化窗口"}
                variant="ghost"
              >{maximized ? <Minimize2 /> : <Maximize2 />}</Button>
              <Button aria-label="关闭 Agent" onClick={() => setOpen(false)} size="icon-sm" title="关闭 Agent" variant="ghost"><ChevronDown /></Button>
              </header>

              <AnimatePresence initial={false} mode="popLayout">
              {view === "history" ? (
                <motion.div
                  animate={{ opacity: 1, x: 0 }}
                  className="min-h-0 flex-1 overflow-y-auto"
                  exit={{ opacity: 0, x: -16 }}
                  initial={{ opacity: 0, x: 16 }}
                  key="history"
                  transition={reduceMotion ? { duration: 0 } : AGENT_CORNER_VIEW_TRANSITION}
                >
                  <div className="border-b border-border/70 px-4 py-4">
                    <p className="text-xs font-medium">继续最近的工作</p>
                    <p className="mt-1 text-micro leading-4 text-muted-foreground">会话在浮窗内管理，不打断当前页面。</p>
                  </div>
                  <div className="divide-y divide-border/70" role="list">
                    {conversations.map((conversation) => {
                      const armed = deleteCandidate === conversation.id;
                      return (
                        <div
                          className={cn(
                            "group flex min-h-14 items-center gap-2 px-3 transition-colors hover:bg-surface-hover",
                            conversation.id === activeConversationId && "bg-surface-selected/65",
                          )}
                          key={conversation.id}
                          role="listitem"
                        >
                          <button
                            className="min-w-0 flex-1 rounded-md px-1 py-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            onClick={() => {
                              setActiveConversationId(conversation.id);
                              setView("conversation");
                            }}
                            type="button"
                          >
                            <span className="block truncate text-xs font-medium">{conversation.title}</span>
                            <span className="mt-1 block text-micro text-muted-foreground">
                              {conversation.messages.length} 条消息 · {conversation.updatedLabel ?? "最近"}
                            </span>
                          </button>
                          <Button
                            aria-label={armed ? `确认删除${conversation.title}` : `删除${conversation.title}`}
                            className={cn(
                              "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100",
                              armed && "w-auto bg-destructive/10 px-2 text-destructive opacity-100 hover:bg-destructive/15",
                            )}
                            onClick={() => deleteConversation(conversation.id)}
                            size={armed ? "xs" : "icon-xs"}
                            title={armed ? "再次点击确认" : "删除会话"}
                            variant="ghost"
                          >
                            <Trash2 />{armed ? "再次确认" : null}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  animate={{ opacity: 1, x: 0 }}
                  className="flex min-h-0 flex-1 flex-col"
                  exit={{ opacity: 0, x: 16 }}
                  initial={{ opacity: 0, x: -16 }}
                  key="conversation"
                  transition={reduceMotion ? { duration: 0 } : AGENT_CORNER_VIEW_TRANSITION}
                >
                  <div className="min-h-0 flex-1 overflow-y-auto" ref={scrollRef}>
                    {messages.length === 0 && !busy ? (
                      <div className="flex min-h-full flex-col items-center justify-center px-8 py-12 text-center">
                        <AgentEmptySignal />
                        <h2 className="mt-5 text-sm font-medium">{emptyTitle}</h2>
                        <p className="mt-2 max-w-xs text-xs leading-5 text-muted-foreground">{emptyDescription}</p>
                      </div>
                    ) : (
                      <div className="mx-auto w-full max-w-3xl px-4 py-5 sm:px-6">
                        <div className="space-y-5">
                          {messages.map((message) => (
                            <article
                              className={cn("text-xs leading-6", message.role === "user" && "flex justify-end")}
                              key={message.id}
                            >
                              {message.role === "user" ? (
                                <div className="max-w-[82%] rounded-xl bg-surface-selected/70 px-3 py-1.5 text-foreground ring-1 ring-inset ring-surface-border/70">
                                  {message.content}
                                </div>
                              ) : (
                                <div className="max-w-[46rem]">
                                  <p className={cn(
                                    "whitespace-pre-wrap text-foreground",
                                    message.status === "error" && "rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-destructive",
                                  )}>{message.content}<span aria-hidden className={cn("agent-corner-stream-caret", message.status !== "streaming" && "hidden")} /></p>
                                  {message.status && message.status !== "streaming" ? (
                                    <AgentMessageActions
                                      feedback={feedbackByMessage[message.id]}
                                      message={message}
                                      onCopy={() => void copyMessage(message)}
                                      onFeedback={(value) => setMessageFeedback(message, value)}
                                      onRetry={() => retryResponse(message)}
                                    />
                                  ) : null}
                                </div>
                              )}
                            </article>
                          ))}
                          {busy ? <AgentThinkingIndicator index={thinkingIndex} /> : null}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="relative shrink-0 px-3 pb-3 pt-8">
                    <div aria-hidden className={cn("agent-corner-energy", busy && "agent-corner-energy--active")}>
                      <span /><span /><span />
                    </div>
                    <div
                      className={cn(
                        "relative z-10 overflow-hidden rounded-xl bg-surface shadow-[var(--surface-shadow)] ring-1 ring-inset ring-input transition-[box-shadow,--tw-ring-color]",
                        busy && "ring-success/35 shadow-[var(--agent-corner-composer-shadow)]",
                      )}
                      data-state={runState}
                    >
                      {quickActions.length > 0 && messages.length === 0 ? (
                        <div className="flex flex-wrap gap-1 border-b border-border/60 px-2 py-1.5">
                          {quickActions.map((action) => (
                            <Button
                              className="h-6 rounded-md px-2 text-micro"
                              disabled={busy}
                              key={action.label}
                              onClick={() => void sendPrompt(action.prompt)}
                              size="xs"
                              variant="ghost"
                            ><Sparkles />{action.label}</Button>
                          ))}
                        </div>
                      ) : null}
                      <textarea
                        aria-label="给 Agent 发送消息"
                        className="block min-h-11 w-full resize-none bg-transparent px-3 pb-1 pt-2.5 text-xs leading-5 text-foreground outline-none placeholder:text-muted-foreground/75 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={busy}
                        onChange={(event) => setDraft(event.target.value)}
                        onKeyDown={handleComposerKeyDown}
                        placeholder={placeholder}
                        ref={textareaRef}
                        rows={1}
                        value={draft}
                      />
                      <div className="flex h-9 items-center gap-0.5 px-1.5 pb-1">
                        <Button
                          aria-label="添加附件"
                          disabled={busy}
                          onClick={() => {
                            onAttach?.();
                            setAnnouncement(onAttach ? "已打开附件选择" : "附件入口尚未连接");
                          }}
                          size="icon-xs"
                          title="添加附件"
                          variant="ghost"
                        ><Paperclip /></Button>
                        <span className="ml-1 hidden text-micro text-muted-foreground sm:inline">{busy ? THINKING_PHASES[thinkingIndex].label : "支持引用当前页面"}</span>
                        <div className="ml-auto">
                          {busy ? (
                            <Button
                              aria-label="停止生成"
                              className="size-7 rounded-full bg-primary text-primary-foreground hover:bg-primary/85"
                              onClick={stopGeneration}
                              size="icon-sm"
                              title="停止生成"
                            ><Square className="size-2.5 fill-current" /></Button>
                          ) : (
                            <Button
                              aria-label="发送消息"
                              className="size-7 rounded-full bg-primary text-primary-foreground hover:bg-primary/85 disabled:bg-muted disabled:text-muted-foreground"
                              disabled={!draft.trim()}
                              onClick={() => void sendPrompt(draft)}
                              size="icon-sm"
                              title="发送消息"
                            ><ArrowUp /></Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              </AnimatePresence>
            </motion.div>
          </motion.section>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export { AgentConversationCorner };
export type {
  AgentConversation,
  AgentConversationCornerProps,
  AgentConversationSize,
  AgentFeedbackValue,
  AgentMessage,
  AgentMessageRole,
  AgentMessageStatus,
  AgentQuickAction,
  AgentResponseContext,
};
