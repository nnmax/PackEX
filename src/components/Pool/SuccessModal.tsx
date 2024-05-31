import AriaModal from '@/components/AriaModal'
import { ButtonYellow } from '@/components/Button'
import { Heading } from 'react-aria-components'

export default function SuccessModal(props: { isOpen: boolean; onClose: () => void; content?: string }) {
  const { isOpen, onClose, content = 'TRANSACTION SUBMITTED' } = props

  return (
    <AriaModal isOpen={isOpen} onClose={onClose} showCloseButton={false} showRhombus={false}>
      <div className={'flex flex-col items-center'}>
        <div className={'w-9 h-9 mb-6 rounded-full bg-lemonYellow flex items-center justify-center'}>
          <span className="icon-[pixelarticons--check] text-2xl text-black"></span>
        </div>
        <Heading slot="title" className={'text-white'}>
          SUCCESS!
        </Heading>
        <p className={'mt-4 text-white text-xs'}>{content}</p>
        <ButtonYellow className={'!max-w-40 mt-8 w-full'} onPress={onClose}>
          OK
        </ButtonYellow>
      </div>
    </AriaModal>
  )
}
