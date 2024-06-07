import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import HomePage from './pages/HomePage.tsx'
import LoginPage from './pages/LoginPage.tsx'
import CallbackPage from './pages/CallbackPage.tsx'

import './index.css'

// 创建一个路由配置对象，定义了应用的导航结构
const router = createBrowserRouter([
  {
    // 定义根路径的路由
    path: '/',
    // 当访问根路径时，渲染LoginPage组件
    element: <LoginPage />,
  },
  {
    // 定义回调路径的路由
    path: '/callback',
    // 当访问回调路径时，渲染CallbackPage组件
    element: <CallbackPage />,
  },
  {
    // 定义主页路径的路由
    path: '/home',
    // 当访问主页路径时，渲染HomePage组件
    element: <HomePage />,
  },
])
// 使用ReactDOM.createRoot方法创建一个根容器，并将它挂载到id为"root"的DOM元素上
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* 启用React的严格模式，用于提供额外的检查和警告 */}
    <RouterProvider router={router} />
    {/* 使用RouterProvider组件，将之前定义的路由配置传递给React Router */}
  </React.StrictMode>
)
