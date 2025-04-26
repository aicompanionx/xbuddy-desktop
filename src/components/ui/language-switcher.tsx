import React from 'react'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/contexts/i18n-context'
import { useTranslation } from 'react-i18next'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { IoLanguage } from 'react-icons/io5'

export const LanguageSwitcher: React.FC = () => {
  const { language, changeLanguage } = useI18n()
  const { t } = useTranslation()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" aria-label={t('settings.language')}>
          <IoLanguage className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem className={language === 'en' ? 'bg-accent' : ''} onClick={() => changeLanguage('en')}>
          English
        </DropdownMenuItem>
        <DropdownMenuItem className={language === 'zh' ? 'bg-accent' : ''} onClick={() => changeLanguage('zh')}>
          中文
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
