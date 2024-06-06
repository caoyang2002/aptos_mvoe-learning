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
