# Third-party notices

## Lucide React

Dionysus UI 使用 Lucide React 作为基础图标字形库。应用只通过 `@dionysus/ui/icons` 使用经过设计系统批准的静态子集；仓库不复制或维护完整 SVG 图标集。

- Project: `lucide-icons/lucide`
- Package: `lucide-react@1.24.0`
- Source: <https://github.com/lucide-icons/lucide>
- Copyright: © 2026 Lucide Icons and Contributors
- License: ISC；部分源自 Feather 的图标同时适用 MIT

完整上游许可证文本保存在 [`docs/licenses/lucide-react.LICENSE`](docs/licenses/lucide-react.LICENSE)，分发构建时必须随第三方声明一并保留。

## Multica visual system

Dionysus Desktop 的视觉 Token、桌面 App Shell 密度、看板列与卡片层级、部分组件变体约定，基于以下开源项目研究与适配：

- Project: `multica-ai/multica`
- Source: <https://github.com/multica-ai/multica>
- Audited commit: `dd692058d7bc050dbc5518d9470e1b4f4b51ab03`
- Copyright: © 2025 Multica, Inc.

Multica 使用修改版 Apache License 2.0。上游附加条件如下：

1. Multica 可用于商业用途，包括作为其他应用的后端服务或企业任务管理平台；但满足下列条件时，必须从生产者处取得商业许可证：
   - 未经 Multica 书面授权，不得使用 Multica 源代码向第三方提供托管服务，也不得将其作为组件嵌入向第三方销售、许可或商业分发的产品或服务。
   - 此限制包括以整体或实质部分提供 SaaS、托管服务或集成商业产品；单一组织内部使用不要求商业许可证。
   - 使用 Multica 前端时，不得移除或修改 Multica 控制台或应用中的 Logo 与版权信息。上游将从源代码运行时的 `apps/web/` 或 Docker `web` 镜像定义为其前端。
2. 贡献者同意生产者可调整开源协议的严格程度，且贡献代码可用于商业用途。

除以上附加条件外，其余权利和限制遵循 Apache License 2.0。

当前 Dionysus 定位为免费、开源、自用项目。若未来变为托管服务、商业产品或向第三方分发，发布前必须重新进行许可证审查并按需取得商业授权。

Upstream license: <https://github.com/multica-ai/multica/blob/main/LICENSE>

## React Bits Glass Surface

Dionysus Desktop 的 `GlassSurface` 语义材质研究并适配自 React Bits 的 Glass Surface 组件；当前实现以 Dionysus light/dark Token 重写其半透明背景、尺寸感知 SVG 位移图、backdrop filter、内描边与分层阴影，只作为应用内部 UI 原语使用。

- Project: `DavidHDev/react-bits`
- Source: <https://github.com/DavidHDev/react-bits>
- Audited commit: `f88bb89c588e8376235ea7a025485cfe532e0766`
- Copyright: © 2026 David Haz

React Bits 使用 `MIT + Commons Clause License Condition v1.0`：允许把软件作为应用、网站或产品的一部分使用和修改，但禁止单独、打包或移植后销售、再许可或重新分发组件本身。Dionysus 仅把适配后的材质实现作为应用内部 UI 原语使用。

Upstream license: <https://github.com/DavidHDev/react-bits/blob/main/LICENSE.md>

## React Bits Pro Fog Sphere

Dionysus Desktop 的 `FogSphere` WebGL 体积雾球组件来自产品所有者 React Bits Pro 账户提供的授权源码，并在项目内适配为 light/dark 语义 Token、自动主题反转、受控 GPU 质量和 reduced-motion 静止帧。它只作为应用内部的大纲生成等待原语及开发态设计系统样例使用。

- Product: React Bits Pro
- Component: Fog Sphere (`fog-sphere-tw`)
- Source: <https://pro.reactbits.dev/docs/components/fog-sphere>
- Integrated: 2026-07-19
- Copyright: © 2026 David Haz

该源码继续受购买账户对应的 React Bits Pro 许可约束；本仓库中的本节说明不向第三方单独授予组件源码的再分发权。发布或重新分发 Dionysus 前，必须按实际发布方式复核 React Bits Pro 许可。

License: <https://pro.reactbits.dev/license>
