> [!TIP]
> 一个官方的案例

# Aptogotchi（集成无密钥账户）

Aptogotchi 是一个简单有趣的全栈、端到端的去中心化应用（dApp），展示了如何使用 Move 语言构建 dApp 的基础知识。

我们介绍了以下概念：

1. 如何将 OIDC 提供商（本例中为 Google）作为钱包登录选项进行连接。
2. 如何连接并使用 Web2 账户与 Aptos 区块链上的智能合约进行交互。
3. 如何签署并提交交易，而无需用户对每笔交易进行签名。

这个 dApp 将作为教学演示，在 [Aptos Learn](https://learn.aptoslabs.com/) 上进行托管。

---

这是一个使用 [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app) 初始化的 [Next.js](https://nextjs.org/) 项目。

---

## 开始使用

1. 安装所有项目依赖项：

```bash
cd frontend
```

```bash
pnpm install
```

2. 配置

[Aptos Learn](https://learn.aptoslabs.com/example/aptogotchi-keyless/)

在 [google cloud 控制台](https://console.cloud.google.com) 中配置 OAuth，复制出客户端 ID

复制 `.env.template` 并删除后缀 `.template` 把客户端 ID 粘贴到 `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

3. 运行开发服务器：

```bash
pnpm dev
```

用你的浏览器打开 [http://localhost:3000](http://localhost:3000) 来查看结果。

你可以通过修改 `app/page.tsx` 来开始编辑页面。当你编辑文件时，页面会自动更新。

该项目使用了 [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) 来自动优化和加载 Inter，这是 Google 的自定义字体。

## 学习更多

要了解更多关于 Next.js 的信息，请查看以下资源：

- [Next.js 文档](https://nextjs.org/docs) - 了解 Next.js 的特性和 API。
- [学习 Next.js](https://nextjs.org/learn) - 一个互动式的 Next.js 教程。

你可以查看 [Next.js GitHub 仓库](https://github.com/vercel/next.js/) - 欢迎你的反馈和贡献！

## 在 Vercel 上部署

部署你的 Next.js 应用最简单的方法是使用 Next.js 创作者提供的 [Vercel 平台](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)。

查看我们的 [Next.js 部署文档](https://nextjs.org/docs/deployment) 以获取更多详细信息。

```bash
├── src
│   ├── app
│   │   ├── callback
│   │   │   └── page.tsx // 特定于回调功能的页面组件
│   │   ├── globals.css // 全局样式文件，包含通用CSS
│   │   ├── home
│   │   │   ├── Body.tsx // 首页主体部分的组件
│   │   │   ├── Connected.tsx // 已连接状态的组件
│   │   │   ├── Mint
│   │   │   │   └── index.tsx // 铸造（Mint）相关功能的组件
│   │   │   ├── NotConnected.tsx // 未连接状态的组件
│   │   │   └── Pet
│   │   │       ├── Actions.tsx // 宠物相关操作的组件
│   │   │       ├── Details.tsx // 宠物详细信息的组件
│   │   │       ├── Image.tsx // 宠物图片展示组件
│   │   │       ├── ShufflePetImage.tsx // 宠物图片洗牌展示组件
│   │   │       ├── Summary.tsx // 宠物摘要信息组件
│   │   │       └── index.tsx // Pet目录的入口文件或默认导出
│   │   ├── layout.tsx // 应用布局组件，可能定义页面结构
│   │   └── page.tsx // 可能为通用页面组件或入口页面
│   ├── components
│   │   ├── AptogotchiCollection
│   │   │   └── index.tsx // 管理Aptogotchi集合的组件
│   │   ├── ClientOnly.tsx // 客户端渲染组件，服务端不会渲染
│   │   ├── GoogleLogo.tsx // Google标志组件
│   │   ├── HealthBar
│   │   │   └── index.tsx // 健康条UI组件
│   │   ├── ShuffleButton
│   │   │   └── index.tsx // 可能用于控制洗牌功能的按钮组件
│   │   └── WalletButtons
│   │       └── index.tsx // 钱包相关操作的按钮组件
│   ├── context
│   │   ├── KeylessAccountContext.tsx // 无钥匙账户上下文，用于状态管理
│   │   └── PetContext.tsx // 宠物上下文，可能用于管理宠物状态
│   ├── graphql
│   │   └── queryAptogotchiCollection.ts // GraphQL查询，用于获取Aptogotchi集合
│   ├── hooks
│   │   ├── useEphemeralKeyPair.ts // 自定义React钩子，可能用于生成临时密钥对
│   │   └── useGetAptogotchiCollection.ts // 自定义钩子，用于获取Aptogotchi集合
│   └── utils
│       ├── GeoTargetly.tsx // 可能与地理位置相关的工具组件
│       ├── address.ts // 地址相关的实用工具
│       ├── aptosClient.ts // 与Aptos区块链客户端交互的工具
│       ├── env.ts // 环境变量配置文件
│       ├── range.ts // 可能包含与范围或区间相关的实用工具
│       └── useTypingEffect.ts // 自定义钩子，可能用于实现打字效果
├── tailwind.config.js // Tailwind CSS的配置文件
└── tsconfig.json // TypeScript的配置文件
```
