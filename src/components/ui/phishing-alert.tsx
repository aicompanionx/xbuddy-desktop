import React from 'react'
import { ShieldAlert, ShieldCheck, X } from 'lucide-react'
import { cn } from '@/utils'
import { CLASSNAME } from '@/constants/classname'
import { UrlSafetyResult } from '@/lib/preload/url-safety-api'

interface PhishingAlertProps {
  alert: UrlSafetyResult
  visible: boolean
  onClose: () => void
}

const PhishingAlert: React.FC<PhishingAlertProps> = ({ alert, visible, onClose }) => {
  if (!visible) return null

  const formattedTime = new Date(alert.timestamp).toLocaleString()

  // Use reason as the main message, or a default message
  const message = alert.message || 'This is a dangerous website that will steal your money. Close it immediately!'

  return (
    // Position absolutely above the container, centered horizontally
    <div
      className={cn(
        'absolute -top-15 left-1/2 -translate-x-1/2 z-50 w-max max-w-xs animate-in fade-in slide-in-from-top-5 duration-300',
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none',
        'transition-opacity',
        CLASSNAME.IGNORE_MOUSE_EVENTS,
      )}
    >
      {/* Bubble style: white bg, rounded, shadow */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-start space-x-3">
          {/* Icon (optional, can be removed for closer match to image) */}
          {alert.isPhishing && <ShieldAlert className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />}
          {!alert.isPhishing && <ShieldCheck className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />}

          {/* Message content */}
          <div className="flex-1">
            <p className="text-sm text-gray-800 dark:text-gray-200">{message}</p>
            {/* Optionally show URL on hover/click, kept simple for now */}
            {/* <p className="text-xs text-gray-500 mt-1 break-all">{alert.url}</p> */}
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className={cn(
              'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors focus:outline-none',
            )}
            aria-label="Close alert"
          >
            <X className={cn('h-5 w-5')} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default PhishingAlert
