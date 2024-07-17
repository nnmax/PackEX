import { ETHER, Token } from '@nnmax/uniswap-sdk-v2'
import type { Currency} from '@nnmax/uniswap-sdk-v2';

export function currencyId(currency: Currency): string {
  if (currency === ETHER) return 'ETH'
  if (currency instanceof Token) return currency.address
  throw new Error('invalid currency')
}
