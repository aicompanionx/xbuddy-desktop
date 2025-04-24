import { X } from 'lucide-react'
import { FcIdea } from 'react-icons/fc'

import { shortenName } from '@/utils'
import { TokenSafetyAlertProps } from '../../types/alert'
import TokenSafetyArea from './token-safety-area'
import TokenTwitterArea from './token-twitter-area'
import FloatingPopup from '@/components/ui/floating-popup'

const TokenSafetyAlert = ({ alert, isActive, onClose, referenceElement }: TokenSafetyAlertProps) => {
  // If alert is null, don't render anything
  if (!alert?.token_info && !alert?.twitter_status) {
    if (alert?.current_model && alert.current_model === 'token')
      return (
        <FloatingPopup isActive={isActive} referenceElement={referenceElement} placement="top" width="w-max max-w-xs">
          <div>Master, no token information was retrieved, it might be a new token.</div>
        </FloatingPopup>
      )

    return null
  }

  // Get data from token_info and twitter_status
  const name =
    alert.current_model === 'token' ? alert.token_info?.symbol : alert.twitter_status?.twitter_rename_record?.name

  return (
    <FloatingPopup isActive={isActive} referenceElement={referenceElement} placement="top" width="w-max max-w-xs">
      <div className="bg-[#E8F1FF] dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">Master, here's my analysis of {shortenName(name)}</span>
            <FcIdea className="h-6 w-6" />
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors focus:outline-none"
            aria-label="Close alert"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <TokenTwitterArea />

        <TokenSafetyArea />
      </div>
    </FloatingPopup>
  )
}

export default TokenSafetyAlert
