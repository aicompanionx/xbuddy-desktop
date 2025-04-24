import { useState } from 'react'
import { LuBrain } from 'react-icons/lu'

import { useAlert } from '@/contexts/alert-context'
import TwitterRenameAlert from './twitter-rename-alert'

const TokenTwitterArea = () => {
  // Get data from token_info and twitter_status
  const { state } = useAlert()
  const alert = state.tokenSafetyAlert

  const [isRenameAlertVisible, setIsRenameAlertVisible] = useState(false)

  if (!alert?.twitter_status)
    return <p className="text-sm text-red-400 mb-2">No corresponding X account found for this address</p>

  const twitterRenameCount = alert.twitter_status?.twitter_rename_record?.screen_names?.length || 0
  const influenceLevel = alert.twitter_status?.twitter_status?.influenceLevel || 'Level 0'
  const influenceScore =
    alert.twitter_status?.twitter_status?.smartFollowers +
      alert.twitter_status?.twitter_status?.cnKolFollowersCount +
      alert.twitter_status?.twitter_status?.topFollowers || 0
  const kolsFollowing = alert.twitter_status?.twitter_status?.smartFollowers?.toString() || '0'
  const mentions24h = '32.1K' // Would come from API
  const smartMentions = '12.1K' // Would come from API
  const smartnessLevel = 3 // 1-3 scale, would be calculated from API data

  console.log('twitterRenameCount', twitterRenameCount)

  return (
    <div className="space-y-2 mt-2">
      {/* Influence Level */}
      <div className="text-sm">
        <div className="flex items-center gap-2 whitespace-nowrap">
          <p>
            <span className="font-semibold">X Influence: </span> Level {influenceLevel}
          </p>
          <p>
            <span className="font-semibold">Score: </span> {influenceScore}
          </p>
          <p>
            <span className="font-semibold">{kolsFollowing} </span>KOLs following
          </p>
        </div>
      </div>

      {/* Mentions */}
      <div className="text-sm flex justify-between">
        <div>24H Mentions: {mentions24h}</div>
        <div>Smart Mentions: {smartMentions}</div>
      </div>

      {/* Smart Level */}
      <div className="text-sm flex items-center gap-1">
        <span>X Intelligence:</span>
        {Array.from({ length: smartnessLevel }).map((_, i) => (
          <LuBrain key={i} className="h-5 w-5 text-pink-400" />
        ))}
      </div>

      {/* Rename Warning */}
      {twitterRenameCount > 0 && (
        <TwitterRenameAlert
          alert={alert.twitter_status}
          isVisible={isRenameAlertVisible}
          onClose={() => setIsRenameAlertVisible(false)}
        />
      )}
    </div>
  )
}

export default TokenTwitterArea
