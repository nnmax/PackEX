import clsx from 'clsx'
import { Price, Trade } from '@nnmax/uniswap-sdk-v2'
// import { useLastTruthy } from '@/hooks/useLast'

export default function BottomDetail(props: { price?: Price; showInverted: boolean; trade?: Trade }) {
  const { trade: tradeProp } = props

  console.log(tradeProp)

  return (
    <div
      style={{
        '--rhombus-height': '4px',
      }}
      className={'after:bottom-rhombus relative mt-1 rounded-md bg-[#242424] px-6 py-4 text-xs'}
    >
      <div
        className={clsx('flex flex-col gap-4 overflow-hidden text-[#9E9E9E] transition-all duration-300', 'h-36 py-4')}
      >
        <p className={'flex items-center justify-between'}>
          <span>{'PRICES AND POOL SHARE'}</span>
        </p>
        <p className={'flex items-center justify-between'}>
          <span>{'ETH PER USDB'}</span>
          <span>{'0'}</span>
        </p>
        <p className={'flex items-center justify-between'}>
          <span>{'USDB PER ETH'}</span>
          <span>{'0'}</span>
        </p>
        <p className={'-mt-1 flex items-center justify-between'}>
          <span>{'SHARE OF POOL'}</span>
          <span className={'flex items-center gap-2'}>
            <span>{'0.01%'}</span>
          </span>
        </p>
      </div>
    </div>
  )
}
