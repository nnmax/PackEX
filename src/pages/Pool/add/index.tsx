import { useHistory } from 'react-router-dom'
import PixelarticonsChevronLeft from '@/components/Icons/PixelarticonsChevronLeft'
import Settings from './_components/Settings'
import BottomDetailAdd from './_components/BottomDetailAdd'
import { CurrencyInputPanel } from './_components/ChoosePanel'
import { Button } from 'react-aria-components'
import AddIcon from '@/assets/images/add.png'
// import ConfirmButton from './_components/ConfirmButton'

export default function PoolAdd() {
  const history = useHistory()

  const goBack = () => {
    history.goBack()
  }

  return (
    <div className={'py-4'}>
      <span onClick={goBack} className={'inline-flex h-8 cursor-pointer items-center gap-2 text-sm'}>
        <PixelarticonsChevronLeft aria-hidden className={'text-xl'} />
        {'Add'}
      </span>
      <div className={'flex w-full justify-center'}>
        <div className={'px-16 py-8'}>
          <div className={'flex flex-col items-center'}>
            <div
              className={'relative flex w-full max-w-[400px] flex-col text-[#9E9E9E]'}
              style={{
                '--rhombus-bg-color': 'var(--body-bg)',
              }}
            >
              <Settings />

              <CurrencyInputPanel
                label={'ADD'}
                value={''}
                onUserInput={() => {}}
                showMaxButton={false}
                currency={null}
                onMax={undefined}
                onCurrencySelect={() => {}}
                otherCurrency={null}
                rhombus={'top'}
                className={'mt-6'}
                insufficientFunds={undefined}
              />
              <Button
                type={'button'}
                aria-label={'Switch'}
                onPress={() => {
                  // setApprovalSubmitted(false) // reset 2 step UI for approvals
                  // onSwitchTokens()
                }}
                className={
                  'absolute top-[148px] left-1/2 z-10 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-md border-4 border-[#0f0f0f] bg-[#242424]'
                }
              >
                <img src={AddIcon} alt="" />
              </Button>
              <CurrencyInputPanel
                label={'ADD'}
                value={''}
                onUserInput={() => {}}
                showMaxButton={false}
                currency={null}
                onCurrencySelect={() => {}}
                otherCurrency={null}
                rhombus={'bottom'}
                className={'mt-1'}
              />

              <BottomDetailAdd trade={undefined} price={undefined} showInverted={true} />
            </div>
          </div>
        </div>
        <div className={'w-[455px] pt-[70px]'}>
          <div className={'mb-6 text-[16px]'}>HOW IT WORKS</div>
          <p className={'text-[12px] leading-6 mb-6 [&>span]:text-lemonYellow'}>
            When you add liquidity, you will receive pool tokens representing your position. These tokens automatically
            earn <span>{'$PAX'}</span> proportional to your share of the pool, and can be redeemed at any time.
          </p>
          <p className={'text-[12px] leading-6 [&>span]:text-lemonYellow'}>
            By adding liquidity, you will earn <span>{'$PAX'}</span> from all trades on this pair, proportional to your
            share of the pool. And the 0.3% reward from the trades will be used to gift the users who provide liquidity
            for <span>{'$PAX'}</span>.
          </p>
        </div>
      </div>
    </div>
  )
}
