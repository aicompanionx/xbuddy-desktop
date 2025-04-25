import { ipcMain } from 'electron'
import { News } from '@/components/news'

export const newsApi = {
  /**
   * Subscribe to news data events
   * @param callback Function to call when news data is received
   * @returns Function to unsubscribe
   */
  onNewsData: (callback: (data: News) => void) => {
    const listener = (_event: unknown, data: News) => callback(data)
    ipcMain.on('news-data', listener)
    return () => ipcMain.removeListener('news-data', listener)
  },
}
