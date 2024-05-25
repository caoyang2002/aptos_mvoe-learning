# Aptogotchi（无钥匙集成）

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
