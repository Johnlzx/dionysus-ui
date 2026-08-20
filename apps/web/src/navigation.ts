/**
 * [INPUT]: 无运行时外部依赖
 * [OUTPUT]: 对外提供设计系统站点分组导航、页面元数据、搜索索引和默认路由
 * [POS]: web/src 的信息架构唯一事实来源，使侧栏、搜索与路由共享同一组页面定义
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
export interface DocNavItem {
  id: string;
  label: string;
  description: string;
  path: string;
  badge?: string;
}

export interface DocNavGroup {
  label: string;
  items: DocNavItem[];
}

const DOC_NAVIGATION: DocNavGroup[] = [
  {
    label: "Getting started",
    items: [
      { id: "overview", label: "总览", description: "设计哲学、层级和采用方式", path: "/overview" },
      { id: "principles", label: "原则", description: "克制、语义和人工控制权", path: "/principles" },
    ],
  },
  {
    label: "Foundations",
    items: [
      { id: "colors", label: "颜色与表面", description: "灰阶底板、语义色和 elevation", path: "/foundations/colors" },
      { id: "typography", label: "字体与排版", description: "字阶、字重、数字和长文阅读", path: "/foundations/typography" },
      { id: "icons", label: "图标", description: "精选图标、尺寸、语义和无障碍", path: "/foundations/icons" },
      { id: "layout", label: "布局与密度", description: "4px 网格、inset canvas 和响应式", path: "/foundations/layout" },
    ],
  },
  {
    label: "Components",
    items: [
      { id: "button", label: "Button", description: "操作层级、尺寸和状态", path: "/components/button" },
      { id: "prismatic-button", label: "Prismatic Button", description: "OGL 棱光、高强调操作与 GPU 降级", path: "/components/prismatic-button", badge: "New" },
      { id: "input", label: "Input", description: "文本输入、搜索与表单反馈", path: "/components/input" },
      { id: "dropdown-menu", label: "DropdownMenu", description: "搜索、多选、分组与指令弹窗", path: "/components/dropdown-menu", badge: "New" },
      { id: "inline-edit", label: "Inline Edit", description: "锚定浮层、即时提交与失败回滚", path: "/components/inline-edit", badge: "New" },
      { id: "floating-panel", label: "Floating panel", description: "布局内浮动右栏、卡片栈与双态触发器", path: "/components/floating-panel", badge: "New" },
      { id: "surface", label: "Surface", description: "常驻、浮层、选中与低层级表面", path: "/components/surface" },
      { id: "feedback", label: "Feedback", description: "Badge、状态、空态和错误", path: "/components/feedback", badge: "4" },
    ],
  },
  {
    label: "Patterns",
    items: [
      { id: "app-shell", label: "App shell", description: "导航、顶栏和悬浮主画布", path: "/patterns/app-shell" },
      { id: "workspace", label: "Content workspace", description: "素材、画布与 Agent 三栏协作", path: "/patterns/content-workspace" },
    ],
  },
  {
    label: "Resources",
    items: [
      { id: "adoption", label: "采用与治理", description: "安装、边界、Review 和许可证", path: "/resources/adoption" },
    ],
  },
];

const DOC_ITEMS = DOC_NAVIGATION.flatMap((group) => group.items);
const DEFAULT_DOC_PATH = "/overview";

export { DEFAULT_DOC_PATH, DOC_ITEMS, DOC_NAVIGATION };
