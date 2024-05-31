import AriaModal from '@/components/AriaModal'
import { ButtonYellow } from '@/components/Button'
import { Heading } from 'react-aria-components'

export default function SuccessModal(props: { isOpen: boolean; onOpenChange: (open: boolean) => void }) {
  const { isOpen, onOpenChange } = props

  return (
    <AriaModal isOpen={isOpen} onOpenChange={onOpenChange} showCloseButton={false} showRhombus={false}>
      <div className={'flex flex-col items-center'}>
        <div className={'w-9 h-9 mb-6 rounded-full bg-lemonYellow flex items-center justify-center'}>
          <span className="icon-[pixelarticons--check] text-2xl text-black"></span>
        </div>
        <Heading slot="title" className={'text-white'}>
          SUCCESS!
        </Heading>
        <p className={'mt-4 text-white text-xs'}>TRANSACTION SUBMITTED</p>
        <ButtonYellow className={'!max-w-40 mt-8 w-full'} onPress={() => onOpenChange(false)}>
          OK
        </ButtonYellow>
      </div>
    </AriaModal>
  )
}
