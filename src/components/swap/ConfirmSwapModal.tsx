import { Trade } from '@nnmax/uniswap-sdk-v2'
import AriaModal from '@/components/AriaModal'
import { Heading } from 'react-aria-components'
import CurrencyLogo from '@/components/CurrencyLogo'
import Steps from '@/components/Steps'

export default function ConfirmSwapModal({
  trade,
  onOpenChange,
  isOpen,
  activeStep,
}: {
  isOpen: boolean
  trade: Trade
  onOpenChange: () => void
  activeStep: number
}) {
  return (
    <AriaModal isOpen={isOpen} onOpenChange={onOpenChange}>
      <div className={'flex justify-center mb-4'}>
        <span className={'loading'} />
      </div>
      <Heading slot={'title'} className={'text-sm'}>
        {'PREVIEW SWAP'}
      </Heading>
      <hr className={'mb-6 mt-1.5 h-px w-full border-none bg-[#6A6A6A]'} />
      <dl className={'flex flex-col gap-8'}>
        <div>
          <dt className={'mb-4 text-xs text-[#9E9E9E]'}>{'YOU PAY'}</dt>
          <dd className={'flex items-center justify-between'}>
            <span
              className={'text-base'}
            >{`${trade.inputAmount.toSignificant(6)} ${trade.inputAmount.currency.symbol}`}</span>
            <CurrencyLogo currency={trade.inputAmount.currency} size={'20px'} />
          </dd>
        </div>
        <div>
          <dt className={'mb-4 text-xs text-[#9E9E9E]'}>{'YOU RECEIVE'}</dt>
          <dd className={'flex items-center justify-between'}>
            <span
              className={'text-base'}
            >{`${trade.inputAmount.toSignificant(6)} ${trade.inputAmount.currency.symbol}`}</span>
            <CurrencyLogo currency={trade.outputAmount.currency} size={'20px'} />
          </dd>
        </div>
      </dl>
      <hr className={'mb-4 mt-6 h-px w-full border-none bg-[#6A6A6A]'} />
      <Steps steps={['APPROVE OLE SPENDING', 'CONFIRM SWAP IN WALLET']} activeStep={activeStep} />
    </AriaModal>
  )
}
