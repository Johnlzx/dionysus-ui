/**
 * [INPUT]: 无运行时外部依赖
 * [OUTPUT]: 对外提供浮动右侧面板的尺寸、间距与可中断 Motion 参数
 * [POS]: ui/src 的上下文面板运动事实源，统一布局重排、内容横移与淡入淡出节奏
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
const FLOATING_PANEL_SIZE = {
  width: 320,
  inset: 8,
} as const;

const FLOATING_PANEL_SPRING = {
  type: "spring",
  stiffness: 700,
  damping: 48,
  mass: 0.62,
} as const;

const FLOATING_PANEL_CONTENT_SPRING = {
  type: "spring",
  stiffness: 760,
  damping: 50,
  mass: 0.62,
} as const;

export {
  FLOATING_PANEL_CONTENT_SPRING,
  FLOATING_PANEL_SIZE,
  FLOATING_PANEL_SPRING,
};
