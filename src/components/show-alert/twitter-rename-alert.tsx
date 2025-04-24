import { X } from 'lucide-react'
import { BsTwitterX } from 'react-icons/bs'
import { FaExchangeAlt } from 'react-icons/fa'

import { CLASSNAME } from '@/constants/classname'
import { cn, countNameChanges, sortRenameHistoriesByStartDate } from '@/utils'
import { TwitterAccountInfo } from '@/lib/main/api/token-safety/types/twitter'

interface TwitterRenameAlertProps {
  alert: TwitterAccountInfo
  isVisible: boolean
  onClose: () => void
}

const TwitterRenameAlert = ({ alert, isVisible, onClose }: TwitterRenameAlertProps) => {
  if (!alert?.twitter_status || !isVisible) return null

  // Get rename history sorted from newest to oldest
  const renameHistory = sortRenameHistoriesByStartDate(alert.twitter_rename_record.screen_names)
  const nameChangesCount = countNameChanges(renameHistory)

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
    <div
      className={cn(
        'fixed -top-40 bg-black/70 z-50 flex items-center justify-center w-56 max-h-[90vh] rounded-2xl',
        isVisible ? 'animate-in fade-in duration-300' : 'animate-out fade-out duration-300',
        CLASSNAME.IGNORE_MOUSE_EVENTS,
      )}
      onClick={onClose}
    >
      <div
        className="rounded-lg shadow-lg p-5 max-w-md w-full h-full mx-4 overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <div className="text-lg text-white font-semibold flex items-center gap-2">
            <FaExchangeAlt className="h-4 w-4" />
            Rename History
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          {renameHistory.map((history, index) => {
            const prevHistory = index < renameHistory.length - 1 ? renameHistory[index + 1] : null
            const displayName = history.name
            const prevName = prevHistory?.name
            const dateText = formatDate(history.start_date)

            return (
              <div key={index} className="text-white border-b border-gray-700 pb-3 last:border-0">
                <div className="flex items-center gap-2 mb-1">
                  <BsTwitterX className="h-4 w-4 text-blue-400" />
                  <span className="text-gray-300 text-sm">{dateText}</span>
                </div>
                <div className="flex items-center gap-2">
                  {prevName && (
                    <>
                      <span className="text-gray-300">{prevName}</span>
                      <span className="text-gray-500">→</span>
                    </>
                  )}
                  <span className="text-white font-medium">{displayName}</span>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-4 text-red-400 text-sm">
          Changed name {nameChangesCount} times. Exercise caution when interacting with this account.
        </div>
      </div>
    </div>
  )
}

export default TwitterRenameAlert
