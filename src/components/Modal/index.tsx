import clsx from 'clsx'
import { Button, Dialog, DialogTrigger, Modal as AriaModal, ModalOverlay } from 'react-aria-components'
import { BODY_BG_COLOR } from '@/constants'
import { alphaCompositing, alphaToHex } from '@/utils/color'
import type { ModalOverlayProps } from 'react-aria-components'

interface ModalProps extends ModalOverlayProps {
  trigger?: React.ReactNode
  children?: React.ReactNode
  maxWidth?: string
  onClose?: () => void
  contentClassName?: string
  padding?: string
  showRhombus?: boolean
  showCloseButton?: boolean
  'aria-label'?: string
}

const DIALOG_MASK_BG_COLOR = '#000000'
const DIALOG_MASK_BG_OPACITY = 0.6

export default function Modal(props: ModalProps) {
  const {
    maxWidth,
    trigger,
    children,
    className,
    onClose,
    onOpenChange,
    contentClassName,
    isDismissable = true,
    style,
    padding,
    showRhombus = true,
    showCloseButton = true,
    'aria-label': ariaLabel,
    ...restProps
  } = props

  const content = (
    <ModalOverlay
      className={clsx(
        'fixed left-0 top-0 z-20 flex h-[--visual-viewport-height] w-screen items-center justify-center bg-black/50 data-[entering]:animate-in data-[exiting]:animate-out data-[entering]:fade-in data-[exiting]:fade-out',
      )}
      style={{
        backgroundColor: DIALOG_MASK_BG_COLOR + alphaToHex(DIALOG_MASK_BG_OPACITY),
        '--rhombus-bg-color': alphaCompositing(DIALOG_MASK_BG_COLOR, BODY_BG_COLOR, DIALOG_MASK_BG_OPACITY),
      }}
      isDismissable={isDismissable}
      onOpenChange={(changedOpen) => {
        if (onOpenChange) onOpenChange(changedOpen)
        if (!changedOpen && onClose) onClose()
      }}
      {...restProps}
    >
      <AriaModal
        style={{
          maxWidth,
          padding,
          ...style,
        }}
        className={clsx(
          className,
          showRhombus && 'before:top-rhombus after:bottom-rhombus',
          'relative w-full max-w-[480px] max-h-[calc(100vh-32px)] overflow-y-auto rounded-lg bg-[#1D252E] px-4 py-8 outline-none data-[entering]:animate-in data-[exiting]:animate-out data-[entering]:zoom-in-75 data-[exiting]:zoom-out-75',
        )}
      >
        <Dialog aria-label={ariaLabel} className={clsx(contentClassName, 'focus-visible:outline-none')}>
          {showCloseButton && (
            <Button
              autoFocus
              className={'absolute right-5 top-5 h-6 w-6'}
              onPress={() => {
                if (onClose) onClose()
                if (onOpenChange) onOpenChange(false)
              }}
            >
              <span className={'icon-[pixelarticons--close] text-2xl'} />
            </Button>
          )}
          {children}
        </Dialog>
      </AriaModal>
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
