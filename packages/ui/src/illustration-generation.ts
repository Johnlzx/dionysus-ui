/**
 * [INPUT]: 依赖 illustration-style 的纯风格配置，以及产品层注入的生成与透明化 provider
 * [OUTPUT]: 对外提供模型无关的生成请求、Alpha 资产契约、处理流水线和只读资产库
 * [POS]: 风格与渲染之间的适配层；只编排能力，不直接访问任何图片服务
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
import {
  EDITORIAL_CUTOUT_STYLE,
  createIllustrationPrompt,
  type IllustrationPromptInput,
  type IllustrationStyle,
  type IllustrationSubjectKind,
} from "./illustration-style";

type IllustrationMediaType = "image/png" | "image/webp" | "image/avif" | "image/svg+xml";
type IllustrationBackground = "transparent" | "opaque" | "unknown";

interface IllustrationSafeArea {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

interface IllustrationAsset {
  id: string;
  src: string;
  alt: string;
  kind: IllustrationSubjectKind;
  styleId: string;
  mediaType: IllustrationMediaType;
  width?: number;
  height?: number;
  background: "transparent";
  provenance?: string;
}

interface RawIllustration {
  src: string;
  mediaType: IllustrationMediaType;
  width?: number;
  height?: number;
  background: IllustrationBackground;
  provider: string;
}

interface IllustrationGenerationRequest {
  id: string;
  alt: string;
  kind: IllustrationSubjectKind;
  styleId: string;
  styleVersion: string;
  prompt: string;
  output: {
    background: "transparent";
    aspectRatio: "4:5";
    safeArea: IllustrationSafeArea;
    externalShadow: "forbidden";
    bakedFade: "forbidden";
    preferredMediaTypes: readonly IllustrationMediaType[];
  };
}

interface IllustrationGenerationProvider {
  name: string;
  generate(request: IllustrationGenerationRequest): Promise<RawIllustration>;
}

interface IllustrationAlphaProcessor {
  name: string;
  extract(
    raw: RawIllustration,
    request: IllustrationGenerationRequest,
  ): Promise<Omit<RawIllustration, "background"> & { background: "transparent" }>;
}

interface IllustrationPipelineOptions {
  id: string;
  alt: string;
  prompt: IllustrationPromptInput;
  style?: IllustrationStyle;
}

interface IllustrationLibrary {
  all: readonly IllustrationAsset[];
  get(id: string): IllustrationAsset | undefined;
}

function createIllustrationGenerationRequest(
  options: IllustrationPipelineOptions,
): IllustrationGenerationRequest {
  const style = options.style ?? EDITORIAL_CUTOUT_STYLE;
  return {
    id: options.id,
    alt: options.alt,
    kind: options.prompt.kind ?? "object",
    styleId: style.id,
    styleVersion: style.version,
    prompt: createIllustrationPrompt(options.prompt, style),
    output: {
      background: "transparent",
      aspectRatio: "4:5",
      safeArea: { top: 0.1, right: 0.08, bottom: 0, left: 0.08 },
      externalShadow: "forbidden",
      bakedFade: "forbidden",
      preferredMediaTypes: ["image/webp", "image/png", "image/avif"],
    },
  };
}

async function runIllustrationPipeline(
  provider: IllustrationGenerationProvider,
  options: IllustrationPipelineOptions,
  alphaProcessor?: IllustrationAlphaProcessor,
): Promise<IllustrationAsset> {
  const request = createIllustrationGenerationRequest(options);
  const raw = await provider.generate(request);
  const normalized = raw.background === "transparent"
    ? { ...raw, background: "transparent" as const }
    : await requireAlphaProcessor(alphaProcessor).extract(raw, request);

  return {
    id: request.id,
    src: normalized.src,
    alt: request.alt,
    kind: request.kind,
    styleId: request.styleId,
    mediaType: normalized.mediaType,
    width: normalized.width,
    height: normalized.height,
    background: "transparent",
    provenance: `${provider.name}${raw.background === "transparent" ? "" : ` + ${alphaProcessor!.name}`}`,
  };
}

function requireAlphaProcessor(
  processor: IllustrationAlphaProcessor | undefined,
): IllustrationAlphaProcessor {
  if (!processor) {
    throw new Error(
      "The illustration provider returned an opaque asset. Inject an IllustrationAlphaProcessor before registering it.",
    );
  }
  return processor;
}

function defineIllustrationLibrary(assets: readonly IllustrationAsset[]): IllustrationLibrary {
  const all = Object.freeze([...assets]);
  const byId = new Map(all.map((asset) => [asset.id, asset]));
  return Object.freeze({
    all,
    get: (id: string) => byId.get(id),
  });
}

export {
  createIllustrationGenerationRequest,
  defineIllustrationLibrary,
  runIllustrationPipeline,
};
export type {
  IllustrationAlphaProcessor,
  IllustrationAsset,
  IllustrationBackground,
  IllustrationGenerationProvider,
  IllustrationGenerationRequest,
  IllustrationLibrary,
  IllustrationMediaType,
  IllustrationPipelineOptions,
  IllustrationSafeArea,
  RawIllustration,
};
