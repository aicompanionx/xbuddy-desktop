import React from 'react'
import { ShieldAlert, XCircle, AlertTriangle } from 'lucide-react'
import { UrlSafetyResult } from '../../lib/api/types'

interface PhishingAlertProps {
  result: UrlSafetyResult | null
  onClose: () => void
  className?: string
}

/**
 * Phishing Alert Component
 * Displays warning information about potential phishing sites
 */
export const PhishingAlert: React.FC<PhishingAlertProps> = ({ result, onClose, className = '' }) => {
  // Don't render anything if result is null or URL is safe
  if (!result || result.isSafe) return null

  return (
    <div
      className={`bg-red-50 border border-red-300 rounded-lg shadow-lg p-4 animate-in slide-in-from-top duration-300 ${className}`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 flex flex-col items-center">
          <ShieldAlert className="h-8 w-8 text-red-600" />
          <AlertTriangle className="h-6 w-6 text-red-500 mt-1 animate-pulse" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-base font-bold text-red-800">检测到风险网站!</h3>
          <div className="mt-2 text-sm text-red-700">
            <p className="mb-1">
              <span className="font-semibold">网站:</span> {result.url}
            </p>
            {result.reason && (
              <p className="mb-1">
                <span className="font-semibold">原因:</span> {result.reason}
              </p>
            )}
            {result.category && (
              <p className="mb-1">
                <span className="font-semibold">类型:</span> {result.category}
              </p>
            )}
            {result.riskScore !== undefined && (
              <p className="mb-1">
                <span className="font-semibold">风险等级:</span> {result.riskScore}{' '}
                <span className="inline-block w-16 h-2 bg-gray-200 rounded-full overflow-hidden ml-1 align-middle">
                  <span
                    className="block h-full bg-red-600 rounded-full"
                    style={{ width: `${Math.min(100, result.riskScore * 10)}%` }}
                  />
                </span>
              </p>
            )}
            {result.timestamp && (
              <p className="text-xs text-red-400 mt-1">检测时间: {new Date(result.timestamp).toLocaleString()}</p>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="ml-auto flex-shrink-0 bg-red-50 text-red-500 hover:text-red-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          aria-label="关闭"
        >
          <XCircle className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
