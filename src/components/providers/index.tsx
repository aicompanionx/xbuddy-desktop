import React from 'react'
import { ThemeProvider } from '@/components/ui/theme-provider'
import { ReactQueryProvider } from './react-query-provider'

export const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ReactQueryProvider>
      <ThemeProvider defaultTheme="system" storageKey="electron-theme">
        {children}
      </ThemeProvider>
    </ReactQueryProvider>
  )
}
