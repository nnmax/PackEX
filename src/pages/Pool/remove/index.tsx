import { useId } from 'react'
import { useHistory } from 'react-router-dom'
import { Button } from 'react-aria-components'
import PixelarticonsChevronLeft from '@/components/Icons/PixelarticonsChevronLeft'
// import { Link } from 'react-router-dom'
import WalletSvg from '@/assets/svg/wallet.svg'
// import clsx from 'clsx'
// import TokenBlast from '@/components/Icons/TokenBlast'

// function getDeformityOne(width: number, height: number, radius: number) {
//   return `path('M ${radius},0 L ${width / 2},0 L ${width / 2 + 9},7 L ${width},7 L ${width},${height} L ${radius},${height} A ${radius} ${radius} 0 0 1 0 ${height - radius} L 0,${radius} A ${radius} ${radius} 0 0 1 ${radius} 0 Z')`
// }

// function getDeformityTwo(width: number, height: number, radius: number) {
//   return `path('M 0,7 L ${width / 2 - 9},7 L ${width / 2},0 L ${width - radius},0 A ${radius} ${radius} 0 0 1 ${width} ${radius} L ${width},${height - radius} A ${radius} ${radius} 0 0 1 ${width - radius} ${height} L 0,${height} Z')`
// }

function getDeformityThree(width: number, height: number, radius: number) {
  return `path('M ${radius},0 L ${width - radius},0 A ${radius} ${radius} 0 0 1 ${width} ${radius} L ${width} ${height - radius} A ${radius} ${radius} 0 0 1 ${width - radius} ${height} L ${(width / 4) * 3},${height} L ${(width / 4) * 3 - 7},${height - 9} L ${width / 4 + 7},${height - 9} L ${width / 4},${height} L ${radius},${height} A ${radius} ${radius} 0 0 1 0 ${height - radius} L 0,${radius} A ${radius} ${radius} 0 0 1 ${radius} 0 Z')`
}

const commonSpanStyles = {
  className: `text-[#9E9E9E] text-center leading-6 w-12 h-6 border border-[#9E9E9E]`,
}

export default function PoolRemove() {
  const history = useHistory()

  const goBack = () => {
    history.goBack()
  }
  const inputId = useId()

  return (
    <div className={'py-4'}>
      <div className={'py-4'}>
        <span onClick={goBack} className={'inline-flex h-8 items-center gap-2 text-sm'}>
          <PixelarticonsChevronLeft aria-hidden className={'text-xl'} />
          {'Remove'}
        </span>
      </div>
      <div className={'mt-[60px] flex flex-col items-center'}>
        <div className={'flex w-[404px] flex-col gap-1'}>
          {/* <div className={'flex gap-1 text-sm'}>
            <div
              className={clsx('flex h-[60px] flex-1 items-center rounded-l-md bg-[#242424] px-6 py-5')}
              style={{
                clipPath: getDeformityOne(200, 60, 6),
              }}
            >
              <span className={'mr-2 text-[#9E9E9E]'}>{'Chain'}</span>
              <TokenBlast className={'mr-1 text-xl'} />
              <span>{'BLAST'}</span>
            </div>
            <div
              className={clsx('flex flex-1 items-center rounded-r-md bg-[#242424] px-6 py-5')}
              style={{
                clipPath: getDeformityTwo(200, 60, 6),
              }}
            >
              <span className={'mr-2 text-[#9E9E9E]'}>{'Token'}</span>
              <TokenBlast className={'mr-1 text-xl'} />
              <span>{'BLAST'}</span>
            </div>
          </div> */}
          <div
            className={'relative rounded-md bg-[#242424] p-6'}
            // style={{
            //   clipPath: getDeformityOne(404, 184, 6),
            // }}
          >
            <form className={'flex flex-col gap-4'}>
              <label htmlFor={inputId} className={'text-[#9E9E9E] text-xs'}>
                {'YOU REMOVE'}
              </label>
              <div className={'flex flex-col gap-4'}>
                <div className={'relative h-7 w-16 rounded-sm'}>
                  <input
                    type={'number'}
                    defaultValue={0.5}
                    step={0.1}
                    min={0}
                    max={100}
                    className={'h-full w-full bg-transparent py-2 pl-2.5 pr-3 reset-input-number'}
                  />
                  <span className={'absolute right-2.5 top-1/2 -translate-y-1/2'}>{'%'}</span>
                </div>
                <div>
                  <input
                    type={'range'}
                    className={'range w-full'}
                    min={0}
                    max={100}
                    step={0.1}
                    style={{ '--range-color': 'var(--lemon-yellow)' } as any}
                  />
                </div>
              </div>
              <div className={'flex items-center justify-start text-xs gap-4'}>
                <Button {...commonSpanStyles}>{'25%'}</Button>
                <Button {...commonSpanStyles}>{'50%'}</Button>
                <Button {...commonSpanStyles}>{'75%'}</Button>
                <Button {...commonSpanStyles}>{'MAX'}</Button>
              </div>
            </form>
          </div>
          <div
            className={'relative rounded-md bg-[#242424] p-6'}
            style={{
              clipPath: getDeformityThree(404, 184, 6),
            }}
          >
            <form className={'flex flex-col gap-4'}>
              <div className={'flex items-center text-xs'}>
                <span className={'ml-1 inline-block rounded px-2 py-1'}>{'Dog'}</span>
                <span className={'ml-auto text-[#9E9E9E]'}>{'600'}</span>
              </div>
              <div className={'flex items-center text-xs'}>
                <span className={'ml-1 inline-block rounded px-2 py-1'}>{'Dog'}</span>
                <span className={'ml-auto text-[#9E9E9E]'}>{'600'}</span>
              </div>
              <div className={'flex items-center text-xs'}>
                <span className={'ml-1 inline-block rounded px-2 py-1'}>{'Dog'}</span>
                <span className={'ml-auto text-[#9E9E9E]'}>{'600'}</span>
              </div>
            </form>
          </div>
        </div>
        <button
          type={'button'}
          className={
            'mt-14 flex h-9 w-full max-w-60 items-center justify-center rounded border border-lemonYellow text-xs text-lemonYellow'
          }
        >
          {'Confirm'}
        </button>

        <button
          type={'button'}
          className={
            'mt-14 flex h-9 w-full max-w-60 items-center justify-center rounded border border-lemonYellow text-xs text-lemonYellow'
          }
        >
          <img src={WalletSvg} alt="icon" />
          <span className={'ml-6'}>{'Connect Wallet'}</span>
        </button>
      </div>
    </div>
  )
}
