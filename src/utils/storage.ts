interface Position {
    x: number
    y: number
}

export const storageUtil = () => {
    const prefix = 'xbuddy-';

    const getItem = <T>(key: string): T => {
        const item = localStorage.getItem(prefix + key);
        try {
            return item ? JSON.parse(item) : null;
        } catch (error) {
            return item as T;
        }
    }

    const setItem = <T>(key: string, value: T) => {
        try {
            const item = JSON.stringify(value);
            localStorage.setItem(prefix + key, item);
        } catch (error) {
            localStorage.setItem(prefix + key, `${value}`);
        }
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
        return getItem('volume');
    }

    const setVolume = (volume: number) => {
        setItem('volume', volume);
    }

    const getLive2DPosition = (initValue: Position) => {
        return (getItem<Position>('live2d_position') || initValue)
    }

    const setLive2DPosition = (position: Position) => {
        setItem('live2d_position', position);
    }

    return { getItem, setItem, removeItem, getLanguageCode, setLanguageCode, getVolume, setVolume, getLive2DPosition, setLive2DPosition };
}