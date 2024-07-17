import { Heading } from 'react-aria-components'
import Modal from '@/components/Modal'
import { ButtonPrimary, ButtonSecondary } from '@/components/Button'

export default function PriceImpactWarningModal(props: {
  isOpen: boolean
  onClose: () => void
  onContinue: () => void
}) {
  const { isOpen, onClose, onContinue } = props

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={'flex flex-col items-center px-11 pt-4 pb-8'}>
        <span className={"icon-[pajamas--warning-solid] text-[#FF8F1F] text-[30px]"} />
        <Heading slot={'title'} className={'mt-4 mb-6'}>
          {"WARNING"}
        </Heading>
        <p className={'mb-14 text-xs leading-5'}>
          {"This transaction will result in a price impact on the market price of this pool. Do you wish to continue?"}
        </p>
        <div className={'flex justify-between w-full'}>
          <ButtonSecondary className={'w-full max-w-40'} onPress={onClose}>
            {"CANCEL"}
          </ButtonSecondary>
          <ButtonPrimary className={'w-full max-w-40'} onPress={onContinue}>
            {"CONTINUE"}
          </ButtonPrimary>
        </div>
      </div>
    </Modal>
  )
}
