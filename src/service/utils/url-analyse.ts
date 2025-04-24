import { normalizeChainName } from './chains'

/**
 * Extract chain name and token address from URL
 * @param url URL to analyze
 * @returns Object containing chain name and token address
 */
export const analyzeUrl = (url: string): { chain: string | null; tokenAddress: string | null } => {
  try {
    if (!url) {
      return { chain: null, tokenAddress: null }
    }

    const lowerUrl = url.toLowerCase()

    // Parse dexscreener URLs: https://dexscreener.com/ethereum/0x52c77b0cb827afbad022e6d6caf2c44452edbc39
    if (lowerUrl.includes('dexscreener.com')) {
      const urlObj = new URL(url)
      const pathParts = urlObj.pathname.split('/').filter(Boolean) // Remove empty strings

      // Expected format: pathParts[0] is chain, pathParts[1] is token address
      if (pathParts.length >= 2) {
        return {
          chain: normalizeChainName(pathParts[0]),
          tokenAddress: pathParts[1],
        }
      }

      return { chain: null, tokenAddress: null }
    }

    // Parse gmgn URLs: https://gmgn.ai/sol/token/AZVYJLknu1vyV7vyzVa8to8MX2P92KD7tM59zN39PUMP
    if (lowerUrl.includes('gmgn.ai')) {
      const urlObj = new URL(url)
      const pathParts = urlObj.pathname.split('/').filter(Boolean) // Remove empty strings

      // Expected format: pathParts[0] is chain, pathParts[1] is "token", pathParts[2] is token address
      if (pathParts.length >= 3 && pathParts[1].toLowerCase() === 'token') {
        return {
          chain: normalizeChainName(pathParts[0]),
          tokenAddress: pathParts[2],
        }
      }
    }

    // Default fallback: try to extract any token address pattern
    const ethAddressMatch = url.match(/0x[a-fA-F0-9]{40}/)
    const solAddressMatch = url.match(/[1-9A-HJ-NP-Za-km-z]{32,44}/)

    const tokenAddress = ethAddressMatch ? ethAddressMatch[0] : solAddressMatch ? solAddressMatch[0] : null

    return {
      chain: null,
      tokenAddress,
    }
  } catch (error) {
    console.error('Error analyzing URL:', error)
    return { chain: null, tokenAddress: null }
  }
}
