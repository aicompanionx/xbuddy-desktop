import { RenameHistory } from '@/service/main/api/token-safety/types/twitter'
import { sortRenameHistoriesByEndDate, sortRenameHistoriesByStartDate } from './time'

export interface RenameEvent {
  date: string // 2025-04-05
  from: string // hellodoge
  to: string // SkyAI
}

/**
 * Get the latest rename history
 *
 * Rules:
 *  - If end_date is empty → It is considered that it is currently in use, return directly
 *  - Otherwise: Return the latest record by end_date
 *  - At the same time, name must be equal to the current name
 */
export const getLatestRenameHistory = (
  histories: readonly RenameHistory[] = [],
  currentName?: string,
): RenameHistory | undefined => {
  if (!histories.length) return

  // 1) The name that is currently in use
  const ongoing = histories.find((h) => !h.end_date && h.name === currentName)
  if (ongoing) return ongoing

  // 2) The latest record by end_date
  return sortRenameHistoriesByEndDate(histories).find((h) => h.name === currentName)
}

export const buildRenameEvents = (histories: readonly RenameHistory[] = [], currentName = ''): RenameEvent[] => {
  // Sort by start_date in descending order
  const sorted = sortRenameHistoriesByStartDate(histories)

  /**
   *   sorted: [H0, H1, H2, ...]
   *   Display: H0.name ← H1.name
   *            H1.name ← H2.name
   *            ...
   *   The last one's "to" points to currentName
   */
  return sorted.map((h, idx) => ({
    date: h.start_date ?? '',
    from: sorted[idx + 1]?.name ?? currentName,
    to: h.name ?? '',
  }))
}

/**
 * Check if the URL is a Twitter/X profile page
 * Ensures we only analyze profile pages, not other Twitter pages like home, explore, etc.
 */
export const isTwitterProfilePage = (url: string): boolean => {
  try {
    const urlObj = new URL(url)

    // Check if it's Twitter/X domain
    if (!urlObj.hostname.includes('x.com') && !urlObj.hostname.includes('twitter.com')) {
      return false
    }

    // Get the path without leading slash
    const path = urlObj.pathname.replace(/^\//, '')

    // Reserved paths that are not user profiles
    const reservedPaths = [
      'home',
      'explore',
      'notifications',
      'messages',
      'i',
      'settings',
      'compose',
      'search',
      'bookmarks',
      'lists',
      'communities',
      'premium',
    ]

    // Valid profile path should:
    // 1. Not be empty
    // 2. Not be a reserved path
    // 3. Not contain additional segments (e.g., /username/status/...)
    return (
      path !== '' && !reservedPaths.includes(path.toLowerCase()) && !path.includes('/') // No additional path segments
    )
  } catch (error) {
    console.error('Error parsing Twitter URL:', error)
    return false
  }
}
