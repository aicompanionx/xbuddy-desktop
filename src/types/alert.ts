import { TokenAnalysis } from '@/service/main/api/token-safety/types/token'
import { UrlSafetyResult } from '@/service/preload/url-safety-api'

export interface SelfManagedAlertProps<T> {
  alert: T | null
  isActive: boolean
  onClose: () => void
}

export type PhishingAlertProps = SelfManagedAlertProps<UrlSafetyResult>
export type TokenSafetyAlertProps = SelfManagedAlertProps<TokenAnalysis>
