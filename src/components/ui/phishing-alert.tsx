import React from 'react'

export interface UnsafeUrlAlert {
  url: string
  reason: string
  timestamp: number
}

interface PhishingAlertProps {
  alert: UnsafeUrlAlert
  visible: boolean
  onClose: () => void
}

const PhishingAlert: React.FC<PhishingAlertProps> = ({ alert, visible, onClose }) => {
  if (!visible) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full mx-4 overflow-hidden animate-in fade-in duration-300">
        <div className="bg-red-600 p-4 text-white">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h3 className="text-lg font-semibold">Security Alert</h3>
          </div>
        </div>

        <div className="p-6">
          <h4 className="text-lg font-medium mb-2 dark:text-white">Potentially Dangerous Website Detected</h4>
          <p className="text-gray-700 dark:text-gray-300 mb-4">A suspicious website has been detected:</p>
          <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md mb-4 break-all">
            <p className="font-mono text-sm dark:text-white">{alert.url}</p>
          </div>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            <strong>Reason:</strong> {alert.reason}
          </p>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PhishingAlert
