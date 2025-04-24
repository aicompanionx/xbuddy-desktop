import { AlertTriangle, X } from 'lucide-react'
import { BsShieldCheck, BsShieldX } from 'react-icons/bs'

import { CLASSNAME } from '@/constants/classname'
import { cn } from '@/utils'
import { TokenSafetyProps } from '@/lib/main/api/token-safety/types/token'

// Mapping risk names to readable descriptions for Solana tokens
const SOL_RISK_DESCRIPTIONS: Record<string, string> = {
  risks1: 'Top 10% holder concentration',
  risks2: 'Mint authority not renounced',
  risks3: 'Blacklist feature enabled',
  risks4: 'Pool can be closed',
}

// Mapping risk names to readable descriptions for EVM tokens
const EVM_RISK_DESCRIPTIONS: Record<string, string> = {
  risks1: 'Liquidity pool not locked',
  risks2: 'Honeypot detection',
  risks3: 'Source code not verified',
  risks4: 'Owner privileges not renounced',
}

const TokenSafetyDetails = ({
  alert,
  showDetails,
  setShowDetails,
}: {
  alert: TokenSafetyProps
  showDetails: boolean
  setShowDetails: (showDetails: boolean) => void
}) => {
  const isSolana = alert.chain?.toLowerCase() === 'solana'
  const riskDescriptions = isSolana ? SOL_RISK_DESCRIPTIONS : EVM_RISK_DESCRIPTIONS

  // Get properly formatted risk value based on key and value
  const getRiskValue = (key: string, value: unknown) => {
    // For Solana's risks1 (top holders percentage), show the actual percentage value
    if (isSolana && key === 'risks1' && typeof value === 'number') {
      return `${value.toFixed(1)}%`
    }
    // For boolean values, return standard Yes/No
    return value ? 'Yes' : 'No'
  }

  // Determine if a risk value is risky
  const isRisky = (key: string, value: unknown) => {
    if (isSolana && key === 'risks1' && typeof value === 'number') {
      return value >= 10
    }
    return Boolean(value)
  }

  return (
    <div
      className={cn(
        'fixed bottom-28 bg-black/70 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center w-80 h-fit rounded-2xl',
        showDetails ? 'animate-in fade-in duration-300' : 'animate-out fade-out duration-300',
        CLASSNAME.IGNORE_MOUSE_EVENTS,
      )}
      onClick={() => setShowDetails(false)}
    >
      <div
        className="rounded-lg shadow-lg p-2 max-w-md w-full h-full mx-4 overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <div className="text-lg text-white font-semibold flex items-center gap-2">
            <BsShieldCheck className="h-4 w-4" />
            Token Risks
          </div>
          <button
            onClick={() => setShowDetails(false)}
            className="text-gray-400 hover:text-gray-200 dark:text-gray-500 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Standardized risk display for both EVM and Solana */}
        {Object.entries(alert.risks || {})
          .filter(([key]) => key.startsWith('risks'))
          .map(([key, value]) => {
            const risky = isRisky(key, value)
            return (
              <div key={key} className="flex text-xs text-white justify-between items-center pb-2">
                <div className="flex items-center gap-2">
                  {risky && <AlertTriangle className="text-amber-500 h-4 w-4 flex-shrink-0" />}
                  <span className="">{riskDescriptions[key] || key.replace(/_/g, ' ')}</span>
                </div>
                <div className={`font-medium ${risky ? 'text-red-500' : 'text-green-500'}`}>
                  {risky ? (
                    <div className="flex items-center gap-2">
                      <span>{getRiskValue(key, value)}</span>
                      <BsShieldX className="text-red-500 h-4 w-4" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>{getRiskValue(key, value)}</span>
                      <BsShieldCheck className="text-green-500 h-4 w-4" />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
      </div>
    </div>
  )
}

export default TokenSafetyDetails
