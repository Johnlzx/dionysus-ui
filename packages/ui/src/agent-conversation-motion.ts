/**
 * [INPUT]: 无运行时依赖
 * [OUTPUT]: 对外提供 Agent Conversation Corner 的几何、按钮桥接、壳层转场、内容交接与 resize spring 契约
 * [POS]: ui/src 的 Agent 浮窗动效事实源，供组件和产品验收复用
 * [PROTOCOL]: 变更时更新此头部，然后检查 docs/reference-analysis/agent-corner/alignment-report.md
 */

const AGENT_CORNER_SIZE = {
  width: 448,
  height: 592,
  minWidth: 360,
  minHeight: 420,
  inset: 12,
} as const;

const AGENT_CORNER_SPRING = {
  type: "spring",
  stiffness: 520,
  damping: 42,
  mass: 0.72,
} as const;

const AGENT_CORNER_ENTER = {
  duration: 0.18,
  ease: [0.16, 1, 0.3, 1],
} as const;

const AGENT_CORNER_EXIT = {
  duration: 0.16,
  ease: [0.32, 0, 0.67, 0],
} as const;

const AGENT_CORNER_CONTENT_ENTER = {
  delay: 0.26,
  duration: 0.14,
  ease: [0.22, 1, 0.36, 1],
} as const;

const AGENT_CORNER_CONTENT_EXIT = {
  duration: 0.05,
  ease: [0.32, 0, 0.67, 0],
} as const;

const AGENT_CORNER_TRANSFER = {
  panelScaleX: 0.46,
  panelScaleY: 0.3,
} as const;

const AGENT_CORNER_TRIGGER_MORPH = {
  closeDuration: 0.167,
  openDuration: 0.18,
  surfaceScaleX: 1.18,
  surfaceScaleY: 3.2,
  clip: {
    base: "inset(68.75% 0% 0% 15.25% round 20px)",
    closeStart: "inset(54.47% 0% 0% 16.19% round 18px)",
    closePeak: "inset(0% 0% 0% 0% round 16px)",
    closeTall: "inset(23.22% 0% 0% 4.58% round 17px)",
    closeMedium: "inset(50% 0% 0% 10.76% round 18px)",
    closeLow: "inset(57.16% 0% 0% 12.54% round 19px)",
    closeNear: "inset(65.18% 0% 0% 13.47% round 20px)",
    openTall: "inset(25.91% 0% 0% 5.42% round 18px)",
    openPeak: "inset(0% 0% 0% 0% round 16px)",
  },
} as const;

const AGENT_CORNER_VIEW_TRANSITION = {
  duration: 0.18,
  ease: [0.22, 1, 0.36, 1],
} as const;

export {
  AGENT_CORNER_CONTENT_ENTER,
  AGENT_CORNER_CONTENT_EXIT,
  AGENT_CORNER_ENTER,
  AGENT_CORNER_EXIT,
  AGENT_CORNER_SIZE,
  AGENT_CORNER_SPRING,
  AGENT_CORNER_TRANSFER,
  AGENT_CORNER_TRIGGER_MORPH,
  AGENT_CORNER_VIEW_TRANSITION,
};
