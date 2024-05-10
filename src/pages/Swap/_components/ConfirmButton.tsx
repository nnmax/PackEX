import { Fragment, useState } from 'react'
import clsx from 'clsx'
import { Modal, Dialog, ModalOverlay, DialogTrigger, Button } from 'react-aria-components'
import StepFinishedSvg from '@/assets/images/step-finished.svg'
import StepPendingSvg from '@/assets/images/step-pending.svg'
import StepProgressSvg from '@/assets/images/step-progress.svg'
import { Trade } from '@nnmax/uniswap-sdk-v2'
import CurrencyLogo from '@/components/CurrencyLogo'

export default function ConfirmButton(props: { disabled?: boolean; onClick?: () => void; trade?: Trade }) {
  const { disabled, onClick, trade } = props
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [activeStep, setActiveStep] = useState<number>(1)

  return (
    <DialogTrigger>
      <Button
        isDisabled={disabled}
        onPress={onClick}
        className={clsx(
          'mt-8 flex h-9 w-full max-w-[240px] items-center justify-center self-center rounded-md text-xs',
          disabled ? 'text-lemonYellow border border-lemonYellow' : 'bg-lemonYellow text-[#020202]',
        )}
      >
        {'Confirm'}
      </Button>
      <ModalOverlay
        className={
          'fixed left-0 top-0 z-20 flex h-[--visual-viewport-height] w-screen items-start justify-center bg-black/50 data-[entering]:animate-in data-[exiting]:animate-out data-[entering]:fade-in data-[exiting]:fade-out'
        }
      >
        <Modal
          className={
            'relative top-[192px] w-full max-w-[480px] rounded-md bg-[#1D252E] p-14 outline-none data-[entering]:animate-in data-[exiting]:animate-out data-[entering]:zoom-in-75 data-[exiting]:zoom-out-75'
          }
        >
          <Dialog className={'focus-visible:outline-none'}>
            <h3 className={'text-sm'}>{'PREVIEW SWAP'}</h3>
            <hr className={'mb-6 mt-1.5 h-px w-full border-none bg-[#6A6A6A]'} />
            {trade ? (
              <dl className={'flex flex-col gap-8'}>
                <div>
                  <dt className={'mb-4 text-xs text-[#9E9E9E]'}>{'YOU PAY'}</dt>
                  <dd className={'flex items-center justify-between'}>
                    <span className={'text-base'}>
                      {trade.inputAmount.toSignificant(6)} {trade.inputAmount.currency.symbol}
                    </span>
                    <CurrencyLogo currency={trade.inputAmount.currency} size={'20px'} />
                  </dd>
                </div>
                <div>
                  <dt className={'mb-4 text-xs text-[#9E9E9E]'}>{'YOU RECEIVE'}</dt>
                  <dd className={'flex items-center justify-between'}>
                    <span className={'text-base'}>
                      {trade.outputAmount.toSignificant(6)} {trade.outputAmount.currency.symbol}
                    </span>
                    <CurrencyLogo currency={trade.outputAmount.currency} size={'20px'} />
                  </dd>
                </div>
              </dl>
            ) : null}
            <hr className={'mb-4 mt-6 h-px w-full border-none bg-[#6A6A6A]'} />
            <Steps steps={['APPROVE OLE SPENDING', 'CONFIRM SWAP IN WALLET']} activeStep={activeStep} />
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  )
}

type StepStatus = 'finished' | 'progress' | 'pending'

function Steps(props: { steps?: React.ReactNode[]; activeStep?: number }) {
  const { steps, activeStep } = props

  const stepStatus = (index: number): StepStatus => {
    if (activeStep === undefined) return 'pending'
    if (index < activeStep) return 'finished'
    if (index === activeStep) return 'progress'
    return 'pending'
  }

  const srcMap: Record<StepStatus, string> = {
    finished: StepFinishedSvg,
    progress: StepProgressSvg,
    pending: StepPendingSvg,
  }

  return (
    <div className={'flex flex-col text-xs text-white'}>
      {(steps ?? []).map((step, index, arr) => {
        const status = stepStatus(index)
        const src = srcMap[status]

        return (
          <Fragment key={index}>
            <div key={index} className={'flex h-5 items-center gap-2 '}>
              <img src={src} alt={''} />
              <div
                className={clsx({
                  'text-[#00B578]': status === 'finished',
                })}
              >
                {step}
              </div>
            </div>
            {index !== arr.length - 1 && (
              <div
                aria-hidden
                className={clsx('ml-[9px] h-6 w-0.5', status === 'finished' ? 'bg-[#00B578]' : 'bg-[#9E9E9E]')}
              />
            )}
          </Fragment>
        )
      })}
    </div>
  )
}
