import { useId } from 'react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import PixelarticonsChevronLeft from '@/components/Icons/PixelarticonsChevronLeft'
import TokenBlast from '@/components/Icons/TokenBlast'

function getDeformityOne(width: number, height: number, radius: number) {
  return `path('M ${radius},0 L ${width / 2},0 L ${width / 2 + 9},7 L ${width},7 L ${width},${height} L ${radius},${height} A ${radius} ${radius} 0 0 1 0 ${height - radius} L 0,${radius} A ${radius} ${radius} 0 0 1 ${radius} 0 Z')`
}

function getDeformityTwo(width: number, height: number, radius: number) {
  return `path('M 0,7 L ${width / 2 - 9},7 L ${width / 2},0 L ${width - radius},0 A ${radius} ${radius} 0 0 1 ${width} ${radius} L ${width},${height - radius} A ${radius} ${radius} 0 0 1 ${width - radius} ${height} L 0,${height} Z')`
}

function getDeformityThree(width: number, height: number, radius: number) {
  return `path('M ${radius},0 L ${width - radius},0 A ${radius} ${radius} 0 0 1 ${width} ${radius} L ${width} ${height - radius} A ${radius} ${radius} 0 0 1 ${width - radius} ${height} L ${(width / 4) * 3},${height} L ${(width / 4) * 3 - 7},${height - 9} L ${width / 4 + 7},${height - 9} L ${width / 4},${height} L ${radius},${height} A ${radius} ${radius} 0 0 1 0 ${height - radius} L 0,${radius} A ${radius} ${radius} 0 0 1 ${radius} 0 Z')`
}

export default function Withdraw() {
  const inputId = useId()

  return (
    <div className={'py-4'}>
      <Link to={'/asset'} className={'inline-flex h-8 items-center gap-2 text-sm'}>
        <PixelarticonsChevronLeft aria-hidden className={'text-xl'} />
        {'Withdraw'}
      </Link>

      <div className={'mt-[60px] flex flex-col items-center'}>
        <div className={'flex w-[404px] flex-col gap-1'}>
          <div className={'flex gap-1 text-sm'}>
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
              <span>{'DOG'}</span>
            </div>
          </div>
          <div className={'relative rounded-md bg-[#242424] p-6'}>
            <form className={'flex flex-col gap-4'}>
              <label htmlFor={inputId} className={'text-[#9E9E9E]'}>
                {'Amount'}
              </label>
              <div className={'flex items-center'}>
                <input
                  type={'number'}
                  id={inputId}
                  className={'flex-1 bg-transparent reset-input-number focus:outline-none'}
                  defaultValue={200}
                />
                <button
                  type={'button'}
                  className={'flex h-6 w-12 items-center justify-center rounded-sm border border-white text-sm'}
                >
                  {'MAX'}
                </button>
              </div>
              <p className={'text-xs text-[#FF2323]'}>{'INSUFFICIENT FUNDS'}</p>
              <p className={'flex items-center text-xs'}>
                <span>{'AVAILABLE'}</span>
                <span className={'ml-1 inline-block rounded bg-[#0F0F0F] px-2 py-1'}>{'Dog'}</span>
                <span className={'ml-auto text-[#9E9E9E]'}>{'600'}</span>
              </p>
            </form>
          </div>
          <div
            className={'relative rounded-md bg-[#242424] p-6'}
            style={{
              clipPath: getDeformityThree(404, 184, 6),
            }}
          >
            <form className={'flex flex-col gap-4'}>
              <label htmlFor={inputId} className={'text-[#9E9E9E]'}>
                {'BITCOIN ADDRESS：'}
              </label>
              <div className={'flex items-center'}>
                {/* <input
                  type={'textarea'}
                  id={inputId}
                  className={'flex-1 bg-transparent reset-input-number focus:outline-none'}
                  defaultValue={200}
                /> */}
                <textarea
                  className={
                    'text-[12px] leading-[20px] focus:outline-none h-[64px] w-full px-[12px] py-[8px] bg-transparent border border-solid rounded border-[#9E9E9E]'
                  }
                  autoFocus
                  id={inputId}
                  rows={2}
                />
              </div>
              <p className={'text-xs text-[#FF2323]'}>{'INVALID ADDRESS'}</p>
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
            'mt-14 flex h-9 w-full max-w-60 items-center justify-center rounded border border-lemonYellow text-xs text-[#020202] bg-[#FFC300]'
          }
        >
          {'Confirm'}
        </button>
      </div>
    </div>
  )
}
