import AriaModal from '@/components/AriaModal'
import { ButtonPrimary } from '@/components/Button'
import Failed from '@/components/Icons/Failed'
import { useTransactionFailedModalOpen, useTransactionInProgressModalOpen } from '@/state/transactions/hooks'
import { Heading } from 'react-aria-components'

export function TransactionInProgressModal() {
  const [inProgressModalOpen] = useTransactionInProgressModalOpen()

  return (
    <AriaModal
      isOpen={inProgressModalOpen}
      isDismissable={false}
      isKeyboardDismissDisabled={false}
      showCloseButton={false}
    >
      <div className={'flex flex-col items-center py-10'}>
        <span className={'loading text-[64px] text-lemonYellow'} />
        <Heading slot={'title'} className={'mt-8'}>
          Transaction in progress
        </Heading>
      </div>
    </AriaModal>
  )
}

export function TransactionSuccessModal(props: { isOpen: boolean; onClose: () => void; content?: string }) {
  const { isOpen, onClose, content = 'TRANSACTION SUBMITTED' } = props

  return (
    <AriaModal isOpen={isOpen} onClose={onClose} showCloseButton={false} showRhombus={false}>
      <div className={'flex flex-col items-center'}>
        <div className={'w-9 h-9 rounded-full bg-lemonYellow flex items-center justify-center'}>
          <span className="icon-[pixelarticons--check] text-2xl text-black"></span>
        </div>
        <Heading slot="title" className={'text-white mt-6'}>
          SUCCESS!
        </Heading>
        <p className={'mt-6 text-white text-xs'}>{content}</p>
        <ButtonPrimary className={'w-[160px] mt-10'} onPress={onClose}>
          OK
        </ButtonPrimary>
      </div>
    </AriaModal>
  )
}

export function TransactionFailedModal() {
  const [failedModalOpen, updateFailedModalOpen] = useTransactionFailedModalOpen()

  return (
    <AriaModal isOpen={failedModalOpen} onClose={() => updateFailedModalOpen(false)}>
      <div className={'flex flex-col items-center py-10'}>
        <Failed />
        <Heading slot={'title'} className={'mt-6'}>
          FAILED
        </Heading>
        <p className={'text-xs mt-6'}>TRANSACTION DECLINED, PLEASE TRY AGAIN</p>
        <ButtonPrimary
          className={'w-[160px] mt-10'}
          onPress={() => {
            updateFailedModalOpen(false)
          }}
        >
          OK
        </ButtonPrimary>
      </div>
    </AriaModal>
  )
}