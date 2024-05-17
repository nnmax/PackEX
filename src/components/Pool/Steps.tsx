import StepFinished from '@/components/Icons/StepFinished'
import StepPending from '@/components/Icons/StepPending'
import StepProgress from '@/components/Icons/StepProgress'
import clsx from 'clsx'
import { Fragment } from 'react'

type StepStatus = 'finished' | 'progress' | 'pending'

export default function Steps(props: { steps?: React.ReactNode[]; activeStep?: number }) {
  const { steps, activeStep } = props

  const stepStatus = (index: number): StepStatus => {
    if (activeStep === undefined) return 'pending'
    if (index < activeStep) return 'finished'
    if (index === activeStep) return 'progress'
    return 'pending'
  }

  const getIcon = (status: StepStatus) => {
    if (status === 'finished') return StepFinished
    if (status === 'progress') return StepProgress
    return StepPending
  }

  return (
    <div className={'flex flex-col text-xs text-white'}>
      {(steps ?? []).map((step, index, arr) => {
        const status = stepStatus(index)
        const StatusIcon = getIcon(status)
        return (
          <Fragment key={index}>
            <div key={index} className={'flex h-5 items-center gap-2 '}>
              <StatusIcon />
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
