import { UrlSafetyResult } from '@/service/preload/url-safety-api'
import { xbuddyClient } from './api-client'
import { StorageService } from './storage-service'

// Create persistent storage for URL safety results
const urlSafetyStorage = new StorageService('url-safety-cache')

// Cache validity period (24 hours)
const CACHE_MAX_AGE = 24 * 60 * 60 * 1000

/**
 * Check URL safety
 * @param url URL to check
 * @param forceRefresh Whether to force refresh the cache
 * @returns Safety check result
 */
export const checkUrlSafety = async (url: string, forceRefresh = false, lang = 'en'): Promise<UrlSafetyResult> => {
  const message = urlSafetyStorage.get<UrlSafetyResult>(url)?.message
  // First check persistent cache (if not forcing refresh)
  if (!forceRefresh && urlSafetyStorage.has(url) && !!message) {
    const cachedResult = urlSafetyStorage.get<UrlSafetyResult>(url)
    console.log('cachedResult', cachedResult)

    // Check if cache entry is still valid (not older than 24 hours)
    const now = Date.now()
    const cacheAge = now - (cachedResult?.timestamp || 0)

    if (cachedResult && cacheAge < CACHE_MAX_AGE) {
      return cachedResult
    }
  }

  let result: UrlSafetyResult
  try {
    // Call safety API service
    const response = await xbuddyClient.post<UrlSafetyResult>('/check-phishing', {
      url,
      lang,
    })

    console.log('response', response.data)

    // Create result object
    result = {
      url: response.data?.url || url,
      isPhishing: response.data?.isPhishing || false,
      message: response.data?.message,
      timestamp: Date.now(),
    }

    // Store in persistent cache
    urlSafetyStorage.set(url, result)

    return result
  } catch (error) {
    console.error('Error checking URL safety:', error)
    result = {
      url,
      isPhishing: false,
      message: null,
      timestamp: Date.now(),
    }

    // Also cache error results
    urlSafetyStorage.set(url, result)

    return result
  }
}

/**
 * Batch check multiple URLs for safety
 * @param urls Array of URLs to check
 * @param forceRefresh Whether to force refresh the cache
 * @param batchSize Batch processing size
 * @returns Object mapping URLs to safety check results
 */
export const checkMultipleUrls = async (
  urls: string[],
  forceRefresh = false,
  batchSize = 5,
): Promise<Record<string, UrlSafetyResult>> => {
  const results: Record<string, UrlSafetyResult> = {}

  // Process URLs in batches to avoid overwhelming the API
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize)
    const batchPromises = batch.map((url) => checkUrlSafety(url, forceRefresh))

    const batchResults = await Promise.all(batchPromises)

    batch.forEach((url, index) => {
      results[url] = batchResults[index]
    })
  }

  return results
}

/**
 * Clear URL safety cache
 */
export const clearUrlSafetyCache = (): void => {
  urlSafetyStorage.clear()
}

/**
 * Get all cached safety results
 * @returns Object containing all cached results
 */
export const getAllSafetyResults = (): Record<string, UrlSafetyResult> => {
  return urlSafetyStorage.getAll<UrlSafetyResult>()
}

/**
 * Remove safety result for a specific URL from cache
 * @param url URL to remove
 * @returns Whether deletion was successful
 */
export const removeUrlFromCache = (url: string): boolean => {
  return urlSafetyStorage.delete(url)
}

// Export functions using xbuddyClient
export const safetyApi = {
  checkUrlSafety,
  checkMultipleUrls,
  clearCache: clearUrlSafetyCache,
  getAllResults: getAllSafetyResults,
  removeUrlFromCache,
}
