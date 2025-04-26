import { xbuddyClient } from '../api-client'
import {
    type TwitterRaidRequest,
    type TwitterRaidResponse
} from './types/twitter-raid'

export const twitterRaidApi = {
    /**
     * Push Twitter raid request to create raid content for a token
     * @param request Twitter raid request data 
     * @returns Twitter raid response with raid content
     */
    pushRaid: async (request: TwitterRaidRequest): Promise<TwitterRaidResponse | null> => {
        try {
            // Validate required fields
            if (!request.token_name || !request.token_symbol || !request.token_ca) {
                console.error('Missing required token information for Twitter raid')
                return null
            }

            const response = await xbuddyClient.post<TwitterRaidResponse>('/twitter_raid/push', request)
            console.log('Twitter raid response:', response.data)
            return response.data
        } catch (error) {
            console.error('Error processing Twitter raid request:', error)
            return null
        }
    },
} 