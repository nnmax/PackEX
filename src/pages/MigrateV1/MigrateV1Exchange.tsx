import { Currency, CurrencyAmount, Fraction, JSBI, Token, TokenAmount, WETH } from '@nnmax/uniswap-sdk-v2'
import { Text } from 'rebass'
import CurrencyLogo from '../../components/CurrencyLogo'
import { AutoRow, RowBetween, RowFixed } from '../../components/Row'
import { useActiveWeb3React } from '../../hooks'
import { TYPE } from '../../theme'

const POOL_CURRENCY_AMOUNT_MIN = new Fraction(JSBI.BigInt(1), JSBI.BigInt(1000000))

function FormattedPoolCurrencyAmount({ currencyAmount }: { currencyAmount: CurrencyAmount }) {
  return (
    <>
      {currencyAmount.equalTo(JSBI.BigInt(0))
        ? '0'
        : currencyAmount.greaterThan(POOL_CURRENCY_AMOUNT_MIN)
          ? currencyAmount.toSignificant(4)
          : `<${POOL_CURRENCY_AMOUNT_MIN.toSignificant(1)}`}
    </>
  )
}

export function V1LiquidityInfo({
  token,
  liquidityTokenAmount,
  tokenWorth,
  ethWorth,
}: {
  token: Token
  liquidityTokenAmount: TokenAmount
  tokenWorth: TokenAmount
  ethWorth: CurrencyAmount
}) {
  const { chainId } = useActiveWeb3React()

  return (
    <>
      <AutoRow style={{ justifyContent: 'flex-start', width: 'fit-content' }}>
        <CurrencyLogo size="24px" currency={token} />
        <div style={{ marginLeft: '.75rem' }}>
          <TYPE.mediumHeader>
            {<FormattedPoolCurrencyAmount currencyAmount={liquidityTokenAmount} />}{' '}
            {chainId && token.equals(WETH[chainId]) ? 'WETH' : token.symbol}/ETH
          </TYPE.mediumHeader>
        </div>
      </AutoRow>

      <RowBetween my="1rem">
        <Text fontSize={16} fontWeight={500}>
          Pooled {chainId && token.equals(WETH[chainId]) ? 'WETH' : token.symbol}:
        </Text>
        <RowFixed>
          <Text fontSize={16} fontWeight={500} marginLeft={'6px'}>
            {tokenWorth.toSignificant(4)}
          </Text>
          <CurrencyLogo size="20px" style={{ marginLeft: '8px' }} currency={token} />
        </RowFixed>
      </RowBetween>
      <RowBetween mb="1rem">
        <Text fontSize={16} fontWeight={500}>
          Pooled ETH:
        </Text>
        <RowFixed>
          <Text fontSize={16} fontWeight={500} marginLeft={'6px'}>
            <FormattedPoolCurrencyAmount currencyAmount={ethWorth} />
          </Text>
          <CurrencyLogo size="20px" style={{ marginLeft: '8px' }} currency={Currency.ETHER} />
        </RowFixed>
      </RowBetween>
    </>
  )
}
