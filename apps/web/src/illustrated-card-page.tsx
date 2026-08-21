/**
 * [INPUT]: 依赖 @dionysus/ui 的配图风格、默认资产库、CardIllustration、IllustratedCard 与文档呈现原语
 * [OUTPUT]: 对外提供 Illustrated Card 的活示例、解耦流程、风格契约、装配示例与 API 文档
 * [POS]: web/src 的设计系统活规范页，验证共享组件而不在页面内重造卡片样式
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
import { useState } from "react";
import {
  CardIllustration,
  DIONYSUS_ILLUSTRATIONS,
  IllustratedCard,
  SegmentedControl,
  createIllustrationPrompt,
  type CardIllustrationFade,
  type IllustrationAsset,
} from "@dionysus/ui";
import { ArrowRight, Check } from "@dionysus/ui/icons";
import { DocSection, InlineCode, PageIntro, PropTable, RuleNote, Specimen } from "./docs-elements";

interface CardExample {
  eyebrow: string;
  title: string;
  asset: IllustrationAsset;
  metadata: readonly { label: string; value: string }[];
}

const getAsset = (id: string): IllustrationAsset => {
  const asset = DIONYSUS_ILLUSTRATIONS.get(id);
  if (!asset) throw new Error(`Missing design-system illustration: ${id}`);
  return asset;
};

const CARD_GROUPS: readonly { title: string; items: readonly CardExample[] }[] = [
  {
    title: "Editorial utilities",
    items: [
      {
        eyebrow: "Find the structure inside a complex brief",
        title: "Narrative Lens",
        asset: getAsset("paper-orbit"),
        metadata: [
          { label: "Uses", value: "184" },
          { label: "Style", value: "Cutout" },
          { label: "Type", value: "Abstract" },
          { label: "Status", value: "Ready" },
        ],
      },
      {
        eyebrow: "Capture interviews without losing the room",
        title: "Field Notes",
        asset: getAsset("field-recorder"),
        metadata: [
          { label: "Uses", value: "96" },
          { label: "Style", value: "Cutout" },
          { label: "Type", value: "Object" },
          { label: "Status", value: "Ready" },
        ],
      },
    ],
  },
  {
    title: "Creative tools",
    items: [
      {
        eyebrow: "Keep sources legible and close to the work",
        title: "Source Archive",
        asset: getAsset("archive-stack"),
        metadata: [
          { label: "Uses", value: "121" },
          { label: "Style", value: "Cutout" },
          { label: "Type", value: "Object" },
          { label: "Status", value: "Ready" },
        ],
      },
      {
        eyebrow: "Inspect the image before it enters the story",
        title: "Visual Review",
        asset: getAsset("lens-study"),
        metadata: [
          { label: "Uses", value: "74" },
          { label: "Style", value: "Cutout" },
          { label: "Type", value: "Object" },
          { label: "Status", value: "Ready" },
        ],
      },
    ],
  },
];

const ASSEMBLY_CODE = `const asset = DIONYSUS_ILLUSTRATIONS.get("lens-study")

<IllustratedCard
  eyebrow="Inspect the image before it enters the story"
  title="Visual Review"
  metadata={metadata}
  visual={
    <CardIllustration
      asset={asset}
      placement="right"
      scale="lg"
      fade="soft"
    />
  }
/>`;

function IllustratedCardPage() {
  const [fade, setFade] = useState<CardIllustrationFade>("soft");
  const prompt = createIllustrationPrompt({
    subject: "a compact modular field recorder with two tactile dials",
    kind: "object",
  });

  return (
    <>
      <PageIntro
        eyebrow="Components"
        title="图片是资产，卡片是渲染器。"
        description="Illustrated Card 复用编辑部顾问卡片的留白、标题、元数据与右下视觉锚点，但把风格定义、图片生成、Alpha 处理和卡片装配拆成独立契约。"
        status="New"
      />

      <DocSection
        id="illustrated-card-live"
        title="Live specimen"
        description="同一套卡片可以装配物件、抽象造型或人物。当前示例已使用 Zonic gpt-image-2 high 生成的 Editorial photo cutout，并统一通过真实 Alpha、安全区与外部阴影质检。"
      >
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-xl text-xs leading-5 text-muted-foreground">图片本身不含底部渐变；消隐由 Alpha mask 与 Surface overlay 两层共同负责。切换参数不会重新生成或修改资产。</p>
          <SegmentedControl
            label="配图底部消隐强度"
            value={fade}
            onValueChange={(value) => setFade(value as CardIllustrationFade)}
            items={[
              { value: "soft", label: "Soft" },
              { value: "deep", label: "Deep" },
              { value: "none", label: "None" },
            ]}
          />
        </div>

        <Specimen
          title="Editorial card collection"
          description="媒体安全区保护完整轮廓；卡片只裁切最终边界，不在资产顶部制造截断。"
          code={ASSEMBLY_CODE}
          previewClassName="block p-4 sm:p-6"
        >
          <div className="w-full space-y-8">
            {CARD_GROUPS.map((group) => (
              <section key={group.title} aria-labelledby={`card-group-${group.title.replace(/\s+/g, "-").toLowerCase()}`}>
                <h3 id={`card-group-${group.title.replace(/\s+/g, "-").toLowerCase()}`} className="mb-4 text-sm font-medium">{group.title}</h3>
                <div className="grid gap-4 lg:grid-cols-2">
                  {group.items.map((card, index) => (
                    <IllustratedCard
                      key={card.title}
                      eyebrow={card.eyebrow}
                      title={card.title}
                      metadata={card.metadata}
                      visual={(
                        <CardIllustration
                          asset={card.asset}
                          placement="right"
                          scale={index % 2 === 0 ? "lg" : "md"}
                          fade={fade}
                        />
                      )}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </Specimen>
      </DocSection>

      <DocSection
        id="illustrated-card-pipeline"
        title="四层职责"
        description="每层只有一个变化原因：改审美不碰模型，换模型不碰卡片，调构图不重做资产。"
      >
        <div className="grid overflow-hidden rounded-xl border border-border bg-border md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr]">
          {[
            ["01", "Style", "按人物、物件、场景与抽象类型分流的 v2 prompt"],
            ["02", "Provider", "模型生成与可选 Alpha processor"],
            ["03", "Registry", "可追溯的透明前景资产"],
            ["04", "Renderer", "安全区、定位、缩放、卡片边界与双层 fade"],
          ].map(([number, title, copy], index) => (
            <div key={title} className="contents">
              <div className="bg-background p-4">
                <span className="font-mono text-micro text-muted-foreground">{number}</span>
                <p className="mt-4 text-xs font-medium">{title}</p>
                <p className="mt-1 text-micro leading-4 text-muted-foreground">{copy}</p>
              </div>
              {index < 3 ? <div className="hidden items-center bg-background px-1 md:flex"><ArrowRight aria-hidden className="size-3 text-muted-foreground" /></div> : null}
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            ["Asset", "只包含主体与真实 Alpha，不含卡片背景和底部渐变。"],
            ["Presentation", "CardIllustration 独立控制 placement、scale 和 fade。"],
            ["Composition", "IllustratedCard 只接收 visual 插槽，不关心图片来源。"],
          ].map(([title, copy]) => (
            <div key={title} className="border-t border-border pt-3">
              <p className="text-xs font-medium">{title}</p>
              <p className="mt-2 text-micro leading-4 text-muted-foreground">{copy}</p>
            </div>
          ))}
        </div>
      </DocSection>

      <DocSection
        id="illustrated-card-style"
        title="Editorial photo cutout v2"
        description="默认风格以真实编辑摄影为基准，按题材选择 use case，并显式约束安全边距、完整轮廓、真实 Alpha、禁外部阴影和禁烘焙渐变。"
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,.8fr)]">
          <div className="overflow-hidden rounded-xl border border-border bg-primary p-4 text-primary-foreground">
            <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-micro leading-5"><code>{prompt}</code></pre>
          </div>
          <div className="divide-y divide-border border-y border-border">
            {[
              "人物、物件、场景、抽象分别使用适合的生成指令",
              "顶部至少 10%、两侧至少 8% 的透明安全区",
              "真实编辑摄影质感，明确排除矢量、卡通和塑料 3D",
              "真实 Alpha，无外部阴影、无边缘 halo、无烘焙渐变",
            ].map((item) => (
              <div key={item} className="flex gap-3 py-3 text-xs leading-5">
                <Check aria-hidden className="mt-0.5 size-3.5 shrink-0 text-success-foreground" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
        <RuleNote kind="safety">
          如果生成 provider 只返回普通背景图，<InlineCode>runIllustrationPipeline()</InlineCode> 会要求注入 <InlineCode>IllustrationAlphaProcessor</InlineCode>；输出还必须满足 4:5 画布、安全区、禁外部阴影和禁烘焙 fade 契约。绿幕不作为默认生产路径。
        </RuleNote>
      </DocSection>

      <DocSection
        id="illustrated-card-assembly"
        title="装配边界"
        description="常见变化通过插槽和少量稳定变体解决，不把生成参数泄漏给卡片。"
      >
        <div className="mb-6 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3">
          {[
            ["Character", "人物半身像仍使用同一 Alpha 契约。"],
            ["Object", "工具、文档、设备和材料是默认通用库。"],
            ["Abstract", "概念造型适合无法用具体物件表达的能力。"],
          ].map(([title, copy]) => (
            <div key={title} className="bg-background p-4">
              <p className="text-xs font-medium">{title}</p>
              <p className="mt-2 text-micro leading-4 text-muted-foreground">{copy}</p>
            </div>
          ))}
        </div>
        <PropTable rows={[
          { name: "visual", type: "ReactNode", defaultValue: "—", description: "任意视觉插槽；推荐使用 CardIllustration，但不绑定图片实现。" },
          { name: "metadata", type: "IllustratedCardMetaItem[]", defaultValue: "[]", description: "左下两列元数据；长值自动截断。" },
          { name: "placement", type: '"right" | "center" | "bleed"', defaultValue: '"right"', description: "CardIllustration 在卡片里的锚定方式。" },
          { name: "scale", type: '"sm" | "md" | "lg"', defaultValue: '"md"', description: "只改变呈现尺寸，不修改原资产。" },
          { name: "fade", type: '"soft" | "deep" | "none"', defaultValue: '"soft"', description: "Alpha mask + Surface overlay 强度；不会烘焙进图片。" },
          { name: "asset", type: "IllustrationAsset", defaultValue: "—", description: "只接受已满足透明前景契约的资产。" },
        ]} />
      </DocSection>
    </>
  );
}

export { IllustratedCardPage };
