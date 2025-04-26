import React from 'react'
import { ThemeProvider } from '@/components/ui/theme-provider'
import { ReactQueryProvider } from './react-query-provider'
import { useIgnoreClick } from '@/hooks/use-ignore-click'
import { AlertProvider } from '@/contexts/alert-context'
import { I18nProvider } from '@/contexts/i18n-context'
import { useAppSystem } from '@/hooks/use-system-setting'

import '@/utils/i18n'

export const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useIgnoreClick()
  useAppSystem()

  return (
    <ReactQueryProvider>
      <ThemeProvider defaultTheme="system" storageKey="electron-theme">
        <I18nProvider>
          <AlertProvider>{children}</AlertProvider>
        </I18nProvider>
      </ThemeProvider>
    </ReactQueryProvider>
  )
}
