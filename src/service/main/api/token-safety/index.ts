import { xbuddyClient } from '../api-client'
import {
  type TokenSafetyProps,
  type TokenSafetyResultWithSol,
  type TokenSafetyreq,
  type TokenSafetyResult,
  type GetTwitterByCARes,
  type TokenAnalysis,
  type TokenByPoolResult,
  type TokenDetailByCARes,
  type TokenDetailsByCAReq,
} from './types/token'
import { transformRisks, transformSolRisks } from '@/service/utils/chains'
import {
  type TwitterAccountInfo,
  type TwitterInfoReq,
  type TwitterRenameRes,
  type TwitterStatusRes,
} from './types/twitter'

export const tokenSafetyApi = {
  checkTokenSafety: async (ca: string, chain?: string, lang = 'en'): Promise<TokenSafetyProps | null> => {
    let res: TokenSafetyProps | null = null

    try {
      if (chain !== 'solana') {
        // Check token safety
        const req: TokenSafetyreq = { ca, chain, lang }
        const response = await xbuddyClient.post<TokenSafetyResult>('/api/token/check', req)
        const result = response.data

        // Transform risks to standardized format
        res = transformRisks(result)
      } else {
        // Check SOL token safety
        const req = { ca }
        const response = await xbuddyClient.post<TokenSafetyResultWithSol>('/api/token/check-sol', req)
        const result = response.data

        // Transform SOL risks to standardized format
        res = transformSolRisks(result)
      }

      console.log('tokenSafety', res)

      return res
    } catch (error) {
      console.error('Error checking token safety:', error)
      return null
    }
  },
  twitterInfo: async (req: TwitterInfoReq): Promise<TwitterAccountInfo | null> => {
    const statusResponse = await xbuddyClient.post<TwitterStatusRes>('/api/twitter/stat', req)
    const renameResponse = await xbuddyClient.post<TwitterRenameRes>('/api/twitter/rename', req)

    const result: TwitterAccountInfo = {
      twitter_status: statusResponse.data,
      twitter_rename_record: renameResponse.data,
    }

    return result
  },
  getTwitterByCA: async (ca: string): Promise<{ twitter_name?: string } | null> => {
    const twitterName = await xbuddyClient.post<{ twitter_name?: string }>('/api/token/twitter-by-ca', { ca })
    if (!twitterName.data.twitter_name) {
      return null
    }
    return twitterName.data
  },
  getCAByTwitter: async (twitterName: string): Promise<GetTwitterByCARes | null> => {
    const ca = await xbuddyClient.post<GetTwitterByCARes>('/api/token/ca-by-twitter', { twitter_name: twitterName })
    if (!ca.data.ca) {
      return null
    }
    return ca.data
  },
  getTokenDetailByCA: async (req: TokenDetailsByCAReq): Promise<TokenDetailByCARes | null> => {
    try {
      const tokenDetail = await xbuddyClient.post<TokenDetailByCARes>('/api/token/token-detail-by-ca', req)
      if (!tokenDetail.data.description) {
        return null
      }
      return tokenDetail.data
    } catch (error) {
      console.error('Failed to fetch token detail:', error)
      return null
    }
  },
  /**
   * Create a standard TokenAnalysis response with provided data
   * Assemble the data you need
   */
  createTokenAnalysisResponse: (
    tokenInfo: TokenSafetyProps | null,
    twitterInfo: TwitterAccountInfo | null,
    model: 'token' | 'twitter',
  ): TokenAnalysis => {
    return {
      token_info: tokenInfo,
      twitter_status: twitterInfo,
      current_model: model,
    }
  },
  tokenAnalysisByToken: async (req: TokenDetailsByCAReq): Promise<TokenAnalysis | null> => {
    let tokenSafety: TokenSafetyProps | null = null
    const { ca, chain, lang } = req

    try {
      // Get token safety info
      tokenSafety = await tokenSafetyApi.checkTokenSafety(ca, chain, lang)
      let twitterStatus = null

      // Try to get Twitter info but don't fail if not available
      try {
        const twitterName = await tokenSafetyApi.getTwitterByCA(ca)
        if (twitterName?.twitter_name) {
          twitterStatus = await tokenSafetyApi.twitterInfo({ url: twitterName.twitter_name })
        }
      } catch (error) {
        console.error('Failed to fetch Twitter info:', error)
      }

      // Get token detail
      const tokenDetail = await tokenSafetyApi.getTokenDetailByCA({ chain, ca, lang })
      tokenSafety.description = tokenDetail?.description

      return tokenSafetyApi.createTokenAnalysisResponse(tokenSafety, twitterStatus, 'token')
    } catch (error) {
      console.error('Token safety check failed:', error)
      return tokenSafetyApi.createTokenAnalysisResponse(null, null, 'token')
    }
  },
  tokenAnalysisByTwitter: async (req: TwitterInfoReq): Promise<TokenAnalysis | null> => {
    let twitterInfo: TwitterAccountInfo | null = null
    try {
      // Get Twitter info
      twitterInfo = await tokenSafetyApi.twitterInfo(req)
      let tokenSafety = null

      // Try to get token safety info but don't fail if not available
      try {
        if (req.url) {
          const res = await tokenSafetyApi.getCAByTwitter(req.url)
          if (res?.ca) {
            tokenSafety = await tokenSafetyApi.checkTokenSafety(res.ca, res.chain || '')
            // Get token detail
            const tokenDetail = await tokenSafetyApi.getTokenDetailByCA({ chain: res.chain, ca: res.ca || '' })
            tokenSafety.description = tokenDetail?.description
          }
        }
      } catch (error) {
        console.error('Failed to fetch CA:', error)
      }

      return tokenSafetyApi.createTokenAnalysisResponse(tokenSafety, twitterInfo, 'twitter')
    } catch (error) {
      console.error('Token safety check failed:', error)
      return tokenSafetyApi.createTokenAnalysisResponse(null, null, 'twitter')
    }
  },
  getTokenByPool: async (pair: string): Promise<TokenByPoolResult | null> => {
    const result = await xbuddyClient.post<TokenByPoolResult>('/api/token/token-by-pool', { pa: pair })
    return result.data
  },
}
