import { TokenAnalysis } from '@/service/main/api/token-safety/types/token'
import { UrlSafetyResult } from '@/service/preload/url-safety-api'
import { RefObject } from 'react'

export interface SelfManagedAlertProps<T> {
  alert: T | null
  isActive: boolean
  onClose: () => void
  referenceElement?: RefObject<HTMLElement> | null
}

export interface NewsData {
  title: string
  content: string
}

export type PhishingAlertProps = SelfManagedAlertProps<UrlSafetyResult>
export type TokenSafetyAlertProps = SelfManagedAlertProps<TokenAnalysis>
