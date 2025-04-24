import { TokenAnalysis } from '@/lib/main/api/token-safety/types/token'
import { UrlSafetyResult } from '@/lib/preload/url-safety-api'

export interface SelfManagedAlertProps<T> {
  alert: T | null
  isActive: boolean
  onClose: () => void
}

export type PhishingAlertProps = SelfManagedAlertProps<UrlSafetyResult>
export type TokenSafetyAlertProps = SelfManagedAlertProps<TokenAnalysis>
