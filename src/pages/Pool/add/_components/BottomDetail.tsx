import clsx from 'clsx'
import { useState } from 'react'
import ArrowDown from '@/components/Icons/ArrowDown'
import { Price, Trade } from '@nnmax/uniswap-sdk-v2'
import { computeTradePriceBreakdown } from '@/utils/prices'
import { useLastTruthy } from '@/hooks/useLast'
import { ONE_BIPS } from '@/constants'
import { useUserSlippageTolerance } from '@/state/user/hooks'

export default function BottomDetail(props: { price?: Price; showInverted: boolean; trade?: Trade }) {
  const { showInverted, price, trade: tradeProp } = props
  const [showDetail, setShowDetail] = useState(false)

  const formattedPrice = showInverted ? price?.toSignificant(6) : price?.invert()?.toSignificant(6)

  const show = Boolean(price?.baseCurrency && price?.quoteCurrency)
  const label = showInverted
    ? `1 ${price?.baseCurrency?.symbol} = ${formattedPrice} ${price?.quoteCurrency?.symbol}`
    : `1 ${price?.quoteCurrency?.symbol} = ${formattedPrice} ${price?.baseCurrency?.symbol}`

  const lastTrade = useLastTruthy(tradeProp)
  const [allowedSlippage] = useUserSlippageTolerance()

  const trade = tradeProp ?? lastTrade ?? undefined

  const { priceImpactWithoutFee, realizedLPFee } = computeTradePriceBreakdown(trade)

  return (
    <div
      style={{
        '--rhombus-height': '4px',
      }}
      className={'after:bottom-rhombus relative mt-1 rounded-md bg-[#242424] px-6 py-4 text-xs'}
    >
      <div className={'flex items-center justify-between'}>
        <span className={'text-white'}>{show ? label : '-'}</span>
        <div className={'flex items-center gap-1'}>
          <span className={'text-xl'}>
            <Fa6SolidGasPump />
          </span>
          <span>{'$ 1213.22131224'}</span>
          <button
            type={'button'}
            title={'Click to show details'}
            aria-label={'Click to show details'}
            className={'flex h-5 w-5 items-center justify-center'}
            onClick={() => setShowDetail((prev) => !prev)}
          >
            <ArrowDown
              className={clsx(
                'ml-1.5 text-lemonYellow transition-transform duration-300',
                showDetail ? 'rotate-180 transform' : '',
              )}
            />
          </button>
        </div>
      </div>
      <p className={'mt-3 flex h-6 items-center bg-[#FF2323] px-2 text-white'}>{'HIGH PRICE IMPACT -2.54%'}</p>
      <div
        className={clsx(
          'flex flex-col gap-4 overflow-hidden text-white transition-all duration-300',
          showDetail ? 'h-36 py-4' : 'h-0',
        )}
      >
        <p className={'flex items-center justify-between'}>
          <span>{'PRICE IMPACT'}</span>
          <span>
            {priceImpactWithoutFee
              ? priceImpactWithoutFee.lessThan(ONE_BIPS)
                ? '<0.01%'
                : `${priceImpactWithoutFee.toFixed(2)}%`
              : '-'}
          </span>
        </p>
        <p className={'flex items-center justify-between'}>
          <span>{'MAX SLIPPAGE'}</span>
          <span>{allowedSlippage / 100}%</span>
        </p>
        <p className={'flex items-center justify-between'}>
          <span>{'LP FEE'}</span>
          <span>
            {realizedLPFee && trade ? `${realizedLPFee.toSignificant(4)} ${trade.inputAmount.currency.symbol}` : '-'}
          </span>
        </p>
        <p className={'-mt-1 flex items-center justify-between'}>
          <span>{'NETWORK COST'}</span>
          <span className={'flex items-center gap-2'}>
            <span className={'text-xl text-[#9E9E9E]'}>
              <Fa6SolidGasPump />
            </span>
            <span>{'$ 3.24'}</span>
          </span>
        </p>
      </div>
    </div>
  )
}

function Fa6SolidGasPump(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns={'http://www.w3.org/2000/svg'} width={'1em'} height={'1em'} viewBox={'0 0 512 512'} {...props}>
      <path
        fill={'currentColor'}
        d={
          'M32 64C32 28.7 60.7 0 96 0h160c35.3 0 64 28.7 64 64v192h8c48.6 0 88 39.4 88 88v32c0 13.3 10.7 24 24 24s24-10.7 24-24V222c-27.6-7.1-48-32.2-48-62V96l-32-32c-8.8-8.8-8.8-23.2 0-32s23.2-8.8 32 0l77.3 77.3c12 12 18.7 28.3 18.7 45.3V376c0 39.8-32.2 72-72 72s-72-32.2-72-72v-32c0-22.1-17.9-40-40-40h-8v144c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32-14.3-32-32s14.3-32 32-32zm64 16v96c0 8.8 7.2 16 16 16h128c8.8 0 16-7.2 16-16V80c0-8.8-7.2-16-16-16H112c-8.8 0-16 7.2-16 16'
        }
      />
    </svg>
  )
}
