export const storageUtil = () => {
    const prefix = 'xbuddy-';

    const getItem = (key: string) => {
        return localStorage.getItem(prefix + key);
    }

    const setItem = <T>(key: string, value: T) => {
        localStorage.setItem(prefix + key, JSON.stringify(value));
    }

    const removeItem = (key: string) => {
        localStorage.removeItem(prefix + key);
    }

    const getLanguageCode = () => {
        return getItem('language_code') || 'en';
    }

    const setLanguageCode = (languageCode: string) => {
        setItem('language_code', languageCode);
    }

    const getVolume = () => {
        return getItem('volume') || 1;
    }

    const setVolume = (volume: number) => {
        setItem('volume', volume);
    }

    return { getItem, setItem, removeItem, getLanguageCode, setLanguageCode, getVolume, setVolume };
}