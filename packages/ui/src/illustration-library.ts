/**
 * [INPUT]: 依赖仓库内经过安全区与 Alpha 质检的 Editorial photo WebP 与 illustration-generation 的只读资产库工厂
 * [OUTPUT]: 对外提供一组可直接装配、可追溯的非人像透明前景成品
 * [POS]: 设计系统默认生成式配图库；资产只包含前景，不拥有卡片布局与底部渐隐
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
import { defineIllustrationLibrary, type IllustrationAsset } from "./illustration-generation";

const DIONYSUS_ILLUSTRATION_ASSETS = [
  {
    id: "paper-orbit",
    src: new URL("./assets/illustrations/editorial-photo/paper-orbit-v2.webp", import.meta.url).href,
    alt: "折纸结构、蓝灰球体与黄铜轨道组成的编辑风静物",
    kind: "abstract",
    styleId: "editorial-cutout",
    mediaType: "image/webp",
    width: 1200,
    height: 1500,
    background: "transparent",
    provenance: "Zonic gpt-image-2 high + local alpha cleanup",
  },
  {
    id: "field-recorder",
    src: new URL("./assets/illustrations/editorial-photo/field-recorder-v2.webp", import.meta.url).href,
    alt: "深灰与黄铜材质的便携录音设备静物",
    kind: "object",
    styleId: "editorial-cutout",
    mediaType: "image/webp",
    width: 1200,
    height: 1500,
    background: "transparent",
    provenance: "Zonic gpt-image-2 high + local chroma-key alpha extraction",
  },
  {
    id: "archive-stack",
    src: new URL("./assets/illustrations/editorial-photo/archive-stack-v2.webp", import.meta.url).href,
    alt: "带黄铜回形针的纸张与档案册静物",
    kind: "object",
    styleId: "editorial-cutout",
    mediaType: "image/webp",
    width: 1200,
    height: 1500,
    background: "transparent",
    provenance: "Zonic gpt-image-2 high + local alpha cleanup",
  },
  {
    id: "lens-study",
    src: new URL("./assets/illustrations/editorial-photo/lens-study-v2.webp", import.meta.url).href,
    alt: "带透明棱镜的深灰摄影镜头静物",
    kind: "object",
    styleId: "editorial-cutout",
    mediaType: "image/webp",
    width: 1200,
    height: 1500,
    background: "transparent",
    provenance: "Zonic gpt-image-2 high + local alpha cleanup",
  },
] as const satisfies readonly IllustrationAsset[];

const DIONYSUS_ILLUSTRATIONS = defineIllustrationLibrary(DIONYSUS_ILLUSTRATION_ASSETS);

export { DIONYSUS_ILLUSTRATIONS, DIONYSUS_ILLUSTRATION_ASSETS };
