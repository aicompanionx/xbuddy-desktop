import { storageUtil } from "@/utils/storage"
import { useEffect } from "react"
import { useTranslation } from "react-i18next"

let languageCode: string

export const useAppSystem = () => {
    const { i18n } = useTranslation()
    const { getLanguageCode, setLanguageCode } = storageUtil()

    const changeLanguage = (language: string) => {
        languageCode = language
        i18n.changeLanguage(language)
        setLanguageCode(language)
        window.electronAPI.sendMessageToAllWindows('change-language', language)
    }

    useEffect(() => {
        window.electronAPI.onWindowMessage('change-language', (language: string) => {
            if (language !== languageCode) {
                changeLanguage(language)
            }
        })
        changeLanguage(getLanguageCode() as string)
    }, [])

    return {
        changeLanguage,
    }
}