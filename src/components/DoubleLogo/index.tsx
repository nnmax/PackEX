import CurrencyLogo from '../CurrencyLogo'
import type { Currency } from '@nnmax/uniswap-sdk-v2'

interface DoubleCurrencyLogoProps {
  margin?: boolean
  size?: number
  currency0?: Currency
  currency1?: Currency
}

export default function DoubleCurrencyLogo({
  currency0,
  currency1,
  size = 16,
  margin = false,
}: DoubleCurrencyLogoProps) {
  return (
    <div
      className={'relative flex'}
      style={{
        marginRight: margin ? (size / 3 + 8).toString() + 'px' : '0px',
      }}
    >
      {currency0 && <CurrencyLogo currency={currency0} className={'z-[2]'} size={size.toString() + 'px'} />}
      {currency1 && (
        <CurrencyLogo
          className={'absolute z-[3]'}
          style={{
            left: (size / 2).toString() + 'px',
          }}
          currency={currency1}
          size={size.toString() + 'px'}
        />
      )}
    </div>
  )
}
