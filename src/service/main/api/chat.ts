import { xbuddyClient } from "./api-client"

export const chatApi = {
    chat: (message: string) => xbuddyClient.post('/chat', { message }),
}