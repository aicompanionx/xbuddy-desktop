import { ipcRenderer } from 'electron'

/**
 * Twitter Raid Request Interface
 */
export interface TwitterRaidRequest {
    token_name: string
    token_symbol: string
    token_ca: string
    token_description: string
    logo_content: string
    chain: string
}

/**
 * Twitter Raid Response Interface
 */
export interface TwitterRaidResponse {
    title: string
    twitter_url: string
    name: string
    tweet_url: string
    raid_content: string
}


export type TwitterRaidExecutionResult = {
    success: boolean;
    message: string;
    processId: number;
    title: string;
    twitter_url: string;
    name: string;
    tweet_url: string;
    raid_content: string;
    completed: boolean;
}

export type TwitterRaidStatus = {
    message: {
        timestamp: number;
        level: string;
        message: string;
    }
    processId: number;
    success: boolean;
}

/**
 * Twitter Raid API
 * Provides functions for interacting with Twitter raid features
 */
export const twitterRaidApi = {
    /**
     * Push a Twitter raid request
     * @param request Raid request data
     * @returns Promise with raid response
     */
    pushRaid: async (request: TwitterRaidRequest): Promise<TwitterRaidResponse | null> => {
        try {
            return await ipcRenderer.invoke('twitter-raid-push', request)
        } catch (error) {
            console.error('Error pushing Twitter raid:', error)
            return null
        }
    },

    /**
     * Get token chain information by contract address
     * @param ca Contract address
     * @returns Promise with chain information
     */
    getTokenChain: async (ca: string): Promise<{ chain?: string } | null> => {
        try {
            return await ipcRenderer.invoke('get-token-chain', { ca })
        } catch (error) {
            console.error('Error getting token chain:', error)
            return null
        }
    },

    /**
     * Get token detail by contract address and chain
     * @param ca Contract address
     * @param chain Chain name
     * @returns Promise with token detail
     */
    getTokenDetail: async (ca: string, chain: string): Promise<{ description?: string } | null> => {
        try {
            return await ipcRenderer.invoke('get-token-detail', { ca, chain })
        } catch (error) {
            console.error('Error getting token detail:', error)
            return null
        }
    },

    /**
     * Execute a Twitter raid
     * @param response Twitter raid response
     * @returns Promise with execution result
     */
    executeRaid: async (response: TwitterRaidResponse): Promise<TwitterRaidExecutionResult | null> => {
        try {
            const result = await ipcRenderer.invoke('execute-twitter-raid', response)
            console.log("result", result);
            return result
        } catch (error) {
            console.error('Error executing Twitter raid:', error)
            return null
        }
    },

    /**
     * Stop a Twitter raid
     * @param processId Process ID
     * @returns Promise with stop result
     */
    stopRaid: async (processId: number): Promise<{ success: boolean, message: string } | null> => {
        try {
            return await ipcRenderer.invoke('stop-twitter-raid', { processId })
        } catch (error) {
            console.error('Error stopping Twitter raid:', error)
            return null
        }
    },

    /**
     * Login continue
     * @returns Promise with login result
     */
    loginContinue: async (): Promise<{ success: boolean, message: string } | null> => {
        try {
            return await ipcRenderer.invoke('login-continue')
        } catch (error) {
            console.error('Error logging in:', error)
            return null
        }
    },

    /**
     * On raid status
     * @param callback Callback function
     */
    onRaidStatus: (callback: (result: TwitterRaidStatus) => void) => {

        // Remove any existing listeners to prevent duplicates
        ipcRenderer.removeAllListeners('on-raid-status');

        // Set up the listener with the correct event name
        ipcRenderer.on('on-raid-status', (_event, result) => {
            console.log("Received raid status from main process:", result);
            callback(result);
        });

        // Return a cleanup function
        return () => {
            ipcRenderer.removeAllListeners('on-raid-status');
        };
    },

    /**
     * On login need
     * @param callback Callback function
     */
    onLoginNeed: (callback: (result: TwitterRaidStatus) => void) => {
        // Remove any existing listeners to prevent duplicates
        ipcRenderer.removeAllListeners('on-login-need');

        // Set up the listener with the correct event name
        ipcRenderer.on('on-login-need', (_event, result) => {
            console.log("Received login need from main process:", result);
            callback(result);
        });

        // Return a cleanup function
        return () => {
            ipcRenderer.removeAllListeners('on-login-need');
        };
    }
} 