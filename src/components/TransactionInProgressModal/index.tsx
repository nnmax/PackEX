import AriaModal from '@/components/AriaModal'
import { Heading } from 'react-aria-components'

export default function TransactionInProgressModal(props: { isOpen: boolean }) {
  const { isOpen } = props

  return (
    <AriaModal isOpen={isOpen} isDismissable={false} isKeyboardDismissDisabled={false} showCloseButton={false}>
      <div className={'flex flex-col items-center py-10'}>
        <span className={'loading text-[64px] text-lemonYellow'} />
        <Heading slot={'title'} className={'mt-8'}>
          Transaction in progress
        </Heading>
      </div>
    </AriaModal>
  )
}
