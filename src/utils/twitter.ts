import { RenameHistory } from '@/service/main/api/token-safety/types/twitter'

/**
 * Sort Twitter rename history by start date from newest to oldest
 * @param histories Array of rename histories to sort
 * @returns Sorted array
 */
export function sortRenameHistoriesByStartDate(histories: RenameHistory[]): RenameHistory[] {
  if (!histories || !histories.length) return []

  return [...histories].sort((a, b) => {
    // Convert to Date objects to ensure proper comparison
    const dateA = new Date(a.start_date || '')
    const dateB = new Date(b.start_date || '')
    // Sort descending (newest first)
    return dateB.getTime() - dateA.getTime()
  })
}

/**
 * Sort Twitter rename history by end date from newest to oldest
 * @param histories Array of rename histories to sort
 * @returns Sorted array
 */
export function sortRenameHistoriesByEndDate(histories: RenameHistory[]): RenameHistory[] {
  if (!histories || !histories.length) return []

  return [...histories].sort((a, b) => {
    // Convert to Date objects to ensure proper comparison
    const dateA = new Date(a.end_date || '')
    const dateB = new Date(b.end_date || '')
    // Sort descending (newest first)
    return dateB.getTime() - dateA.getTime()
  })
}

/**
 * Calculate how many times a Twitter account has changed its name
 * @param histories Array of rename histories
 * @returns Number of name changes
 */
export function countNameChanges(histories: RenameHistory[]): number {
  if (!histories) return 0
  // Subtract 1 because the initial name isn't a "change"
  return Math.max(0, histories.length - 1)
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
