'use client' // 确保以下代码只在客户端执行
// import { KeylessAccountProvider } from '@/context/KeylessAccountContext'
// import { useKeylessAccount } from '@/context/KeylessAccountContext' // 从上下文文件导入 useKeylessAccount 钩子

import { jwtDecode } from 'jwt-decode'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { getLocalEphemeralKeyPair } from '@/hooks/useEphemeralKeyPair'
import { getAptosClient } from '@/utils/aptosClient'
import { useKeylessAccount } from '@/context/KeylessAccountContext'
import { EphemeralKeyPair, Account } from '@aptos-labs/ts-sdk'

const parseJWTFromURL = (url: string): string | null => {
  const urlObject = new URL(url)
  const fragment = urlObject.hash.substring(1)
  const params = new URLSearchParams(fragment)

  return params.get('id_token')
}

const CallbackPage = () => {
  const { setKeylessAccount } = useKeylessAccount()
  const { push } = useRouter()
  const [jwt, setJwt] = useState<string | null>(null)

  useEffect(() => {
    // 仅在客户端执行
    const jwtFromURL = parseJWTFromURL(window.location.href)
    if (jwtFromURL) {
      setJwt(jwtFromURL)
      const payload = jwtDecode<{ nonce: string }>(jwtFromURL)
      const jwtNonce = payload.nonce
      const ephemeralKeyPair = getLocalEphemeralKeyPair(jwtNonce)

      const createKeylessAccount = async () => {
        const aptosClient = getAptosClient()
        const keylessAccount = await aptosClient.deriveKeylessAccount({
          jwt: jwtFromURL,
          ephemeralKeyPair,
        })

        const accountCoinsData = await aptosClient.getAccountCoinsData({
          accountAddress: keylessAccount.accountAddress.toString(),
        })
        // 账户尚不存在 -> 为其注资
        if (accountCoinsData.length === 0) {
          try {
            await aptosClient.fundAccount({
              accountAddress: keylessAccount.accountAddress,
              amount: 200000000, // faucet 2 APT to create the account
            })
          } catch (error) {
            console.error('Error funding account:', error)
          }
        }

        console.log(
          'Keyless Account:',
          keylessAccount.accountAddress.toString()
        )
        setKeylessAccount(keylessAccount)
        push('/') // 重定向到主页或其他页面
      }

      createKeylessAccount()
    }
  }, [push]) // 依赖数组中的push确保useEffect仅在组件挂载时运行一次
  // const { keylessAccount } = useKeylessAccount()
  return (
    <div>
      <h1>Callback</h1>
      <p>
        {/* <KeylessAccountProvider> */}
        {/* Address: {keylessAccount.address}, Balance: {keylessAccount.balance} */}
        {/* </KeylessAccountProvider> */}
      </p>
    </div>
  )
}

export default CallbackPage
