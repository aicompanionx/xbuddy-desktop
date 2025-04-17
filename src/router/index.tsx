import React from 'react'
import { Routes, Route, HashRouter, Navigate } from 'react-router-dom'
import Layout from '@/components/layout/layout'
import { routes } from './routes'
import { useAppStore } from '@/store/app'
import Live2DPage from '@/pages/live2d'

const Router: React.FC = () => {
  const { selectedWindow } = useAppStore()

  return (
    <HashRouter>
      <Routes>
        {/* Live2D路由单独处理，不使用Layout */}
        <Route path="/live2d" element={<Live2DPage />} />
        
        {/* 其他路由使用Layout包装 */}
        <Route path="/" element={<Layout />}>
          {routes.map((route) => {
            const RouteComponent = route.component

            // 跳过已经单独处理的live2d路由
            if (route.path === '/live2d') {
              return null
            }

            if (route.index) {
              // For home page, display directly
              return <Route key={route.path} index element={<RouteComponent />} />
            } else {
              // For other non-home pages, check if we need to display
              return (
                <Route
                  key={route.path}
                  path={route.path}
                  element={selectedWindow ? <RouteComponent /> : <Navigate to="/" replace />}
                />
              )
            }
          })}
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default Router

export { routes }
