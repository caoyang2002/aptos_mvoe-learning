import { GOOGLE_CLIENT_ID } from '../core/constants'
import useEphemeralKeyPair from '../core/useEphemeralKeyPair'
import GoogleLogo from '../components/GoogleLogo'

function LoginPage() {
  // 使用自定义钩子生成临时密钥对
  const ephemeralKeyPair = useEphemeralKeyPair()
  // 创建Google认证URL
  const redirectUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  // 创建URLSearchParams对象，用于构建查询参数
  const searchParams = new URLSearchParams({
    /**
     * Replace with your own client ID
     */
    // 替换为您的Google客户端ID
    client_id: GOOGLE_CLIENT_ID,

    /**
     * The redirect_uri must be registered in the Google Developer Console. This callback page
     * parses the id_token from the URL fragment and combines it with the ephemeral key pair to
     * derive the keyless account.
     *
     * window.location.origin == http://localhost:5173
     */
    //  重定向URI必须在Google开发者控制台中注册。此回调页面解析URL片段中的id_token，并将其与临时密钥对结合以派生无密钥账户。
    // window.location.origin == http://localhost:5173
    redirect_uri: `${window.location.origin}/callback`,
    /**
     * This uses the OpenID Connect implicit flow to return an id_token. This is recommended
     * for SPAs as it does not require a backend server.
     */
    // 使用OpenID Connect隐式流返回id_token。这对于单页应用(SPA)是推荐的，因为它不需要后端服务器。
    response_type: 'id_token',
    scope: 'openid email profile',
    nonce: ephemeralKeyPair.nonce,
  })
  // 在控制台打印Google客户端ID
  console.log('google-client-id', GOOGLE_CLIENT_ID)
  // 将查询参数添加到重定向URL
  redirectUrl.search = searchParams.toString()

  return (
    <div className="flex items-center justify-center h-screen w-screen px-4">
      <div>
        <h1 className="text-4xl font-bold mb-2">Welcome to Aptos</h1>
        <p className="text-lg mb-8">
          Sign in with your Google account to continue
        </p>
        <a
          href={redirectUrl.toString()}
          className="flex justify-center items-center border rounded-lg px-8 py-2 hover:bg-gray-100 hover:shadow-sm active:bg-gray-50 active:scale-95 transition-all"
        >
          <GoogleLogo />
          Sign in with Google
        </a>
      </div>
    </div>
  )
}
// 导出LoginPage组件
export default LoginPage
