import { X } from 'lucide-react'
import { BsTwitterX } from 'react-icons/bs'
import { RefObject } from 'react'

import { TwitterAccountInfo } from '@/service/main/api/token-safety/types/twitter'
import { buildRenameEvents } from '@/utils/twitter'
import FloatingPopup from '../ui/floating-popup'

interface TwitterRenameAlertProps {
  alert: TwitterAccountInfo
  isVisible: boolean
  onClose: () => void
  referenceElement?: RefObject<HTMLElement | null>
}

const TwitterRenameAlert = ({ alert, isVisible, onClose, referenceElement }: TwitterRenameAlertProps) => {
  if (!alert?.twitter_status || !isVisible) return null

  // Get rename history sorted from newest to oldest
  const timeline = buildRenameEvents(alert.twitter_rename_record?.screen_names, alert.twitter_status.name)

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date
      .getDate()
      .toString()
      .padStart(2, '0')}`
  }

  return (
    <FloatingPopup
      isActive={isVisible}
      referenceElement={referenceElement}
      placement="top"
      width="w-80"
      arrowTipDistance={10}
      className="bg-black/70"
    >
      <div className="rounded-lg shadow-lg max-w-md w-full h-full overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <div className="text-lg text-white font-semibold flex items-center gap-2">Rename History</div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200 transition-colors">
            <X className="h-5 w-5 cursor-pointer" />
          </button>
        </div>

        <div className="space-y-4">
          {timeline.map((event, index) => {
            const displayName = event.from
            const prevName = event.to
            const dateText = formatDate(event.date)

            return (
              <div key={index} className="text-white text-sm border-b border-gray-700 pb-3 last:border-0 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <BsTwitterX className="h-4 w-4 text-blue-400" />
                  <span className="text-gray-300 text-sm">{dateText}</span>
                </div>
                <div className="flex items-center gap-2">
                  {prevName && (
                    <div className="flex items-center gap-1">
                      <span className="line-clamp-2">{prevName}</span>
                      <span>→</span>
                    </div>
                  )}
                  <span className="text-white font-medium line-clamp-2">{displayName}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </FloatingPopup>
  )
}

export default TwitterRenameAlert
