import { X } from 'lucide-react'
import { FcIdea } from 'react-icons/fc'

import { cn, shortenName } from '@/utils'
import { TokenSafetyAlertProps } from '../../types/alert'
import { CLASSNAME } from '@/constants/classname'
import TokenSafetyArea from './token-safety-area'
import TokenTwitterArea from './token-twitter-area'

const TokenSafetyAlert = ({ alert, isActive, onClose }: TokenSafetyAlertProps) => {
  // Get base animation classes
  const animationClasses = cn(
    'absolute bottom-48 right-1/2 translate-x-1/2 z-50 w-[26rem] transition-opacity duration-300 space-y-2',
    isActive ? 'animate-in fade-in slide-in-from-right-5 opacity-100' : 'opacity-0 pointer-events-none',
    CLASSNAME.IGNORE_MOUSE_EVENTS,
  )

  // If alert is null, don't render anything
  if (!alert?.token_info && !alert?.twitter_status) return null

  // Get data from token_info and twitter_status
  const name =
    alert.current_model === 'token' ? alert.token_info?.symbol : alert.twitter_status?.twitter_rename_record?.name

  return (
    <div className={animationClasses}>
      {/* Main Alert Card */}
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
    </div>
  )
}

export default TokenSafetyAlert
