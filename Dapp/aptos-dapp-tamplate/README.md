```yaml
original: 'https://github.com/aptos-labs/create-aptos-dapp#'
```

# 运行本项目

```
pnpm start
```

## 创建 Aptos Dapp

`create-aptos-dapp` 为 dapp 开发人员提供了一个启动包，以便在 Aptos 网络上轻松引导 dapp 的创建。

> [!NOTE]
> 无需克隆：在终端运行 `npx create-aptos-dapp` 即可开始

## 快速开始

要创建 Aptos dapp，请打开终端，cd 进入您想要创建 `dapp` 的目录，然后运行以下命令：

```bash
npx create-aptos-dapp
```

然后按照提示操作！

(npx 随 npm 5.2+ 及以上版本附带，请参阅旧版 npm 版本的说明)

## `create-aptos-dapp` 是什么？

`create-aptos-dapp` 简化了初始设置和配置流程，提供了现代的开发工作流程，并提供了一系列节省时间和精力的好处，使开发人员能够专注于有效地在 Aptos 上构建 dapp。

`create-aptos-dapp` 简化了 dapp 开发项目的初始设置，提供了坚实的基础，并允许开发人员快速开始编码，而不会被配置和样板代码拖慢。

## 为什么要使用 `create-aptos-dapp` ？

样板设置：`create-aptos-dapp` 工具为您生成预定义的项目结构和配置文件。这节省了您手动设置基本项目结构的时间，这可能是耗时且容易出错的。

依赖项管理：`create-aptos-dapp` 工具为您管理项目依赖项。它生成一个包含所需包及其版本的 `package.json` 文件，确保您的项目使用兼容的库。

Move 文件夹：`create-aptos-dapp` 生成一个包含 Move 模块基本结构的 `move` 文件夹。它创建了一个带有 `Move.toml` 和包含 move 模块（智能合约）的 `sources` 文件夹。

最佳实践：`create-aptos-dapp` 工具结合了开发 Aptos 网络的最佳实践和结构建议。这确保了您的项目具有坚实的基础。

内置脚本：`create-aptos-dapp` 工具包括用于常见任务的内置脚本，如初始化默认配置文件、编译 move 模块和将智能合约发布到链上。这简化了常见的开发工作流程。

## 先决条件

node 和 npm（npm ≥ 5.2.0）

## 模板

`create-aptos-dapp` 为您生成预定义的模板结构和配置文件

web dapp 样板：一个简单轻量级的基于 web 的 dapp 样板，包含了开始一个 dapp 所需的基本结构。

node dapp 样板：一个简单轻量级的 node 模板，包含了开始一个 Aptos 上的 node 项目所需的基本结构。

todolist dapp 样板：一个完全工作的待办事项列表 dapp，带有预先实现的智能合约和用户界面。

# 预期结果

```bash
Installing dependencies, might take a couple of minutes...

Success! You're ready to start building your dapp on Aptos.

Next steps:

1. run [cd aptos-dapp-tamplate] to your dapp directory.

2. run [pnpm run move:init] to initialize a new CLI Profile.

3. run [pnpm run move:compile] to compile your move contract.

4. run [pnpm run move:publish] to publish your contract.

5. run [pnpm start] to run your dapp.
```
