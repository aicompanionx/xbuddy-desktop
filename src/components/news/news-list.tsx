import { FC } from 'react'
import { NewsItem, News } from './news-item'
import { cn } from '@/utils'

interface NewsListProps {
  newsList: News[]
  className?: string
  onNewsClick?: (news: News) => void
  emptyMessage?: string
}

export const NewsList: FC<NewsListProps> = ({
  newsList,
  className,
  onNewsClick,
  emptyMessage = 'No news available',
}) => {
  if (!newsList || newsList.length === 0) {
    return <div className={cn('flex items-center justify-center p-8 text-gray-500', className)}>{emptyMessage}</div>
  }

  return (
    <div className={cn('grid gap-4', className)}>
      {newsList.map((news) => (
        <NewsItem
          key={news.id || `${news.source_id}-${news.published_at}`}
          news={news}
          onClick={() => onNewsClick?.(news)}
        />
      ))}
    </div>
  )
}

export default NewsList
