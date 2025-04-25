import { ComponentType } from 'react'
import Home from '@/pages/home'
import NotFound from '@/pages/not-found'
import Live2DPage from '@/pages/live2d'
import NewsPage from '@/pages/news'

/**
 * Route item interface definition
 */
export interface RouteItem {
  // Route path
  path: string
  // Route component
  component: ComponentType<unknown>
  // Display name in navigation menu (if not set, won't show in nav menu)
  title?: string
  // Child routes
  children?: RouteItem[]
  // Whether this is an index route
  index?: boolean
  // Whether to hide in navigation menu
  hideInMenu?: boolean
  // Icon name (if needed)
  icon?: string
}

/**
 * Application route configuration
 */
export const routes: RouteItem[] = [
  {
    path: '/',
    component: Home,
    title: 'Home',
    index: true,
  },
  {
    path: '/live2d',
    component: Live2DPage,
    hideInMenu: true,
  },
  {
    path: '/news',
    component: NewsPage,
    hideInMenu: true,
  },
  {
    path: '*',
    component: NotFound,
    hideInMenu: true,
  },
]

export default routes
