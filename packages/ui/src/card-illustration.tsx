/**
 * [INPUT]: 依赖 React 图片属性、共享 cn() 与 illustration-generation 的 Alpha 资产契约
 * [OUTPUT]: 对外提供带媒体安全区与独立 CSS 渐隐层的 CardIllustration 前景呈现适配器
 * [POS]: 透明配图资产进入卡片之前的 presentation adapter，不生成图片也不拥有卡片内容
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
import { type CSSProperties, type ImgHTMLAttributes } from "react";
import { cn } from "./cn";
import type { IllustrationAsset } from "./illustration-generation";

type CardIllustrationPlacement = "right" | "center" | "bleed";
type CardIllustrationScale = "sm" | "md" | "lg";
type CardIllustrationFade = "soft" | "deep" | "none";

interface CardIllustrationProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "alt" | "src"> {
  asset: IllustrationAsset;
  placement?: CardIllustrationPlacement;
  scale?: CardIllustrationScale;
  fade?: CardIllustrationFade;
  decorative?: boolean;
  imageClassName?: string;
}

function CardIllustration({
  asset,
  placement = "right",
  scale = "md",
  fade = "soft",
  decorative = true,
  className,
  imageClassName,
  loading = "lazy",
  style,
  ...props
}: CardIllustrationProps) {
  const imageStyle = {
    ...style,
    "--card-illustration-ratio": asset.width && asset.height ? `${asset.width} / ${asset.height}` : undefined,
  } as CSSProperties;

  return (
    <figure
      aria-hidden={decorative || undefined}
      className={cn("card-illustration", className)}
      data-placement={placement}
      data-scale={scale}
      data-fade={fade}
    >
      <span className="card-illustration__fade">
        <span className="card-illustration__media">
          <img
            {...props}
            src={asset.src}
            alt={decorative ? "" : asset.alt}
            loading={loading}
            decoding="async"
            draggable={false}
            className={cn("card-illustration__image", imageClassName)}
            style={imageStyle}
          />
        </span>
      </span>
    </figure>
  );
}

export { CardIllustration };
export type {
  CardIllustrationFade,
  CardIllustrationPlacement,
  CardIllustrationProps,
  CardIllustrationScale,
};
