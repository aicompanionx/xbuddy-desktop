import React from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { ThemeToggle } from '@/components/ui/theme-toggle'

const Layout: React.FC = () => {
  const location = useLocation()

  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <header className="border-b border-[hsl(var(--border))]">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Electron + React</h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 flex gap-6">
        <nav className="w-48 shrink-0">
          <ul className="space-y-2">
            <li>
              <Link
                to="/"
                className={`block px-3 py-2 rounded-md hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))] ${
                  isActive('/') ? 'bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]' : ''
                }`}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/vision"
                className={`block px-3 py-2 rounded-md hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))] ${
                  isActive('/vision') ? 'bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]' : ''
                }`}
              >
                AI Vision Control
              </Link>
            </li>
            <li>
              <Link
                to="/gui-agent"
                className={`block px-3 py-2 rounded-md hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))] ${
                  isActive('/gui-agent') ? 'bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]' : ''
                }`}
              >
                GUI Automation Agent
              </Link>
            </li>
            <li>
              <Link
                to="/live2d"
                className={`block px-3 py-2 rounded-md hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))] ${
                  isActive('/live2d') ? 'bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]' : '' 
                }`}
              >
                3D Model Demo
              </Link>
            </li>
          </ul>
        </nav>

        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
