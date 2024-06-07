import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useKeylessAccounts } from '../core/useKeylessAccounts'
import GoogleLogo from '../components/GoogleLogo'
import { collapseAddress } from '../core/utils'

function HomePage() {
  // 创建一个navigate函数，用于页面导航
  const navigate = useNavigate()
  // 从自定义钩子中获取当前活动账户和断开连接函数
  const { activeAccount, disconnectKeylessAccount } = useKeylessAccounts()
  // 使用useEffect钩子来监听activeAccount的变化
  useEffect(() => {
    // 如果没有活动账户，则导航到首页
    if (!activeAccount) navigate('/')
    // 依赖项为activeAccount和navigate
  }, [activeAccount, navigate])

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen px-4">
      <div>
        <h1 className="text-4xl font-bold mb-2">Welcome to Aptos!</h1>
        <p className="text-lg mb-8">You are now logged in</p>

        <div className="grid gap-2">
          {activeAccount ? (
            <div className="flex justify-center items-center border rounded-lg px-8 py-2 shadow-sm cursor-not-allowed">
              <GoogleLogo />
              {collapseAddress(activeAccount?.accountAddress.toString())}
            </div>
          ) : (
            <p>Not logged in</p>
          )}
          <button
            className="flex justify-center bg-red-50 items-center border border-red-200 rounded-lg px-8 py-2 shadow-sm shadow-red-300 hover:bg-red-100 active:scale-95 transition-all"
            onClick={disconnectKeylessAccount}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}
// 导出HomePage组件
export default HomePage
