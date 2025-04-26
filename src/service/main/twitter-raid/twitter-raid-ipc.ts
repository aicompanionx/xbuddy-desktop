import { ipcMain } from 'electron'
import { twitterRaidApi } from '../api/twitter-raid'
import { TwitterRaidRequest } from '../api/twitter-raid/types/twitter-raid'
import { tokenSafetyApi } from '../api/token-safety'
import { TwitterRaidResponse } from '@/service/preload/twitter-raid-api'
import { autoReplyService } from './twitter-raid-service'
import { getMainWindow } from '../window'

export function setupTwitterRaidIPC(): void {
    ipcMain.handle('twitter-raid-push', async (_event, request: TwitterRaidRequest) => {
        try {
            console.log('Received Twitter raid push request:', request)

            if (!request || !request.token_ca || !request.token_symbol) {
                throw new Error('Invalid request parameters')
            }

            const result = await twitterRaidApi.pushRaid(request)
            return result
        } catch (error) {
            console.error('Error processing Twitter raid request:', error)
            return null
        }
    })

    ipcMain.handle('get-token-chain', async (_event, { ca }) => {
        try {
            if (!ca) {
                throw new Error('Contract address is required')
            }

            return await tokenSafetyApi.getTokenChain(ca)
        } catch (error) {
            console.error('Error getting token chain:', error)
            return null
        }
    })

    ipcMain.handle('get-token-detail', async (_event, { ca, chain }) => {
        try {
            if (!ca) {
                throw new Error('Contract address is required')
            }

            console.log("get-token-detail ca", ca);
            console.log("get-token-detailchain", chain);

            const result = await tokenSafetyApi.getTokenDetailByCA({ ca, chain })
            console.log("getTokenDetailByCA result", result);
            return result
        } catch (error) {
            console.error('Error getting token detail:', error)
            return null
        }
    })

    ipcMain.handle('execute-twitter-raid', async (_event, response: TwitterRaidResponse) => {
        try {
            console.log('Received Twitter raid execute request:', response)

            if (!response || !response.twitter_url) {
                throw new Error('Invalid Twitter raid parameters')
            }

            const autoReplyOptions = {
                url: response.tweet_url,
                comment: response.raid_content,
                lang: 'en'
            }

            const result = await autoReplyService.executeAutoReply(autoReplyOptions)
            console.log('Auto reply execution result:', result)

            const mainWindow = getMainWindow()
            if (mainWindow) {
                mainWindow.webContents.send('auto-reply-status', result)
            }


            return {
                success: result.success,
                completed: result.completed,
                message: result.message,
                processId: result.processId,
                title: response.title,
                twitter_url: response.twitter_url,
                name: response.name,
                tweet_url: response.tweet_url,
                raid_content: response.raid_content
            }
        } catch (error) {
            console.error('Error executing Twitter raid:', error)
            return {
                success: false,
                message: `Error executing Twitter raid: ${error instanceof Error ? error.message : String(error)}`
            }
        }
    })

    ipcMain.handle('stop-twitter-raid', async () => {
        try {
            const result = autoReplyService.stopAllAutoReplies()
            console.log('Auto reply stop result:', result)

            const mainWindow = getMainWindow()
            if (mainWindow) {
                mainWindow.webContents.send('auto-reply-status', result)
            }

            return {
                success: result.success,
                message: result.message
            }
        } catch (error) {
            console.error('Error stopping Twitter raid:', error)
            return {
                success: false,
                message: `Error stopping Twitter raid: ${error instanceof Error ? error.message : String(error)}`
            }
        }
    })

    ipcMain.handle('login-continue', async () => {
        try {
            console.log("------login-continue------");

            const result = await autoReplyService.loginContinue()
            return result
        } catch (error) {
            console.error('Error logging in:', error)
            return {
                success: false,
                message: `Error logging in: ${error instanceof Error ? error.message : String(error)}`
            }
        }
    })
} 