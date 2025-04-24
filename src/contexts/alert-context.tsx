import React, { createContext, useContext, useReducer, ReactNode } from 'react'
import { UrlSafetyResult } from '@/service/preload/url-safety-api'
import { TokenAnalysis } from '@/service/main/api/token-safety/types/token'

// Define Alert types
export type AlertType = 'phishing' | 'tokenSafety'

// Define Alert state interface
interface AlertState {
  phishingAlert: UrlSafetyResult | null
  tokenSafetyAlert: TokenAnalysis | null
  activeAlert: AlertType | null
}

// Define Alert actions
type AlertAction =
  | { type: 'SHOW_PHISHING_ALERT'; payload: UrlSafetyResult }
  | { type: 'SHOW_TOKEN_SAFETY_ALERT'; payload: TokenAnalysis }
  | { type: 'CLOSE_ALERT' }

// Initial state
const initialState: AlertState = {
  phishingAlert: null,
  tokenSafetyAlert: null,
  activeAlert: null,
}

// Create context
const AlertContext = createContext<{
  state: AlertState
  showPhishingAlert: (alert: UrlSafetyResult) => void
  showTokenSafetyAlert: (alert: TokenAnalysis) => void
  closeAlert: () => void
}>({
  state: initialState,
  showPhishingAlert: () => null,
  showTokenSafetyAlert: () => null,
  closeAlert: () => null,
})

// Reducer function
function alertReducer(state: AlertState, action: AlertAction): AlertState {
  switch (action.type) {
    case 'SHOW_PHISHING_ALERT':
      return {
        ...state,
        phishingAlert: action.payload,
        tokenSafetyAlert: null, // Close other alerts
        activeAlert: 'phishing',
      }
    case 'SHOW_TOKEN_SAFETY_ALERT':
      return {
        ...state,
        tokenSafetyAlert: action.payload,
        phishingAlert: null, // Close other alerts
        activeAlert: 'tokenSafety',
      }
    case 'CLOSE_ALERT':
      return {
        ...state,
        activeAlert: null,
      }
    default:
      return state
  }
}

// Provider component
export const AlertProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(alertReducer, initialState)

  const showPhishingAlert = (alert: UrlSafetyResult) => {
    dispatch({ type: 'SHOW_PHISHING_ALERT', payload: alert })
  }

  const showTokenSafetyAlert = (alert: TokenAnalysis) => {
    dispatch({ type: 'SHOW_TOKEN_SAFETY_ALERT', payload: alert })
  }

  const closeAlert = () => {
    dispatch({ type: 'CLOSE_ALERT' })
  }

  return (
    <AlertContext.Provider value={{ state, showPhishingAlert, showTokenSafetyAlert, closeAlert }}>
      {children}
    </AlertContext.Provider>
  )
}

// Custom Hook for accessing context
export const useAlert = () => useContext(AlertContext)
