import { Contract, getAddress, ZeroAddress } from 'ethers'
import IUniswapV2Router02 from '@uniswap/v2-periphery/build/IUniswapV2Router02.json'
import { ChainId, JSBI, Percent, Token, ETHER } from '@nnmax/uniswap-sdk-v2'
import { ROUTER_ADDRESS } from '../constants'
import type { CurrencyAmount, Currency} from '@nnmax/uniswap-sdk-v2';
import type { BrowserProvider, JsonRpcSigner} from 'ethers';
import type { TokenAddressMap } from '../state/lists/hooks'

// returns the checksummed address if the address is valid, otherwise returns false
export function isAddress(value: any): string | false {
  try {
    return getAddress(value)
  } catch {
    return false
  }
}

const ETHERSCAN_URL: { [chainId in ChainId]: string } = {
  [ChainId.BLAST]: 'https://blastscan.io',
  [ChainId.BLAST_TESTNET]: 'https://testnet.blastscan.io',
}

export function getEtherscanLink(chainId: ChainId, data: string, type: 'transaction' | 'token' | 'address'): string {
  const url = ETHERSCAN_URL[chainId]
  switch (type) {
    case 'transaction': {
      return `${url}/tx/${data}`
    }
    case 'token': {
      return `${url}/token/${data}`
    }
    case 'address':
    default: {
      return `${url}/address/${data}`
    }
  }
}

// shorten the checksummed version of the input address to have 0x + 4 characters at start and end
export function shortenAddress(address: string, chars = 4, isBtcAddress = false): string {
  if (isBtcAddress) {
    return `${address.substring(0, chars)}...${address.substring(address.length - chars)}`
  }
  const parsed = isAddress(address)
  if (!parsed) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }
  return `${parsed.substring(0, chars + 2)}...${parsed.substring(address.length - chars)}`
}

// add 10%
export function calculateGasMargin(value: bigint): bigint {
  return (value * (10000n + 1000n)) / 10000n
}

// converts a basis points value to a sdk percent
export function basisPointsToPercent(num: number): Percent {
  return new Percent(JSBI.BigInt(num), JSBI.BigInt(10000))
}

export function calculateSlippageAmount(value: CurrencyAmount, slippage: number): [JSBI, JSBI] {
  if (slippage < 0 || slippage > 10000) {
    throw Error(`Unexpected slippage value: ${slippage}`)
  }
  return [
    JSBI.divide(JSBI.multiply(value.raw, JSBI.BigInt(10000 - slippage)), JSBI.BigInt(10000)),
    JSBI.divide(JSBI.multiply(value.raw, JSBI.BigInt(10000 + slippage)), JSBI.BigInt(10000)),
  ]
}

// account is not optional
export function getSigner(library: BrowserProvider, account: string) {
  return library.getSigner(account)
}

// account is optional
export async function getProviderOrSigner(
  library: BrowserProvider,
  account?: string,
): Promise<BrowserProvider | JsonRpcSigner> {
  try {
    return account ? await getSigner(library, account) : library
  } catch (error) {
    return library
  }
}

// account is optional
export async function getContract(address: string, ABI: any, library: BrowserProvider, account?: string) {
  if (!isAddress(address) || address === ZeroAddress) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }

  return new Contract(address, ABI, await getProviderOrSigner(library, account))
}

// account is optional
export function getRouterContract(_: number, library: BrowserProvider, account?: string) {
  return getContract(ROUTER_ADDRESS, IUniswapV2Router02.abi, library, account)
}

export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}

export function isTokenOnList(defaultTokens: TokenAddressMap, currency?: Currency): boolean {
  if (currency === ETHER) return true
  return Boolean(currency instanceof Token && defaultTokens[currency.chainId]?.[currency.address])
}
