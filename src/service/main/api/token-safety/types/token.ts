import { type TwitterAccountInfo } from './twitter'

export type TokenAnalysis = {
  token_info?: TokenSafetyProps | null
  twitter_status?: TwitterAccountInfo | null
  current_model?: 'token' | 'twitter'
}

export type TokenSafetyreq = {
  chain?: string
  ca?: string
  // lang?: string
}

export type TokenSafetyResult = {
  chain?: string
  ca?: string
  risks?: RiskOptions | null
}

export type TokenByPoolResult = {
  /**
   * Pa, pool address
   */
  pa?: string
  /**
   * Token info
   */
  token?: TokenInfo
}

export interface TokenInfo {
  /**
   * Ca, main currency contract address
   */
  ca?: string
  /**
   * Imageurl, Logo address
   */
  imageUrl?: string
  /**
   * Marketcap, market cap
   */
  marketCap?: number
  /**
   * Name, token name
   */
  name?: string
  /**
   * Priceusd, USD price
   */
  priceUsd?: number
  /**
   * Symbol, token symbol
   */
  symbol?: string
  /**
   * Twitter link
   */
  twitter?: string
}

export type TokenSafetyResultWithSol = {
  /**
   * Ca
   */
  ca?: string
  /**
   * SOL chain risks
   */
  risks?: SOLRiskOptions | null
}

export type TokenSafetyProps = {
  chain?: string
  ca?: string
  risks?: {
    risks1?: boolean | string | number
    risks2?: boolean
    risks3?: boolean
    risks4?: boolean
  }
  name?: string
  symbol?: string
  description?: string
}

export type GetTwitterByCARes = {
  chain?: string
  ca?: string
}

export interface RiskOptions {
  /**
   * Anti Whale Modifiable
   */
  anti_whale_modifiable?: boolean
  /**
   * Buy Tax
   */
  buy_tax?: number
  /**
   * Can Take Back Ownership
   */
  can_take_back_ownership?: boolean
  /**
   * Cannot Buy
   */
  cannot_buy?: boolean
  /**
   * Cannot Sell All
   */
  cannot_sell_all?: boolean
  /**
   * External Call
   */
  external_call?: boolean
  /**
   * Gas Abuse
   */
  gas_abuse?: boolean
  /**
   * Hidden Owner
   */
  hidden_owner?: boolean
  /**
   * Is Anti Whale
   */
  is_anti_whale?: boolean
  /**
   * Is Blacklisted
   */
  is_blacklisted?: boolean
  /**
   * Is Honeypot
   */
  is_honeypot?: boolean
  /**
   * Is Mintable
   */
  is_mintable?: boolean
  /**
   * Is Open Source
   */
  is_open_source?: boolean
  /**
   * Is Proxy
   */
  is_proxy?: boolean
  /**
   * Is Whitelisted
   */
  is_whitelisted?: boolean
  /**
   * Owner Change Balance
   */
  owner_change_balance?: boolean
  /**
   * Personal Slippage Modifiable
   */
  personal_slippage_modifiable?: boolean
  /**
   * Selfdestruct
   */
  selfdestruct?: boolean
  /**
   * Sell Tax
   */
  sell_tax?: number
  /**
   * Slippage Modifiable
   */
  slippage_modifiable?: boolean
  /**
   * Trading Cooldown
   */
  trading_cooldown?: boolean
  /**
   * Transfer Pausable
   */
  transfer_pausable?: boolean
  token_name?: string
  token_symbol?: string
  total_supply?: string
  holder_count?: string
}

/**
 * SOLRiskOptions，SOL chain risks
 */
export interface SOLRiskOptions {
  /**
   * Balance Mutable
   */
  balance_mutable?: boolean
  /**
   * Closable
   */
  closable?: boolean
  /**
   * Default Account State
   */
  default_account_state?: string
  /**
   * Description
   */
  description?: string | null
  /**
   * Dex info
   */
  dex?: unknown[] | null
  /**
   * Freezable
   */
  freezable?: boolean
  /**
   * Holder Count
   */
  holder_count?: string | null
  /**
   * Holders
   */
  holders?: unknown[] | null
  /**
   * Is Mintable
   */
  is_mintable?: boolean
  /**
   * Metadata Mutable, whether metadata is mutable
   */
  metadata_mutable?: boolean
  /**
   * Name
   */
  name?: string | null
  /**
   * Non Transferable
   */
  non_transferable?: boolean
  /**
   * Symbol
   */
  symbol?: string | null
  /**
   * Top Holders Percent
   */
  top_holders_percent?: number | null
  /**
   * Total Supply
   */
  total_supply?: string | null
  /**
   * Transfer Fee
   */
  transfer_fee?: number
  /**
   * Transfer Fee Upgradable
   */
  transfer_fee_upgradable?: boolean
  /**
   * Transfer Hook
   */
  transfer_hook?: boolean
  /**
   * Trusted Token
   */
  trusted_token?: number | null
}

export type TokenDetailsByCAReq = {
  chain: string
  ca: string
  // lang?: string
}
