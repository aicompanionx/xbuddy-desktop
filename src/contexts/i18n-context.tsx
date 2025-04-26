import React, { createContext, useState, useContext, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

type Language = 'en' | 'zh'

interface I18nContextProps {
  language: Language
  changeLanguage: (lang: Language) => void
}

const I18nContext = createContext<I18nContextProps | undefined>(undefined)

export const useI18n = () => {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}

interface I18nProviderProps {
  children: React.ReactNode
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const { i18n: i18nInstance } = useTranslation()
  const [language, setLanguage] = useState<Language>(
    (localStorage.getItem('i18nextLng')?.substring(0, 2) as Language) || 'en',
  )

  const changeLanguage = (lang: Language) => {
    i18nInstance.changeLanguage(lang)
    setLanguage(lang)
  }

  useEffect(() => {
    setLanguage((i18nInstance.language?.substring(0, 2) as Language) || 'en')
  }, [i18nInstance.language])

  return <I18nContext.Provider value={{ language, changeLanguage }}>{children}</I18nContext.Provider>
}
