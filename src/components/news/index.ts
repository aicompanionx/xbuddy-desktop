import { News } from './news-item'
export { default as NewsItem } from './news-item'
export { default as NewsList } from './news-list'
export { default as NewsDetail } from './news-detail'
export type { News }

// Helper function to mock news data for development and testing
export const mockNewsData = (count = 5): News[] => {
  return Array.from({ length: count }).map((_, index) => ({
    id: index,
    title: `Sample News Titel ${index + 1}`,
    abstract: `This is a sample abstract for news item ${
      index + 1
    }. It provides a brief summary of what the news article is about.`,
    cover_img: `https://picsum.photos/seed/${index}/800/400`,
    news_url: 'https://example.com/news',
    origin_url: 'https://example.com/original',
    published_at: Math.floor(Date.now() / 1000) - index * 86400, // Current time minus days
    sort_id: index % 2 === 0 ? 1 : 2, // Alternate between flash news and article
    source_id: `source-${index}`,
    source_name: index % 2 === 0 ? 'odaily' : 'theblockbeats',
    source_type: index % 2 === 0 ? 5 : 6,
    type: 2,
  }))
}
