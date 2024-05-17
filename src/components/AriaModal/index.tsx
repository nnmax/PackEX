import clsx from 'clsx'
import { Dialog, DialogTrigger, Modal, ModalOverlay, ModalOverlayProps } from 'react-aria-components'

interface AriaModalProps extends ModalOverlayProps {
  trigger?: React.ReactNode
  children?: React.ReactNode
  maxWidth?: string
}

export default function AriaModal(props: AriaModalProps) {
  const { maxWidth, trigger, children, className, ...restProps } = props

  const content = (
    <ModalOverlay
      className={clsx(
        'fixed left-0 top-0 z-20 flex h-[--visual-viewport-height] w-screen items-start justify-center bg-black/50 data-[entering]:animate-in data-[exiting]:animate-out data-[entering]:fade-in data-[exiting]:fade-out',
      )}
      {...restProps}
    >
      <Modal
        style={{
          maxWidth,
        }}
        className={
          'relative top-[192px] w-full max-w-[480px] rounded-md bg-[#1D252E] p-14 outline-none data-[entering]:animate-in data-[exiting]:animate-out data-[entering]:zoom-in-75 data-[exiting]:zoom-out-75'
        }
      >
        <Dialog className={clsx(className, 'focus-visible:outline-none')}>{children}</Dialog>
      </Modal>
    </ModalOverlay>
  )

  if (trigger) {
    return (
      <DialogTrigger>
        {trigger}
        {content}
      </DialogTrigger>
    )
  }

  return content
}
