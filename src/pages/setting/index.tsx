import { useAppSystem } from '@/hooks/use-system-setting'
import { useTranslation } from 'react-i18next'

export default function SettingPage() {
  const { t, i18n } = useTranslation()

  const language = i18n.language[0]

  const { changeLanguage } = useAppSystem()

  return (
    <div className="h-full p-6">
      <div className="max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6">{t('settings.title')}</h2>

        <div className="bg-card rounded-lg shadow-sm p-4">
          <h3 className="text-lg font-medium mb-4">{t('settings.language')}</h3>

          <div className="flex flex-col space-y-2">
            <label className="inline-flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="language"
                value="en"
                checked={language === 'e'}
                onChange={() => changeLanguage('en')}
                className="radio"
              />
              <span>English</span>
            </label>

            <label className="inline-flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="language"
                value="zh"
                checked={language === 'z'}
                onChange={() => changeLanguage('zh')}
                className="radio"
              />
              <span>中文</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
