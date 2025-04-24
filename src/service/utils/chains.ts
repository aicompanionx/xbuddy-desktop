/**
 * Chain name mapping and standardization utilities
 */

import { TokenSafetyProps, TokenSafetyResult, TokenSafetyResultWithSol } from '../main/api/token-safety/types/token'

// Standard chain name mapping table
export const CHAIN_NAME_MAPPING: Record<string, string> = {
  // Ethereum and variants
  ethereum: 'ethereum',
  eth: 'ethereum',
  ether: 'ethereum',

  // BSC and variants
  bsc: 'bsc',
  binance: 'bsc',
  bnb: 'bsc',

  // Polygon and variants
  polygon: 'polygon',
  matic: 'polygon',

  // Solana and variants
  solana: 'solana',
  sol: 'solana',

  // Avalanche and variants
  avalanche: 'avalanche',
  avax: 'avalanche',

  // Arbitrum and variants
  arbitrum: 'arbitrum',
  arb: 'arbitrum',

  // Optimism and variants
  optimism: 'optimism',
  op: 'optimism',

  // Fantom and variants
  fantom: 'fantom',
  ftm: 'fantom',

  // Base
  base: 'base',

  // ZkSync Era and variants
  zksync: 'zksync era',
  'zksync era': 'zksync era',

  // Linea and variants
  linea: 'linea mainnet',
  'linea mainnet': 'linea mainnet',

  // Additional chains
  scroll: 'scroll',
  zkfair: 'zkfair',
  fon: 'fon',
  kcc: 'kcc',
  hashkey: 'hashkey',
  'hashkey chain': 'hashkey chain',
  zircuit: 'zircuit',
  merlin: 'merlin',
  morph: 'morph',
  heco: 'heco',
  cronos: 'cronos',
  story: 'story',
  gnosis: 'gnosis',
  solsui: 'solsui',
  abstract: 'abstract',
  tron: 'tron',
  mantle: 'mantle',
  berachain: 'berachain',
  bera: 'berachain',
  bitlayer: 'bitlayer mainnet',
  'bitlayer mainnet': 'bitlayer mainnet',
  ethw: 'ethw',
  zklink: 'zklink nova',
  'zklink nova': 'zklink nova',
  world: 'world chain',
  'world chain': 'world chain',
  monad: 'monad',
  gravity: 'gravity',
  soneium: 'soneium',
  'x layer': 'x layer mainnet',
  'x layer mainnet': 'x layer mainnet',
  sonic: 'sonic',
  manta: 'manta pacific',
  'manta pacific': 'manta pacific',
  blast: 'blast',
  okc: 'okc',
  opbnb: 'opbnb',
}

/**
 * Normalizes any chain name to standard format
 * @param chain Input chain name
 * @returns Standardized chain name
 */
export const normalizeChainName = (chain: string): string | null => {
  if (!chain) return null

  const normalizedChain = chain.toLowerCase().trim()
  return CHAIN_NAME_MAPPING[normalizedChain] || null
}

/**
 * Transform token risks to standardized format
 * @param result Original token safety result
 * @returns Standardized TokenSafetyProps
 */
export const transformRisks = (result: TokenSafetyResult): TokenSafetyProps => {
  const risks = result?.risks || {}

  return {
    chain: result?.chain,
    ca: result?.ca,
    risks: {
      /**
       * IsLiquidityPoolLocked
       */
      risks1: risks?.selfdestruct || false,

      /**
       * IsHoneypotContract
       */
      risks2: risks?.is_honeypot || false,

      /**
       * IsContractOpenSource
       */
      risks3: risks?.is_open_source || false,

      /**
       * IsOwnerChangeBalance
       */
      risks4: risks?.owner_change_balance || risks?.can_take_back_ownership || risks?.hidden_owner || false,
    },
    name: result?.risks?.token_name,
    symbol: result?.risks?.token_symbol,
  }
}

/**
 * Transform SOL token risks to standardized format
 * @param result Original SOL token safety result
 * @returns Standardized TokenSafetyProps
 */
export const transformSolRisks = (result: TokenSafetyResultWithSol): TokenSafetyProps => {
  const risks = result?.risks || {}

  return {
    chain: 'solana',
    ca: result?.ca,
    risks: {
      /**
       * Top Holders Percent
       */
      risks1: risks?.top_holders_percent * 100 || 0,

      /**
       * IsMintable
       */
      risks2: risks?.is_mintable || false,

      /**
       * IsDefaultAccountStateBlacklisted
       */
      risks3: risks?.default_account_state === '1' || false,

      /**
       * IsClosable
       */
      risks4: risks?.closable || risks?.balance_mutable || false,
    },
    name: result?.risks?.name,
    symbol: result?.risks?.symbol,
  }
}
