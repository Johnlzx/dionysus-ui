/**
 * [INPUT]: 无运行时外部依赖
 * [OUTPUT]: 对外提供 App Shell 侧栏尺寸与 Motion spring 参数
 * [POS]: ui/src 的侧栏运动事实源，避免组件文件混合导出常量并保持热更新边界稳定
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
const SIDEBAR_SIZE = {
  expanded: 256,
  collapsed: 56,
} as const;

const SIDEBAR_SPRING = {
  type: "spring",
  stiffness: 820,
  damping: 49,
  mass: 0.72,
} as const;

const SIDEBAR_TOGGLE_SPRING = {
  collapse: {
    type: "spring",
    stiffness: 1500,
    damping: 63,
    mass: 0.65,
  },
  expand: {
    type: "spring",
    stiffness: 850,
    damping: 49,
    mass: 0.65,
  },
} as const;

export { SIDEBAR_SIZE, SIDEBAR_SPRING, SIDEBAR_TOGGLE_SPRING };
