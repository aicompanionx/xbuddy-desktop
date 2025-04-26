import { FC, useMemo } from 'react'
import { format } from 'date-fns'
import { cn } from '@/utils'

/**
 * News interface from backend API
 */
export interface News {
  abstract: string
  cover_img: string
  id?: number
  news_url: string
  origin_url: string
  published_at: number
  sort_id: number // 1: Flash news, 2: Long article
  source_id: string
  source_name: string
  source_type: number // 5: Daily Planet, 6: BlockBeats
  title: string
  type?: number
}

interface NewsItemProps {
  news: News
  className?: string
  onClick?: () => void
}

export const NewsItem: FC<NewsItemProps> = ({ news, className, onClick }) => {
  const { title, abstract, cover_img, published_at, source_name, sort_id, news_url, origin_url } = news

  // Format the timestamp to a readable date
  const formattedDate = useMemo(() => {
    try {
      return format(published_at * 1000, 'MMMM dd, yyyy HH:mm')
    } catch (error) {
      return 'Unknown date'
    }
  }, [published_at])

  // Determine source display name
  const sourceDisplay = useMemo(() => {
    const sourceMapping: Record<string, string> = {
      odaily: 'Daily Planet',
      theblockbeats: 'BlockBeats',
    }
    return sourceMapping[source_name] || source_name
  }, [source_name])

  // Determine if it's a flash news or long article
  const isFlashNews = sort_id === 1

  return (
    <div
      className={cn(
        'rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 transition-shadow hover:shadow-md',
        className,
      )}
      onClick={onClick}
    >
      <div className="flex flex-col h-full">
        {/* Cover image (if available) */}
        {cover_img && (
          <div className="relative aspect-video w-full overflow-hidden">
            <img src={cover_img} alt={title} className="absolute inset-0 w-full h-full object-cover" />
            {isFlashNews && (
              <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">Flash News</div>
            )}
          </div>
        )}

        <div className="p-4 flex-1 flex flex-col">
          {/* Title */}
          <h3 className="text-md font-semibold mb-2 line-clamp-2">{title}</h3>

          {/* Abstract */}
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 flex-1">{abstract}</p>

          {/* Footer with metadata */}
          <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mt-auto">
            <div className="flex items-center">
              <span>{sourceDisplay}</span>
              <span className="mx-2">•</span>
              <span>{formattedDate}</span>
            </div>

            {news_url && (
              <a
                href={news_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700 dark:text-blue-400"
                onClick={(e) => e.stopPropagation()}
              >
                Read more
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewsItem
