import React from 'react'
import { ThemeProvider } from '@/components/ui/theme-provider'
import { ReactQueryProvider } from './react-query-provider'
import { useIgnoreClick } from '@/hooks/use-ignore-click'
import { AlertProvider } from '@/contexts/alert-context'

export const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useIgnoreClick()

  return (
    <ReactQueryProvider>
      <ThemeProvider defaultTheme="system" storageKey="electron-theme">
        <AlertProvider>{children}</AlertProvider>
      </ThemeProvider>
    </ReactQueryProvider>
  )
}
