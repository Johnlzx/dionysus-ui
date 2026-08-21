/**
 * [INPUT]: 依赖产品层提供的主体描述、配图类型、可选构图约束与避免项
 * [OUTPUT]: 对外提供可版本化、按主体类型分流且包含安全画布契约的配图生成提示词
 * [POS]: 图片生成之前的纯配置层，不依赖模型、网络、文件系统或卡片组件
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */

type IllustrationSubjectKind = "object" | "character" | "scene" | "abstract";

interface IllustrationStyle {
  id: string;
  name: string;
  version: string;
  artDirection: readonly string[];
  composition: readonly string[];
  kindDirection?: Partial<Record<IllustrationSubjectKind, readonly string[]>>;
  lighting: readonly string[];
  palette: readonly string[];
  constraints: readonly string[];
  avoid?: readonly string[];
}

interface IllustrationPromptInput {
  subject: string;
  kind?: IllustrationSubjectKind;
  composition?: string;
  palette?: string;
  constraints?: readonly string[];
  avoid?: readonly string[];
}

const EDITORIAL_CUTOUT_STYLE: IllustrationStyle = {
  id: "editorial-cutout",
  name: "Editorial photo cutout",
  version: "2.0.0",
  artDirection: [
    "photorealistic editorial photography with the tactile restraint of an independent culture magazine",
    "natural material and skin texture, gentle filmic grain, and slightly softened micro-contrast",
    "quiet cinematic art direction, not glossy advertising and not a 3D render",
  ],
  composition: [
    "one isolated foreground subject, vertically anchored toward the bottom of a portrait canvas",
    "keep the complete subject and every edge pixel inside the canvas with at least 10% clear space above and 8% at both sides",
    "clear three-quarter silhouette; never crop the top, hair, handles, antennas, corners, or any attached part",
    "no environment, horizon, floor plane, pedestal, rectangular backdrop, frame, card, or UI",
  ],
  kindDirection: {
    object: [
      "a single tactile real-world object photographed as a magazine still-life portrait",
      "show the complete object upright or in a stable three-quarter orientation without a contact shadow",
    ],
    character: [
      "a chest-up or waist-up editorial portrait with a natural three-quarter pose and composed expression",
      "keep the full head, hair, shoulders, elbows, and any held object safely inside the canvas",
    ],
    scene: [
      "a compact self-contained editorial diorama with one dominant focal subject",
      "keep every element inside one clean silhouette without a horizon or ground plane",
    ],
    abstract: [
      "one restrained sculptural arrangement built from believable paper, glass, metal, fabric, or stone",
      "photograph it as a real studio object rather than drawing a flat vector symbol",
    ],
  },
  lighting: [
    "a large diffused key light from the upper left with quiet frontal fill",
    "soft low-contrast modelling; all shading and occlusion remain contained within the subject silhouette",
    "warm-neutral highlight rolloff with no yellow color cast",
  ],
  palette: [
    "warm ivory, charcoal, soft stone, faded navy, muted brass, and natural skin tones when relevant",
    "restrained saturation with at most one quiet accent",
  ],
  constraints: [
    "deliver a true transparent alpha background, not white, gray, or a simulated checkerboard",
    "preserve fine hair, glass, fabric, and semi-transparent edge detail without a matte or halo",
    "the asset contains only the foreground subject; no typography, logo, watermark, scenery, or baked-in bottom fade",
    "no cast shadow, contact shadow, glow, or loose shadow pixels outside the subject silhouette",
    "do not use green-screen or chroma-key color as an intermediate background",
  ],
  avoid: [
    "cropped or edge-touching subject",
    "visible rectangular image boundary",
    "drop shadow outside the silhouette",
    "white halo or hard cutout fringe",
    "flat vector art, clip art, cartoon rendering, plastic 3D icon, or product-catalog gloss",
    "vignette, floor, plinth, environment, card mockup, text, logo, and watermark",
  ],
};

function defineIllustrationStyle(style: IllustrationStyle): IllustrationStyle {
  return Object.freeze({
    ...style,
    artDirection: Object.freeze([...style.artDirection]),
    composition: Object.freeze([...style.composition]),
    kindDirection: style.kindDirection
      ? Object.freeze(Object.fromEntries(
        Object.entries(style.kindDirection).map(([kind, direction]) => [kind, Object.freeze([...(direction ?? [])])]),
      ))
      : undefined,
    lighting: Object.freeze([...style.lighting]),
    palette: Object.freeze([...style.palette]),
    constraints: Object.freeze([...style.constraints]),
    avoid: style.avoid ? Object.freeze([...style.avoid]) : undefined,
  });
}

function getUseCase(kind: IllustrationSubjectKind): "photorealistic-natural" | "product-mockup" | "stylized-concept" {
  if (kind === "character") return "photorealistic-natural";
  if (kind === "object") return "product-mockup";
  return "stylized-concept";
}

function createIllustrationPrompt(
  input: IllustrationPromptInput,
  style: IllustrationStyle = EDITORIAL_CUTOUT_STYLE,
): string {
  const kind = input.kind ?? "object";
  const kindDirection = style.kindDirection?.[kind] ?? [];
  const lines = [
    `Use case: ${getUseCase(kind)}`,
    "Asset type: reusable transparent foreground asset for an editorial UI card",
    `Primary request: ${input.subject}`,
    "Scene/backdrop: none; genuine transparent alpha across the full canvas outside the subject",
    `Subject: ${[input.subject, ...kindDirection].join("; ")}`,
    `Style/medium: ${style.artDirection.join("; ")}`,
    `Composition/framing: ${[...style.composition, input.composition].filter(Boolean).join("; ")}`,
    `Lighting/mood: ${style.lighting.join("; ")}`,
    `Color palette: ${[...style.palette, input.palette].filter(Boolean).join("; ")}`,
    `Constraints: ${[...style.constraints, ...(input.constraints ?? [])].join("; ")}`,
    `Avoid: ${[...(style.avoid ?? []), ...(input.avoid ?? [])].join("; ")}`,
  ];

  return lines.join("\n");
}

export { EDITORIAL_CUTOUT_STYLE, createIllustrationPrompt, defineIllustrationStyle };
export type { IllustrationPromptInput, IllustrationStyle, IllustrationSubjectKind };
