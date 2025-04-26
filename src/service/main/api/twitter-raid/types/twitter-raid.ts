/**
 * Twitter Raid API Types
 */

/**
 * Twitter raid request interface
 */
export interface TwitterRaidRequest {
    token_name: string;
    token_symbol: string;
    token_ca: string;
    token_description: string;
    logo_content: string;
    chain: string;
}

/**
 * Twitter raid response interface
 */
export interface TwitterRaidResponse {
    title: string;
    twitter_url: string;
    name: string;
    tweet_url: string;
    raid_content: string;
} 