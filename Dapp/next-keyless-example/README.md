This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

# 运行

```bash
pnpm dev
```



# 从零开始构建

> [!TIP]
>
> 这是我完成 Keyless 实践（next-keyless-example）后第二次实现的，显示的内容会和当前项目不同，查看[原项目](../test/test-keyless-example-next)

```bash
# 支持无密钥功能的实验性 SDK 版本
pnpm install @aptos-labs/ts-sdk@zeta
pnpm i jwt-decode
```



# 一、准备环境

包括 `Google` 的配置和`前端框架` 配置

## 1. 配置 `OpenID` 集成

[配置说明](https://www.chyraw.com/开发教程/前端-特性/无密钥账户#一配置您的-openid-集成)

目前只支持 Google。Aptos 将在以后支持其他的 OIDC 提供商（例如苹果、Kakaotalk、微软等）。


| 身份提供者 | 认证URL                                                      |
| ---------- | ------------------------------------------------------------ |
| Google     | `https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount?client_id=$%7BCLIENT_ID%7D&redirect_uri=$%7BREDIRECT_URI%7D&response_type=id_token&scope=openid%20email&nonce=$%7BNONCE%7D` |

隐式流程（无授权码交换）是首选的身份验证方法。下面的集成步骤假定使用隐式流程。

为了支持 `OpenID` 身份验证，您需要从 Google 获取 `client_id`，并设置授权来源和重定向 URI。

在 [Google API 控制台](https://console.developers.google.com/) 中设置您的项目。

注册 Google 云账户（如果您还没有）

1. 创建一个新项目或选择现有项目
    - 上方的`下拉选择器`中`创建项目` -> 在`左侧菜单`中选择 `API 和服务` -> `凭据` -> 上方`创建凭据` -> `OAuth 客户端 ID`  -> `配置同意屏幕` -> `外部` -> `创建` -> `发布应用` -> `提交验证`


<iframe width="800" height="450" src="https://learn.aptoslabs.com/videos/google_api_console.mov" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

2. 转到[凭据](https://console.developers.google.com/apis/credentials)页面。
    - `创建凭据` -> `创建 OAuth 客户端 ID`

3. 如果之前没有设置过OAuth同意屏幕，您可能需要进行设置。
    - 这是您将为应用程序配置一些应用信息以及应用程序的作用域和权限的地方。

<iframe width="800" height="450" src="https://learn.aptoslabs.com/videos/credentials_to_consent_screen.mov" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

4. 选择或创建一个新的“OAuth 2.0 Client ID”。

5. 配置授权来源（您的dApp来源）。

    - 这可能是 `http://localhost:3000` 用于本地开发。
    - 确保在部署应用程序后更新这些来源。

6. 配置重定向URI（在身份验证后接收授权码和/或 `id_token` 的回调处理程序）。
    - 例如： `http://localhost:3000/callback` 用于本地开发。

7. 获取您的应用程序的 `client_id`。
    - 将其保存在您的 `.env` 变量或常量文件中。

<iframe width="800" height="450" src="https://learn.aptoslabs.com/videos/create_client_id.mov" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>



> [!TIP]
>
> 至此，我默认你已经准备好了 `客户端 ID`，它看起来像这样
>
> ```bash
> 40604332144-aaa7a6a5a7a78s7sa8a8ag77aa6a6a.apps.googleusercontent.com
> ```



## 2. 安装 Next.js 框架

```bash
npx create-next-app@latest
##############################################################################
> 你的项目名是什么？# 它会创建一个该名称的文件夹（项目），然后使用之后的选项来初始化这个文件夹（项目）
> 你希望使用 TypeScript 吗？ # TypeScript 扩展了 JavaScript 的语法，添加了一些新特性，例如接口、枚举、泛型等，前者是后者的超级
> 你希望使用 ELSint 吗？ # ELSint 是用于 JavaScript 和 TypeScript 代码静态分析的工具
> 你希望使用 Tailwind CSS 吗？ # Tailwind CSS 是一个基于原子类的 CSS 框架，它提供了一组预定义的 CSS 类，用于快速构建现代 Web 界面
> 是否要在项目中使用 `src/` 目录？ # 通常，src/ 目录是用来存放源代码（source code）的目录，开发者
> 是否想要使用应用程序路由器（App Router）？推荐使用 # 应用程序路由器是一种工具或库，用于管理应用程序中不同页面之间的导航和路由。
> 是否希望自定义默认的导入别名（@/*）?  # 默认的 NO 选项表示：`import React from 'react'` 这样的语句可以被简化为 `import React from '@/react'`，其中 `@` 是一个别名，代表了项目的根目录。类似地，`@/components/Header` 可以代表项目根目录下的 `components/Header` 路径。
```

> 进入项目根目录

```bash
cd <你的项目名>
```

> 现在你可以测试启动，检查是否成功安装
>
> ```bash
> npm run dev
> # or
> yarn dev
> # or
> pnpm dev
> # or
> bun dev
> ```
>
> - 输出
>
>     ```bash
>     pnpm dev  
>                 
>     > test-keyless-example-next@0.1.0 dev /Users/caoyang/Desktop/GitHub/aptos_mvoe-learning/Dapp/test/test-keyless-example-next
>     > next dev
>                 
>      ⚠ Port 3000 is in use, trying 3001 instead. # 我的 3000 端口已经被使用了，所以使用的是 3001 端口
>       ▲ Next.js 14.2.3
>       - Local:        http://localhost:3001 # 访问这儿显示的端口
>     ```
>
> <p style="color:green">你应该可以看到 NEXT.js 的主页</p>



关于`src/app` 中每个文件的作用可以在[附录](#附录)中查看



## 3. 安装 Aptos SDK

```bash
pnpm install @aptos-labs/ts-sdk@zeta
```

> [!NOTE]
>
> 注意：一定是 `@zeta`，因为目前只有这个 Tag 下的包可以使用 `keyless`



## 4. 创建组件



## 5. 创建 Hook















# 附录

## 1. `app` 中各个文件的作用

```bash
app
├── favicon.ico # 图标文件，通常用作浏览器标签页的图标。用户访问网站时，这个图标会显示在浏览器的地址栏旁边。
├── globals.css # 全局样式文件，它定义了整个应用的样式。在 Next.js 中，你可以使用 CSS 模块、全局样式表或 CSS-in-JS 库来编写样式。 globals.css 文件中的样式将被应用到所有页面和组件上。
├── layout.tsx # 布局组件，它定义了应用的布局结构。在 Next.js 中，布局组件可以用来包裹页面组件，以提供一致的布局和样式。布局组件通常包含导航栏、侧边栏、页脚等元素。在 Next.js 13 中，你可以使用 `app/layout.tsx` 来定义布局。
└── page.tsx # 页面组件，它代表了应用中的一个页面。在 Next.js 中，每个页面组件对应一个路由。页面组件可以包含自己的布局和样式，并且可以使用 Next.js 提供的路由和数据获取功能。
```





# 2. 代码

### 文件夹结构

```bash
├── app
│   ├── callback
│   │   └── page.tsx
│   ├── favicon.ico
│   ├── globals.css
│   ├── home
│   │   ├── Body.tsx
│   │   ├── Connected.tsx
│   │   └── NotConnected.tsx
│   ├── layout.tsx
│   └── page.tsx
├── components
│   ├── ClientOnly.tsx
│   ├── GoogleLogo.tsx
│   └── WalletButtons
│       └── index.tsx
├── context
│   └── KeylessAccountContext.tsx
├── hooks
│   └── useEphemeralKeyPair.ts
└── utils
    └── aptosClient.ts
```







### 代码

#### `src`

##### `src/app`

<details>
<summary>page.tsx</summary>

```tsx

import WalletButtons from '@/components/WalletButtons'
import { Body } from './home/Body'
import ClientOnly from '@/components/ClientOnly'

//-----------------------------------------
export default function Home() {
  return (
    <div>
      <div className="flex sm:justify-center sm:items-center sm:h-screen sm:overflow-hidden">
        <div className="w-screen sm:w-[1200px] sm:h-[800px] sm:m-auto border-4 border-black border-solid">
          <Header />
          <Body />
        </div>
      </div>
    </div>
  )
}

function Header() {
  return (
    <header className="md:sticky top-0 z-10 flex justify-between items-center md:px-6 py-4 bg-gradient-to-r from-orange-300 via-orange-400 to-red-400 shadow-md w-full gap-2">
      <h1 className="text-2xl hidden sm:block">aptos</h1>
      <ClientOnly>
        <WalletButtons />
      </ClientOnly>
    </header>
  )
}


```
</details>

<details>
<summary>layout.tsx</summary>

```tsx

import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { PropsWithChildren } from 'react'
import { KeylessAccountProvider } from '@/context/KeylessAccountContext'
// import 'nes.css/css/nes.min.css'
// import './globals.css'

const kongtext = localFont({
  src: './../../public/kongtext.ttf',
  variable: '--font-kongtext',
})

export const metadata: Metadata = {
  title: 'Aptogotchi',
  description: 'Aptogotchi - Your new favorite on-chain pet!',
  openGraph: {
    title: 'Aptogotchi',
    description: 'Aptogotchi - Your new favorite on-chain pet!',
    images: ['/aptogotchi.png'],
  },
  twitter: {
    card: 'summary',
    site: '@Aptos_Network',
    title: 'Aptogotchi',
    description: 'Aptogotchi - Your new favorite on-chain pet!',
    images: ['/aptogotchi.png'],
  },
}

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta
          name="google-site-verification"
          content="Rnm3DL87HNmPncIFwBLXPhy-WGFDXIyplSL4fRtnFsA"
        />
      </head>
      <body className={kongtext.className}>
        <KeylessAccountProvider>{children}</KeylessAccountProvider>
      </body>
    </html>
  )
}
```
</details>


###### `src/app/home`


<details>
<summary>Body.tsx</summary>

```tsx
"use client";

import { useKeylessAccount } from "@/context/KeylessAccountContext";
import { Connected } from "./Connected";
import { NotConnected } from "./NotConnected";

export function Body() {
  const { keylessAccount } = useKeylessAccount();

  if (keylessAccount) return <Connected />;

  return <NotConnected />;
}
```
</details>

<details>
<summary>Connected.tsx</summary>

```tsx
'use client'

import { useEffect, useCallback, useState } from 'react'
import { getAptosClient } from '@/utils/aptosClient'
import { useKeylessAccount } from '@/context/KeylessAccountContext'

const aptosClient = getAptosClient()

export function Connected() {
  const { keylessAccount } = useKeylessAccount()

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [progress, setProgress] = useState<number>(0)

  useEffect(() => {
    if (!keylessAccount?.accountAddress) return
  }, [keylessAccount?.accountAddress])

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((currentProgress) => {
        if (currentProgress >= 100) {
          clearInterval(interval)
          return 100
        }
        return currentProgress + 1
      })
    }, 25)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col gap-3 p-3 justify-center items-center">
      <div className="nes-container with-title">
        <p className="title">Loading...</p>
        <progress
          className="nes-progress is-primary"
          value={progress}
          max="100"
        ></progress>
      </div>
    </div>
  )
}
```
</details>

<details>
<summary>NotConnected.tsx</summary>

```tsx
'use client'

import React, { useState } from 'react'

export function NotConnected() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="nes-container is-dark with-title text-sm sm:text-base">
        <p className="title">Welcome</p>
        <p>Welcome to Aptogotchi!</p>
      </div>
    </div>
  )
}
```
</details>

###### `src/app/callback`

<details>
<summary>Page.tsx</summary>

```tsx
'use client' // 确保以下代码只在客户端执行
import { jwtDecode } from 'jwt-decode'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getLocalEphemeralKeyPair } from '@/hooks/useEphemeralKeyPair'
import { getAptosClient } from '@/utils/aptosClient'
import { useKeylessAccount } from '@/context/KeylessAccountContext'
import { EphemeralKeyPair, Account } from '@aptos-labs/ts-sdk'
import { KeylessAccountProvider } from '../../context/KeylessAccountContext'

const parseJWTFromURL = (url: string): string | null => {
  const urlObject = new URL(url)
  const fragment = urlObject.hash.substring(1)
  const params = new URLSearchParams(fragment)
  console.log('id_token: ', params.get('id_token'))
  return params.get('id_token')
}

const CallbackPage = () => {
  const { setKeylessAccount } = useKeylessAccount()
  const { push } = useRouter()
  const [progress, setProgress] = useState<number>(0)
  const [hasError, setHasError] = useState<boolean>(false)

  useEffect(() => {
    // 仅在客户端执行
    async function deriveAccount() {
      const jwt = parseJWTFromURL(window.location.href)
      if (!jwt) {
        setHasError(true)
        setProgress(100)
        console.log('No JWT found in URL. Please try logging in again.')
        return
      }
      const payload = jwtDecode<{ nonce: string }>(jwt)
      const jwtNonce = payload.nonce
      const ephemeralKeyPair = getLocalEphemeralKeyPair(jwtNonce)

      if (!ephemeralKeyPair) {
        setHasError(true)
        setProgress(100)
        console.log(
          'No ephemeral key pair found for the given nonce. Please try logging in again.'
        )
        return
      }
      await createKeylessAccount(jwt, ephemeralKeyPair)

      setProgress(100)
      push('/')
    }
    deriveAccount()
  }, [])

  const createKeylessAccount = async (
    jwt: string,
    ephemeralKeyPair: EphemeralKeyPair
  ) => {
    const aptosClient = getAptosClient()
    const keylessAccount = await aptosClient.deriveKeylessAccount({
      jwt,
      ephemeralKeyPair,
    })
    console.log('Keyless Account: ', keylessAccount.accountAddress.toString())
    setKeylessAccount(keylessAccount)
  }

  return (
    <KeylessAccountProvider>
      <div className="flex items-center justify-center h-screen w-screen">
        <div className="relative flex justify-center items-center border rounded-lg px-8 py-2 shadow-sm cursor-not-allowed tracking-wider">
          <span className="absolute flex h-3 w-3 -top-1 -right-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          Redirecting...
        </div>
      </div>
    </KeylessAccountProvider>
  )
}

export default CallbackPage
```
</details>


###### `compnents`

<details>
<summary>GoogleLogo.tsx</summary>

```tsx
function GoogleLogo() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mr-2 h-5 w-5"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M23.54 12.7613C23.54 11.9459 23.4668 11.1618 23.3309 10.4091H12.5V14.8575H18.6891C18.4225 16.295 17.6123 17.5129 16.3943 18.3284V21.2138H20.1109C22.2855 19.2118 23.54 16.2636 23.54 12.7613Z"
        fill="#4285F4"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.4995 23.9998C15.6045 23.9998 18.2077 22.97 20.1104 21.2137L16.3938 18.3282C15.364 19.0182 14.0467 19.4259 12.4995 19.4259C9.50425 19.4259 6.96902 17.403 6.0647 14.6848H2.22266V17.6644C4.11493 21.4228 8.00402 23.9998 12.4995 23.9998Z"
        fill="#34A853"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.06523 14.6851C5.83523 13.9951 5.70455 13.2581 5.70455 12.5001C5.70455 11.7422 5.83523 11.0051 6.06523 10.3151V7.33557H2.22318C1.44432 8.88807 1 10.6444 1 12.5001C1 14.3558 1.44432 16.1122 2.22318 17.6647L6.06523 14.6851Z"
        fill="#FBBC05"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.4995 5.57386C14.1879 5.57386 15.7038 6.15409 16.8956 7.29364L20.194 3.99523C18.2024 2.13955 15.5992 1 12.4995 1C8.00402 1 4.11493 3.57705 2.22266 7.33545L6.0647 10.315C6.96902 7.59682 9.50425 5.57386 12.4995 5.57386Z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default GoogleLogo;
```
</details>

<details>
<summary>ClientOnly.tsx</summary>

```tsx
"use client";

import { PropsWithChildren, useEffect, useState } from "react";

/**
 * To fix Next.js issues with mismatching nonce (client-side) and nonce (server-side) errors.
 *
 * Prevents hydration mismatches by only rendering children on the client. This is different
 * from the 'use client' directive because it prevents the child from being pre-rendered on the
 * server at all.
 */
function ClientOnly({ children }: PropsWithChildren) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{children}</>;
}

export default ClientOnly;
```
</details>

###### `src/components/WalletButtons`

<details>
<summary>index.tsx</summary>

```tsx
'use client'

import GoogleLogo from '../GoogleLogo'
import useEphemeralKeyPair from '@/hooks/useEphemeralKeyPair'

//-------------------------------------
const buttonStyles =
  'nes-btn flex items-center justify-center md:gap-4 py-2 flex-nowrap whitespace-nowrap'

export default function WalletButtons() {
  const ephemeralKeyPair = useEphemeralKeyPair()
  console.log('ephemeralKeyPair-nonce is : ', ephemeralKeyPair.nonce)

  const redirectUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')

  const searchParams = new URLSearchParams({
    // 请替换为您的客户端ID
    client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    // redirect_uri 必须在Google开发者控制台中注册。此回调页面解析URL片段中的id_token，并将其与临时密钥对结合以派生无密钥账户。
    redirect_uri:
      typeof window !== 'undefined'
        ? `${window.location.origin}/callback`
        : (process.env.NODE_ENV === 'development'
            ? 'http://localhost:3000'
            : process.env.NEXT_PUBLIC_VERCEL_URL) + '/callback',
    // 这使用了 OpenID Connect 隐式流返回 id_token。这对于单页应用(SPA)是推荐的，因为它不需要后端服务器。
    response_type: 'id_token',
    scope: 'openid email profile',
    nonce: ephemeralKeyPair.nonce,
  })

  redirectUrl.search = searchParams.toString()
  console.log('redirectUrl is : ', redirectUrl.search)

  return (
    <>
      <div className="flex items-center justify-center m-auto sm:m-0 sm:px-4">
        <a href={redirectUrl.toString()} className="hover:no-underline">
          <button className={buttonStyles}>
            <GoogleLogo />

            <p>Sign in with Google</p>
          </button>
        </a>
      </div>
    </>
  )
}
```
</details>

###### `src/context`

<details>
<summary>KeylessAccountContext.tsx</summary>

```tsx

'use client' // 指定这个文件应该被当作客户端组件来处理。
import React, { createContext, useContext, useState } from 'react'
import { Account } from '@aptos-labs/ts-sdk'

// 定义一个上下文类型，用于管理 keyless 账户信息。
// 使用方式：在需要使用 keyless 账户的地方，使用 useKeylessAccount 钩子函数获取上下文中的 keylessAccount 变量。
interface KeylessAccountContextType {
  keylessAccount: Account | null // 当前的 keyless 账户对象，可能为 null
  setKeylessAccount: (account: Account | null) => void // 用于更新 keyless 账户对象的函数
}

// 创建一个 React 上下文，用于在组件树中传递 keyless 账户信息。
const KeylessAccountContext = createContext<
  // createContext 函数用于创建一个上下文对象
  KeylessAccountContextType | undefined // 上下文的值类型可以是 KeylessAccountContextType 或者 undefined
>(undefined) // 初始值设置为 undefined

// KeylessAccountProvider 是一个 React 函数组件，它提供了一个上下文，用于管理 keyless 账户信息。
export const KeylessAccountProvider: React.FC<{
  // React.FC 是一个泛型，用于定义函数组件的类型
  children: React.ReactNode // children 是一个 ReactNode 类型的属性，表示组件的子元素
}> = ({ children }) => {
  const [keylessAccount, setKeylessAccount] = useState<Account | null>(null) // 使用 useState 钩子创建一个状态变量和更新函数

  return (
    <KeylessAccountContext.Provider // 使用 KeylessAccountContext.Provider 提供上下文值
      value={{ keylessAccount, setKeylessAccount }} // 提供的值是 keylessAccount 和 setKeylessAccount
    >
      {children}
    </KeylessAccountContext.Provider>
  )
}

// useKeylessAccount 是一个自定义的 React 钩子，用于在组件中获取 keyless 账户信息。
export const useKeylessAccount = () => {
  const context = useContext(KeylessAccountContext)
  console.log('content', context)
  if (!context) {
    throw new Error(
      'useKeylessAccount must be used within a KeylessAccountProvider'
    )
  }
  return context // 返回上下文信息
}

```

</details>

###### `src/hooks`

<summary>useEphemeralKeyPair.ts</summary>

`app/hooks/useEphemeralKeyPair.ts`

```tsx
import { EphemeralKeyPair } from '@aptos-labs/ts-sdk';

/**
 * Stored ephemeral key pairs in localStorage (nonce -> ephemeralKeyPair)
 */
export type StoredEphemeralKeyPairs = { [nonce: string]: EphemeralKeyPair };

/**
 * Retrieve the ephemeral key pair with the given nonce from localStorage.
 */
export const getLocalEphemeralKeyPair = (
  nonce: string,
): EphemeralKeyPair | null => {
  const keyPairs = getLocalEphemeralKeyPairs();

  // Get the account with the given nonce (the generated nonce of the ephemeral key pair may not match
  // the nonce in localStorage), so we need to validate it before returning it (implementation specific).
  const ephemeralKeyPair = keyPairs[nonce];
  if (!ephemeralKeyPair) return null;

  // If the account is valid, return it, otherwise remove it from the device and return null
  return validateEphemeralKeyPair(nonce, ephemeralKeyPair);
};

/**
 * Validate the ephemeral key pair with the given nonce and the expiry timestamp. If the nonce does not match
 * the generated nonce of the ephemeral key pair, the ephemeral key pair is removed from localStorage. This is
 * to validate that the nonce algorithm is the same (e.g. if the nonce algorithm changes).
 */
export const validateEphemeralKeyPair = (
  nonce: string,
  ephemeralKeyPair: EphemeralKeyPair,
): EphemeralKeyPair | null => {
  // Check the nonce and the expiry timestamp of the account to see if it is valid
  if (
    nonce === ephemeralKeyPair.nonce &&
    ephemeralKeyPair.expiryDateSecs > BigInt(Math.floor(Date.now() / 1000))
  ) {
    return ephemeralKeyPair;
  }
  removeEphemeralKeyPair(nonce);
  return null;
};

/**
 * Remove the ephemeral key pair with the given nonce from localStorage.
 */
export const removeEphemeralKeyPair = (nonce: string): void => {
  const keyPairs = getLocalEphemeralKeyPairs();
  delete keyPairs[nonce];
  localStorage.setItem(
    "ephemeral-key-pairs",
    encodeEphemeralKeyPairs(keyPairs),
  );
};

/**
 * Retrieve all ephemeral key pairs from localStorage and decode them. The new ephemeral key pair
 * is then stored in localStorage with the nonce as the key.
 */
export const storeEphemeralKeyPair = (
  ephemeralKeyPair: EphemeralKeyPair,
): void => {
  // Retrieve the current ephemeral key pairs from localStorage
  const accounts = getLocalEphemeralKeyPairs();

  // Store the new ephemeral key pair in localStorage
  accounts[ephemeralKeyPair.nonce] = ephemeralKeyPair;

  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(
    "ephemeral-key-pairs",
    encodeEphemeralKeyPairs(accounts),
  );
};

/**
 * Retrieve all ephemeral key pairs from localStorage and decode them.
 */
export const getLocalEphemeralKeyPairs = (): StoredEphemeralKeyPairs => {
  const rawEphemeralKeyPairs = typeof localStorage !== 'undefined' ? localStorage.getItem("ephemeral-key-pairs") : null;
  try {
    return rawEphemeralKeyPairs
      ? decodeEphemeralKeyPairs(rawEphemeralKeyPairs)
      : {};
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn(
      "Failed to decode ephemeral key pairs from localStorage",
      error,
    );
    return {};
  }
};

/**
 * Encoding for the EphemeralKeyPair class to be stored in localStorage
 */
const EphemeralKeyPairEncoding = {
  decode: (e: any) => EphemeralKeyPair.fromBytes(e.data),
  encode: (e: EphemeralKeyPair) => ({ __type: 'EphemeralKeyPair', data: e.bcsToBytes() }),
};

/**
 * Stringify the ephemeral key pairs to be stored in localStorage
 */
export const encodeEphemeralKeyPairs = (
  keyPairs: StoredEphemeralKeyPairs,
): string =>
  JSON.stringify(keyPairs, (_, e) => {
    if (typeof e === "bigint") return { __type: "bigint", value: e.toString() };
    if (e instanceof Uint8Array)
      return { __type: "Uint8Array", value: Array.from(e) };
    if (e instanceof EphemeralKeyPair)
      return EphemeralKeyPairEncoding.encode(e);
    return e;
  });

/**
 * Parse the ephemeral key pairs from a string
 */
export const decodeEphemeralKeyPairs = (
  encodedEphemeralKeyPairs: string,
): StoredEphemeralKeyPairs =>
  JSON.parse(encodedEphemeralKeyPairs, (_, e) => {
    if (e && e.__type === "bigint") return BigInt(e.value);
    if (e && e.__type === "Uint8Array") return new Uint8Array(e.value);
    if (e && e.__type === "EphemeralKeyPair")
      return EphemeralKeyPairEncoding.decode(e);
    return e;
  });

export default function useEphemeralKeyPair() {
  const ephemeralKeyPair = EphemeralKeyPair.generate();
  storeEphemeralKeyPair(ephemeralKeyPair);

  return ephemeralKeyPair;
}
```

</details>


###### `src/utils`

<details>
<summary>aptosClient.tsx</summary>
```tsx
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
 
export function getAptosClient() {
  // 或者 Network.DEVNET（确保你的网络在应用程序中保持一致）
  const config = new AptosConfig({ network: Network.TESTNET });
  return new Aptos(config);
}
```
</details>
