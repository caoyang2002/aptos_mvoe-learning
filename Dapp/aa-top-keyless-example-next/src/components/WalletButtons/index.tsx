'use client'

import useEphemeralKeyPair from '@/hooks/useEphemeralKeyPair'
import { useKeylessAccount } from '@/context/KeylessAccountContext'
import GoogleLogo from '../GoogleLogo'

const aStyles =
  'border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30 nes-btn flex items-center justify-center md:gap-4 py-2 flex-nowrap whitespace-nowrap'

export default function WalletButtons() {
  const { keylessAccount, setKeylessAccount } = useKeylessAccount()
  const ephemeralKeyPair = useEphemeralKeyPair()
  console.log('临时密钥是：', ephemeralKeyPair.nonce)
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
            : process.env.NEXT_PUBLIC_URL) + '/callback',
    // 这使用了 OpenID Connect 隐式流返回 id_token。这对于单页应用(SPA)是推荐的，因为它不需要后端服务器。
    response_type: 'id_token',
    scope: 'openid email profile',
    nonce: ephemeralKeyPair.nonce,
  })
  redirectUrl.search = searchParams.toString()
  console.log('url is: ', searchParams.toString())
  const disconnect = () => {
    setKeylessAccount(null)
    // toast.success("Successfully disconnected account");
  }

  if (keylessAccount) {
    console.log('aptos address: ', keylessAccount.accountAddress.toString())
    return (
      <a className={aStyles} onClick={disconnect}>
        <GoogleLogo />
        <p>退出登陆</p>

        {/* <p>{keylessAccount.accountAddress.toString()}</p> */}
      </a>
    )
  }

  return (
    <>
      <a href={redirectUrl.toString()} className={aStyles}>
        <GoogleLogo />
        使用 Google 账户登陆
      </a>
    </>
  )
}
