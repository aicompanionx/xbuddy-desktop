import { X } from 'lucide-react'
import { FcIdea } from 'react-icons/fc'

import { shortenAddress, shortenName } from '@/utils'
import { TokenSafetyAlertProps } from '../../types/alert'
import TokenSafetyArea from './token-safety-area'
import TokenTwitterArea from './token-twitter-area'
import FloatingPopup from '@/components/ui/floating-popup'
import NoticeAlert from './notice-alert'

const TokenSafetyAlert = ({ alert, isActive, onClose, referenceElement }: TokenSafetyAlertProps) => {
  // If alert is null, don't render anything
  if (!alert?.token_info && !alert?.twitter_status) {
    return (
      <NoticeAlert isActive={isActive} referenceElement={referenceElement}>
        <p>Master, no token information was retrieved, it might be a new token.</p>
      </NoticeAlert>
    )
  }

  if (
    (!alert?.twitter_status ||
      !alert?.twitter_status?.twitter_status ||
      !alert?.twitter_status?.twitter_rename_record) &&
    alert?.current_model &&
    alert.current_model === 'twitter'
  )
    return (
      <NoticeAlert isActive={isActive} referenceElement={referenceElement} className="w-42">
        <p>Master, I don't recognize this account ＞︿＜</p>
      </NoticeAlert>
    )

  // Get data from token_info and twitter_status
  const name =
    alert.current_model === 'token'
      ? alert.token_info?.symbol
        ? shortenName(alert.token_info?.symbol)
        : shortenAddress(alert?.token_info?.ca)
      : alert.twitter_status?.twitter_status?.name

  return (
    <FloatingPopup
      expandUpwards
      isActive={isActive}
      referenceElement={referenceElement}
      placement="top"
      className="w-[25rem]"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm">Master, here's my analysis of {name}</span>
          <FcIdea className="h-6 w-6 mb-2" />
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
    </FloatingPopup>
  )
}

export default TokenSafetyAlert
