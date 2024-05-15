import { useId } from 'react'
import { useHistory } from 'react-router-dom'
import clsx from 'clsx'
import { Button } from 'react-aria-components'
import PixelarticonsChevronLeft from '@/components/Icons/PixelarticonsChevronLeft'
import WalletSvg from '@/assets/svg/wallet.svg'
import SlippageSetting from '@/components/swap/SlippageSetting'
import TokenBlast from '@/components/Icons/TokenBlast'

function TokenLogoTwo() {
  return (
    <div className={'relative h-6 w-6 rounded-ful'}>
      <TokenBlast className={'h-full w-full rounded-full'} />
    </div>
  )
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

      <div className={'flex justify-center'}>
        <div
          className={'flex w-full justify-center relative max-w-[400px] flex-col text-[#9E9E9E] mt-9'}
          style={{
            '--rhombus-bg-color': 'var(--body-bg)',
          }}
        >
          <SlippageSetting className={'self-end mb-6'} />
          <div
            className={clsx('relative flex flex-col rounded-md bg-[#242424] p-6', {
              'border border-[#FF2323] rhombus-bg-[#FF2323]': false,
              'before:top-rhombus': true,
            })}
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
                    style={{ '--range-color': 'var(--lemon-yellow)' }}
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
            className={clsx('relative flex flex-col rounded-md bg-[#242424] p-6', 'mt-1', {
              'border border-[#FF2323] rhombus-bg-[#FF2323]': false,
              'after:bottom-rhombus': true,
            })}
          >
            <form className={'flex flex-col gap-4'}>
              <div className={'flex items-center text-xs'}>
                <span className={'ml-1 inline-block rounded px-2 py-1'}>{'REMOVING'}</span>
                <TokenLogoTwo />
                <span className={'ml-auto text-[#9E9E9E]'}>{'600'} USDB</span>
              </div>
              <div className={'flex items-center text-xs'}>
                <span className={'ml-1 inline-block rounded px-2 py-1'}>{'REMOVING'}</span>
                <TokenLogoTwo />
                <span className={'ml-auto text-[#9E9E9E]'}>{'0'} WETH</span>
              </div>
              <div className={'flex items-center text-xs'}>
                <span className={'ml-1 inline-block rounded px-2 py-1'}>{'RATE'}</span>
                <span className={'ml-auto text-[#9E9E9E]'}>{'1 USDB = 0.000321 WETH'}</span>
              </div>
            </form>
          </div>
          <div className={'flex flex-col items-center justify-center'}>
            <button
              type={'button'}
              className={
                'mt-14 flex h-9 w-[240px] items-center justify-center rounded border border-lemonYellow text-xs text-lemonYellow'
              }
            >
              {'Confirm'}
            </button>
            <button
              type={'button'}
              className={
                'mt-14 flex h-9 w-[240px] items-center justify-center rounded border border-lemonYellow text-xs text-lemonYellow'
              }
            >
              <img src={WalletSvg} alt="icon" />
              <span className={'ml-6'}>{'Connect Wallet'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
