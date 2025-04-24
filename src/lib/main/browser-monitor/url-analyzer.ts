import { BrowserWindow } from 'electron'
import { safetyApi } from '../api/safety-api'
import { tokenSafetyApi } from '../api/token-safety'
import { analyzeUrl } from '@/lib/utils/url-analyse'
import { TokenAnalysis } from '../api/token-safety/types/token'
import { isTwitterProfilePage } from '@/utils'

// Track analyzed URLs to prevent duplicate analysis
const analyzedUrls = new Set<string>()

/**
 * Check if URL should be analyzed
 * @param url URL to check
 * @returns True if URL should be analyzed
 */
export const shouldAnalyzeUrl = (url: string): boolean => {
  // Skip about:, chrome:, edge:, file: and empty URLs
  if (
    !url ||
    url.startsWith('about:') ||
    url.startsWith('chrome:') ||
    url.startsWith('edge:') ||
    url.startsWith('file:') ||
    url.startsWith('devtools:')
  ) {
    return false
  }

  // Skip URLs that have already been analyzed recently
  if (analyzedUrls.has(url)) {
    return false
  }

  return true
}

const addAnalyzedUrl = (url: string): void => {
  analyzedUrls.add(url)

  // Limit the size of the analyzed URLs set to prevent memory leaks
  if (analyzedUrls.size > 1000) {
    const iterator = analyzedUrls.values()
    analyzedUrls.delete(iterator.next().value)
  }

  // Auto-clear URL from analyzed set after some time
  setTimeout(() => {
    analyzedUrls.delete(url)
  }, 60 * 60 * 1000) // Remove after 1 hour to allow re-analysis
}

/**
 * Analyze URL for phishing
 * @param url URL to analyze
 * @param mainWindow Main window reference
 */
export const analyzeUrlForPhishing = async (url: string, mainWindow: BrowserWindow | null): Promise<void> => {
  try {
    addAnalyzedUrl(url)

    // Directly check URL safety using the safety API
    console.log(`Analyzing active URL for phishing: ${url}`)
    const result = await safetyApi.checkUrlSafety(url)

    // If there's a main window, inform it about the check result
    if (mainWindow && !mainWindow.isDestroyed()) {
      const res = {
        url: url,
        isPhishing: result.isPhishing,
        message: result.message,
        timestamp: Date.now(),
      }
      mainWindow.webContents.send('unsafe-url-detected', res)
    }
  } catch (error) {
    console.error('Error analyzing URL for phishing:', error)
  }
}

/**
 * Analyze URL for token safety
 * @param url URL to analyze
 * @param mainWindow Main window reference
 */
export const analyzeUrlForToken = async (url: string, mainWindow: BrowserWindow | null): Promise<void> => {
  addAnalyzedUrl(url)
  console.log(`Analyzing active URL for token safety: ${url}`)

  let tokenAnalysis: TokenAnalysis | null = null
  try {
    if (url.includes('x.com') || url.includes('twitter.com')) {
      // Only analyze Twitter profile pages, not other Twitter pages
      if (isTwitterProfilePage(url)) {
        tokenAnalysis = await tokenSafetyApi.tokenAnalysisByTwitter({
          url: url,
          lang: 'en',
        })
      } else {
        console.log('Not a Twitter profile page, skipping analysis')
        return
      }
    } else {
      // Extract and normalize chain name from URL
      const { chain, tokenAddress } = analyzeUrl(url)

      console.log('chain & tokenAddress', chain, tokenAddress)

      if (!chain || !tokenAddress) {
        console.log('Invalid chain or token address')
        return
      }

      let CA: string | null = null
      if (url.includes('dexscreener.com')) {
        try {
          const result = await tokenSafetyApi.getTokenByPool(chain, tokenAddress)
          CA = result.token.ca
        } catch (error) {
          console.error('Error analyzing URL for token safety:', error)
        }
      }

      tokenAnalysis = await tokenSafetyApi.tokenAnalysisByToken({ ca: CA || tokenAddress, chain })
    }

    console.log('result', tokenAnalysis)

    // Send check result to renderer if main window exists
    if (mainWindow && !mainWindow.isDestroyed() && tokenAnalysis) {
      mainWindow.webContents.send('token-safety-detected', tokenAnalysis)
    }
  } catch (error) {
    console.error('Error analyzing URL for token safety:', error)
  }
}

/**
 * Clear the analyzed URLs set
 */
export const clearAnalyzedUrls = (): void => {
  analyzedUrls.clear()
}
