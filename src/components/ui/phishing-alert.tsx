import { ShieldAlert, ShieldCheck, X } from 'lucide-react'
import { useEffect } from 'react'

import { cn } from '@/utils'
import { PhishingAlertProps } from '../../types/alert'
import FloatingPopup from './floating-popup'
import { useLive2DStore } from '@/store'
import NoticeAlert from '../show-alert/notice-alert'

const PhishingAlert = ({ alert, isActive, onClose, referenceElement }: PhishingAlertProps) => {
  const { speakAssetsAudio } = useLive2DStore()

  const speakDanger = () => {
    speakAssetsAudio('danger')
  }
  useEffect(() => {
    if (alert?.isPhishing || !alert?.message) {
      speakDanger()
    }
  }, [alert?.isPhishing, alert?.message])

  // If alert is null, don't render anything
  if (!alert || !alert.message)
    return (
      <NoticeAlert isActive={isActive} referenceElement={referenceElement}>
        <div>Master, I couldn't find the security information for this website, please be cautious!</div>
      </NoticeAlert>
    )

  const message = alert?.isPhishing
    ? 'Master, this is a dangerous website that might steal your funds. Close it immediately!'
    : 'Master, this is a safe website. You can continue browsing.'

  return (
    <FloatingPopup isActive={isActive} referenceElement={referenceElement} placement="top" className="text-base">
      <div className="flex items-start space-x-3">
        {alert.isPhishing && <ShieldAlert className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />}
        {!alert.isPhishing && <ShieldCheck className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />}

        <div className="flex-1">
          <p className="text-gray-800 dark:text-gray-200">{message}</p>
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
