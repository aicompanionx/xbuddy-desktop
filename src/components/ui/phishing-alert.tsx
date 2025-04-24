import { ShieldAlert, ShieldCheck, X } from 'lucide-react'
import { cn } from '@/utils'
import { CLASSNAME } from '@/constants/classname'
import { PhishingAlertProps } from '../../types/alert'

const PhishingAlert = ({ alert, isActive, onClose }: PhishingAlertProps) => {
  // Get base animation classes
  const animationClasses = cn(
    'absolute bottom-48 left-1/2 -translate-x-1/2 z-50 w-max max-w-xs transition-opacity duration-300',
    isActive ? 'animate-in fade-in slide-in-from-top-5 opacity-100' : 'opacity-0 pointer-events-none',
    CLASSNAME.IGNORE_MOUSE_EVENTS,
  )

  // If alert is null, don't render anything
  if (!alert) return null

  const formattedTime = new Date(alert.timestamp).toLocaleString()
  const message = alert.message || 'This is a dangerous website that might steal your funds. Close it immediately!'

  return (
    <div className={animationClasses}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700">
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
      </div>
    </div>
  )
}

export default PhishingAlert
