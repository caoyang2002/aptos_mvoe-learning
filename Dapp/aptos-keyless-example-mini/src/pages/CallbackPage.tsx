import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useKeylessAccounts } from '../core/useKeylessAccounts'
// CallbackPage 组件用于处理从外部认证服务回调的页面
function CallbackPage() {
  // 使用 useRef 创建一个 ref 来跟踪组件是否正在加载
  const isLoading = useRef(false)
  // 从 useKeylessAccounts 钩子中获取 switchKeylessAccount 函数
  const switchKeylessAccount = useKeylessAccounts(
    (state) => state.switchKeylessAccount
  )
  // 使用 useNavigate 钩子获取导航函数
  const navigate = useNavigate()

  // 从 URL 的片段参数中获取 id_token
  const fragmentParams = new URLSearchParams(window.location.hash.substring(1))
  const idToken = fragmentParams.get('id_token')

  // 使用 useEffect 钩子来处理组件挂载后的逻辑
  useEffect(() => {
    // This is a workaround to prevent firing twice due to strict mode
    // 防止在严格模式下因组件渲染两次而触发两次
    if (isLoading.current) return
    isLoading.current = true

    // 定义一个异步函数来派生账户
    async function deriveAccount(idToken: string) {
      try {
        // 尝试切换到无密钥账户
        await switchKeylessAccount(idToken)
        // 导航到主页
        navigate('/home')
      } catch (error) {
        // 如果派生账户失败，导航到根路径
        navigate('/')
      }
    }

    // 如果没有 id_token，直接导航到根路径
    if (!idToken) {
      navigate('/')
      return
    }
    // 调用派生账户函数
    deriveAccount(idToken)
  }, [idToken, isLoading, navigate, switchKeylessAccount])

  // 返回一个加载中的 UI
  return (
    <div className="flex items-center justify-center h-screen w-screen">
      <div className="relative flex justify-center items-center border rounded-lg px-8 py-2 shadow-sm cursor-not-allowed tracking-wider">
        <span className="absolute flex h-3 w-3 -top-1 -right-1">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </span>
        Redirecting...
      </div>
    </div>
  )
}

export default CallbackPage
