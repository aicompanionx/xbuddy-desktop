/**
 * Interface for browser monitor data
 */
export interface BrowserTabData {
  url: string
  title?: string
  process?: string
  active: boolean
  timestamp?: number
  status?: string
  error?: boolean
  message?: string
}
