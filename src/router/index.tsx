import React from 'react'
import { Routes, Route, HashRouter, Navigate } from 'react-router-dom'
import Layout from '@/components/layout/layout'
import { routes } from './routes'
import { useAppStore } from '@/store/app'
import Live2DPage from '@/pages/live2d'
import NewsPage from '@/pages/news'

const Router: React.FC = () => {
  const { selectedWindow } = useAppStore()

  return (
    <HashRouter>
      <Routes>
        <Route path="/live2d" element={<Live2DPage />} />
        <Route path="/news" element={<NewsPage />} />

        <Route path="/" element={<Layout />}>
          {routes.map((route) => {
            const RouteComponent = route.component

            if (route.path === '/live2d') {
              return null
            }

            if (route.index) {
              return <Route key={route.path} index element={<RouteComponent />} />
            } else {
              return <Route key={route.path} path={route.path} element={<RouteComponent />} />
            }
          })}
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default Router

export { routes }
