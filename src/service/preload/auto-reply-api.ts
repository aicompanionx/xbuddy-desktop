// import { ipcRenderer } from 'electron'

// interface AutoReplyRequest {
//     url?: string
//     comment?: string
//     urls?: string
//     comments?: string
//     repeat?: number
//     lang?: string
//     fast?: boolean
//     debug?: boolean
// }

// interface AutoReplyResponse {
//     success: boolean
//     message: string
//     processId?: number
//     targetCount?: number
//     commentCount?: number
// }

// interface AutoReplyStatus {
//     runningCount: number
//     processes: number[]
// }

// // Auto Reply API
// export const autoReplyApi = {
//     /**
//      * Execute auto reply operation
//      * @param options Auto reply options
//      */
//     executeAutoReply: (options: AutoReplyRequest): void => {
//         console.log('Sending auto-reply request:', options)
//         ipcRenderer.send('execute-auto-reply', options)
//     },

//     /**
//      * Stop specific auto reply process
//      * @param processId Process ID
//      * @returns Stop result Promise
//      */
//     stopAutoReply: async (processId: number): Promise<AutoReplyResponse> => {
//         return await ipcRenderer.invoke('stop-auto-reply', { processId })
//     },

//     /**
//      * Stop all auto reply processes
//      * @returns Stop result Promise
//      */
//     stopAllAutoReplies: async (): Promise<AutoReplyResponse> => {
//         return await ipcRenderer.invoke('stop-all-auto-replies')
//     },

//     /**
//      * Get status of running auto reply processes
//      * @returns Status information Promise
//      */
//     getStatus: async (): Promise<AutoReplyStatus> => {
//         return await ipcRenderer.invoke('get-auto-reply-status')
//     },

//     /**
//      * Register auto reply status listener
//      * @param callback Status callback function
//      * @returns Function to remove listener
//      */
//     onAutoReplyStatus: (callback: (data: AutoReplyResponse) => void): (() => void) => {
//         const listener = (_event: unknown, data: AutoReplyResponse) => callback(data)
//         ipcRenderer.on('auto-reply-status', listener)
//         return () => {
//             ipcRenderer.removeListener('auto-reply-status', listener)
//         }
//     }
// } 