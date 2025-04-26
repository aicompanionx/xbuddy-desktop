import { useState, useEffect } from 'react'
import { NewsDetail, News } from '@/pages/news/components'

const NewsPage = () => {
  const [news, setNews] = useState<News | null>(null)

  useEffect(() => {
    // Listen for news data sent from the main window
    const unsubscribe = window.electronAPI.onWindowMessage('news-data', (newsData) => {
      if (newsData) {
        setNews(newsData as News)
      }
    })

    // Cleanup listener when component unmounts
    return () => {
      unsubscribe()
    }
  }, [])

  if (!news) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-900 h-screen overflow-y-auto p-6">
      <NewsDetail news={news} />
    </div>
  )
}

export default NewsPage
