import { ShieldAlert, ShieldCheck, X } from 'lucide-react'
import { cn } from '@/utils'
import { PhishingAlertProps } from '../../types/alert'
import FloatingPopup from './floating-popup'

const PhishingAlert = ({ alert, isActive, onClose, referenceElement }: PhishingAlertProps) => {
  // If alert is null, don't render anything
  if (!alert) return null

  const message = alert?.message || 'This is a dangerous website that might steal your funds. Close it immediately!'

  return (
    <FloatingPopup isActive={isActive} referenceElement={referenceElement} placement="top" width="w-max max-w-xs">
      <div className="flex items-start space-x-3">
        {alert.isPhishing && <ShieldAlert className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />}
        {!alert.isPhishing && <ShieldCheck className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />}

        <div className="flex-1">
          <p className="text-sm text-gray-800 dark:text-gray-200">{message}</p>
        </div>

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
    </FloatingPopup>
  )
}

export default PhishingAlert
