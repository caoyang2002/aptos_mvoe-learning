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
