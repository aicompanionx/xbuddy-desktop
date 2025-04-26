import * as i18nextModule from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import enTranslation from '../locales/en.json'
import zhTranslation from '../locales/zh.json'

const resources = {
    en: {
        translation: enTranslation
    },
    zh: {
        translation: zhTranslation
    }
}

const i18n = i18nextModule.default
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        debug: process.env.NODE_ENV === 'development',
        interpolation: {
            escapeValue: false // 不转义特殊字符
        },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage']
        }
    })

export default i18n 