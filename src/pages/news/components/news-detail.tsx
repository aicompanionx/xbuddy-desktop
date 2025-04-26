import { FC, useMemo } from 'react'
import { format } from 'date-fns'
import { ExternalLink } from 'lucide-react'
import { News } from './news-item'
import { cn } from '@/utils'

interface NewsDetailProps {
  news: News
  className?: string
}

export const NewsDetail: FC<NewsDetailProps> = ({ news, className }) => {
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

  // Content type label
  const contentTypeLabel = sort_id === 1 ? 'Flash News' : 'Article'

  return (
    <article className={cn('max-w-4xl mx-auto', className)}>
      {/* Header */}
      <header className="mb-8">
        <h1 className="!text-2xl font-bold mb-4">{title}</h1>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">{sourceDisplay}</span>
            <span className="mx-2">•</span>
            <span>{formattedDate}</span>
            <span className="mx-2">•</span>
            <span className="px-2 py-0.5 text-xs rounded bg-gray-200 dark:bg-gray-700">{contentTypeLabel}</span>
          </div>

          {origin_url && (
            <a
              href={origin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-sm text-blue-500 hover:text-blue-600"
            >
              <span>Original Source</span>
              <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          )}
        </div>
      </header>

      {/* Cover Image */}
      {cover_img && (
        <div className="mb-8 rounded-lg overflow-hidden">
          <img src={cover_img} alt={title} className="w-full h-auto object-cover max-h-96" />
        </div>
      )}

      {/* Content */}
      <div className="text-gray-800 dark:text-gray-200">
        <div className="prose dark:prose-invert max-w-none">
          <p className="abstract" dangerouslySetInnerHTML={{ __html: abstract }}></p>
        </div>
      </div>

      {/* Footer */}
      {news_url && (
        <footer className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <a
              href={news_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-sm text-blue-500 hover:text-blue-600"
            >
              <span>View Full Article</span>
              <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </div>
        </footer>
      )}
    </article>
  )
}

export default NewsDetail
