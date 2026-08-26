/**
 * [INPUT]: 依赖 React、React Router 与 Dionysus 类名工具
 * [OUTPUT]: 对外提供 Landing 网站内部使用的 Rail、Divider、Action、Keycap 与 SectionHeader
 * [POS]: web/src/landing 的网站级组件边界；不从 @dionysus/ui 导出，不进入产品设计系统包
 * [PROTOCOL]: 变更时同步检查 landing-system.css 与 docs/LANDING_SITE_SYSTEM.md
 */
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "@dionysus/ui/icons";
import { cn } from "@dionysus/ui";

interface LandingRailSectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  labelledBy?: string;
}

function LandingRailSection({ children, className, id, labelledBy }: LandingRailSectionProps) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={cn("landing-rail-section", className)}>
      <span className="landing-node landing-node--left" aria-hidden />
      <span className="landing-node landing-node--right" aria-hidden />
      {children}
    </section>
  );
}

function LandingSlashDivider() {
  return <div className="landing-slash-divider" aria-hidden><span /></div>;
}

function LandingKeycap({ children }: { children: ReactNode }) {
  return <kbd className="landing-keycap">{children}</kbd>;
}

interface LandingActionProps {
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
  keycap?: string;
  to: string;
  tone?: "primary" | "secondary" | "text";
}

function LandingAction({ children, className, icon, keycap, to, tone = "secondary" }: LandingActionProps) {
  return (
    <Link className={cn("landing-action", `landing-action--${tone}`, className)} to={to}>
      {icon}
      <span>{children}</span>
      {keycap ? <LandingKeycap>{keycap}</LandingKeycap> : null}
    </Link>
  );
}

interface LandingSectionHeaderProps {
  actions?: ReactNode;
  align?: "left" | "center";
  description: ReactNode;
  eyebrow?: string;
  id: string;
  title: ReactNode;
}

function LandingSectionHeader({ actions, align = "left", description, eyebrow, id, title }: LandingSectionHeaderProps) {
  return (
    <header className={cn("landing-section-header", align === "center" && "landing-section-header--center")}>
      <div>
        {eyebrow ? <p className="landing-eyebrow">{eyebrow}</p> : null}
        <h2 id={id}>{title}</h2>
        <p>{description}</p>
      </div>
      {actions ? <div className="landing-section-header__actions">{actions}</div> : null}
    </header>
  );
}

function LandingTextLink({ children, to }: { children: ReactNode; to: string }) {
  return <Link className="landing-text-link" to={to}>{children}<ArrowRight aria-hidden /></Link>;
}

export {
  LandingAction,
  LandingKeycap,
  LandingRailSection,
  LandingSectionHeader,
  LandingSlashDivider,
  LandingTextLink,
};
