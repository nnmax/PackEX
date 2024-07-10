import { ChainId, JSBI, Percent, Token, WETH } from '@nnmax/uniswap-sdk-v2'
import type { HexColor } from '../utils/color'

export const ROUTER_ADDRESS = import.meta.env.VITE_ROUTER_ADDRESS!

// a list of tokens by chain
type ChainTokenList = {
  readonly [chainId in ChainId]: Token[]
}

const WETH_ONLY: ChainTokenList = {
  [ChainId.BLAST]: [WETH[ChainId.BLAST]],
  [ChainId.BLAST_TESTNET]: [WETH[ChainId.BLAST_TESTNET]],
}

const [BLAST_TESTNET_USDB_ADDRESS, BLAST_USDB_ADDRESS] = [
  import.meta.env.VITE_BLAST_TESTNET_USDB_ADDRESS,
  import.meta.env.VITE_BLAST_USDB_ADDRESS,
]

if (!BLAST_TESTNET_USDB_ADDRESS) {
  throw new Error(`VITE_BLAST_TESTNET_USDB_ADDRESS must be a defined environment variable`)
}

if (!BLAST_USDB_ADDRESS) {
  throw new Error(`VITE_BLAST_USDB_ADDRESS must be a defined environment variable`)
}

export const USDB = {
  [ChainId.BLAST]: new Token(ChainId.BLAST, BLAST_USDB_ADDRESS, 18, 'USDB', 'USDB'),
  [ChainId.BLAST_TESTNET]: new Token(ChainId.BLAST_TESTNET, BLAST_TESTNET_USDB_ADDRESS, 18, 'USDB', 'USDB'),
}

// used to construct intermediary pairs for trading
export const BASES_TO_CHECK_TRADES_AGAINST: ChainTokenList = {
  ...WETH_ONLY,
  [ChainId.BLAST_TESTNET]: [...WETH_ONLY[ChainId.BLAST_TESTNET], USDB[ChainId.BLAST_TESTNET]],
  [ChainId.BLAST]: [...WETH_ONLY[ChainId.BLAST], USDB[ChainId.BLAST]],
}

/**
 * Some tokens can only be swapped via certain pairs, so we override the list of bases that are considered for these
 * tokens.
 */
export const CUSTOM_BASES: { [chainId in ChainId]?: { [tokenAddress: string]: Token[] } } = {}

// used for display in the default list when adding liquidity
export const SUGGESTED_BASES: ChainTokenList = {
  ...WETH_ONLY,
}

export const NetworkContextName = 'NETWORK'

// default allowed slippage, in bips
export const INITIAL_ALLOWED_SLIPPAGE = 50
// 20 minutes, denominated in seconds
export const DEFAULT_DEADLINE_FROM_NOW = 60 * 20

// one basis point
export const ONE_BIPS = new Percent(JSBI.BigInt(1), JSBI.BigInt(10000))
export const BIPS_BASE = JSBI.BigInt(10000)
// used for warning states
export const ALLOWED_PRICE_IMPACT: Percent = new Percent(JSBI.BigInt(100), BIPS_BASE) // 1%

// used to ensure the user doesn't send so much ETH so they end up with <.01
export const MIN_ETH: JSBI = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(16)) // .01 ETH
export const BETTER_TRADE_LINK_THRESHOLD = new Percent(JSBI.BigInt(75), JSBI.BigInt(10000))

export const BODY_BG_COLOR: HexColor = '#0f0f0f'

export const SIGNATURE_KEY = 'packex.signature'
export const MESSAGE_KEY = 'packex.message'
export const CURRENT_BTC_WALLET = 'packex.btc.wallet'

export const API_BASE = '/packex'

export const IS_PROD = import.meta.env.MODE === 'prod'

export const ADMIN_WHITELIST_ADDRESS = [
  '0xd4C17F2F17C37E4c3987aeD7d6812d63c9e23B5D',
  '0x6d0267156f1c6CE44Caa4BF129B76009d3d41830',
  '0x0EF11eD1B615258139051998A3Da589be44393F3',
]
