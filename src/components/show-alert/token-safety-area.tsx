import { useEffect, useRef, useState } from 'react'
import { BsShieldCheck, BsShieldX } from 'react-icons/bs'

import TokenSafetyDetails from './token-safety-details'
import { useAlert } from '@/contexts/alert-context'
import { useLive2DStore } from '@/store'
import { cn } from '@/utils'

const TokenSafetyArea = () => {
  const [showDetails, setShowDetails] = useState(false)
  const [showMoreNarrative, setShowMoreNarrative] = useState(false)
  const { state } = useAlert()
  const { speakAssetsAudio, model, assetsAudio } = useLive2DStore()
  const referenceElement = useRef<HTMLDivElement>(null)

  const alert = state.tokenSafetyAlert

  const calculateRiskScore = (risks: Record<string, boolean | string | number>, isSolana: boolean) => {
    if (!risks) return { score: 0, total: 0 }

    const risksArray = Object.entries(risks).filter(([key]) => key.startsWith('risks')) // Only consider our standardized risks

    const total = risksArray.length

    // Count safe items based on chain type
    const safeItems = risksArray.filter(([key, value]) => {
      // For Solana's top holders percentage (risks1)
      if (isSolana && key === 'risks1' && typeof value === 'number') {
        return value < 10 // Safe if less than 10%
      }
      // For all other boolean risks
      return !value
    }).length

    return { score: safeItems, total }
  }

  const chain = alert?.token_info?.chain || ''
  const isSolana = chain.toLowerCase() === 'solana'
  const { score, total } = calculateRiskScore(alert?.token_info?.risks || {}, isSolana)
  const isSafe = score === total

  // Mock narrative
  const tokenNarrative = alert?.token_info?.description
  const renameCount = alert?.twitter_status?.twitter_rename_record?.screen_names?.length || null

  useEffect(() => {
    const renameSafe = renameCount && renameCount <= 2
    if (!isSafe || !renameSafe) {
      speakAssetsAudio('danger')
    } else {
      speakAssetsAudio('hello')
    }
  }, [isSafe, renameCount])

  if (!alert?.token_info) return <p className="text-sm text-red-400 mt-2">No related token found for this URL</p>

  return (
    <div className="mt-2">
      {/* Safety Status */}
      <div className="text-sm flex items-center gap-2" ref={referenceElement}>
        <span className="font-medium">Token Safety:</span>
        <div className="flex items-center gap-1">
          <>
            {isSafe ? (
              <BsShieldCheck className="text-green-500 h-5 w-5" />
            ) : (
              <BsShieldX className="text-red-500 h-5 w-5" />
            )}
            <button
              className={cn('text-green-500 underline font-bold cursor-pointer', !isSafe && 'text-red-500')}
              onClick={() => setShowDetails(!showDetails)}
            >
              {score}/{total}
            </button>
          </>
        </div>
      </div>

      {/* Token Narrative */}
      <div className="mt-3">
        <div className="font-medium text-sm">Token Narrative:</div>
        {tokenNarrative ? (
          <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">
            {showMoreNarrative ? tokenNarrative : `${tokenNarrative.substring(0, 100)}...`}
            <button className="text-blue-500 ml-1" onClick={() => setShowMoreNarrative(!showMoreNarrative)}>
              {showMoreNarrative ? 'Less' : 'More'}
            </button>
          </p>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">No description available for this token</p>
        )}
      </div>

      {/* Token Safety Details Panel */}
      {showDetails && (
        <TokenSafetyDetails
          alert={alert.token_info}
          showDetails={showDetails}
          setShowDetails={setShowDetails}
          referenceElement={referenceElement}
        />
      )}
    </div>
  )
}

export default TokenSafetyArea
