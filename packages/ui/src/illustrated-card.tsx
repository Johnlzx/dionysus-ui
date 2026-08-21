/**
 * [INPUT]: 依赖 React DOM 属性、共享 cn() 与由调用方提供的独立 visual 插槽
 * [OUTPUT]: 对外提供参考编辑部顾问卡片构图的 IllustratedCard 与元数据契约
 * [POS]: 内容装配层，只定义卡片结构；不感知图片来源、生成模型或具体配图类型
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
import { type ComponentPropsWithoutRef, type ReactNode } from "react";
import { cn } from "./cn";

interface IllustratedCardMetaItem {
  label: string;
  value: ReactNode;
}

interface IllustratedCardProps extends Omit<ComponentPropsWithoutRef<"article">, "title"> {
  eyebrow?: ReactNode;
  title: ReactNode;
  metadata?: readonly IllustratedCardMetaItem[];
  visual?: ReactNode;
  footer?: ReactNode;
  titleClassName?: string;
  contentClassName?: string;
}

function IllustratedCard({
  eyebrow,
  title,
  metadata = [],
  visual,
  footer,
  className,
  titleClassName,
  contentClassName,
  ...props
}: IllustratedCardProps) {
  return (
    <article data-slot="illustrated-card" className={cn("illustrated-card group/illustrated-card", className)} {...props}>
      <div className={cn("illustrated-card__content", contentClassName)}>
        <header className="illustrated-card__header">
          {eyebrow ? <p className="illustrated-card__eyebrow">{eyebrow}</p> : null}
          <h3 className={cn("illustrated-card__title", titleClassName)}>{title}</h3>
        </header>

        {metadata.length > 0 ? (
          <dl className="illustrated-card__metadata">
            {metadata.map((item) => (
              <div key={item.label} className="min-w-0">
                <dt className="illustrated-card__meta-label">{item.label}</dt>
                <dd className="illustrated-card__meta-value">{item.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        {footer ? <footer className="illustrated-card__footer">{footer}</footer> : null}
      </div>

      {visual ? <div className="illustrated-card__visual">{visual}</div> : null}
      <div aria-hidden className="illustrated-card__content-wash" />
    </article>
  );
}

export { IllustratedCard };
export type { IllustratedCardMetaItem, IllustratedCardProps };
