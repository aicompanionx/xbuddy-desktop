import { TokenAnalysis } from '@/lib/main/api/token-safety/types/token'
import { UrlSafetyResult } from '@/lib/preload/url-safety-api'
import { RefObject } from 'react'

export interface SelfManagedAlertProps<T> {
  alert: T | null
  isActive: boolean
  onClose: () => void
  referenceElement?: RefObject<HTMLElement> | null
}

export type PhishingAlertProps = SelfManagedAlertProps<UrlSafetyResult>
export type TokenSafetyAlertProps = SelfManagedAlertProps<TokenAnalysis>
