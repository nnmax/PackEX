import { cloneElement, isValidElement, useState } from 'react'

import clsx from 'clsx'
import {
  FloatingPortal,
  offset,
  safePolygon,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useRole,
  useTransitionStyles,
  shift,
  useClick,
} from '@floating-ui/react'
import { isObject } from 'lodash-es'
import useForkRef from '../../hooks/useForkRef'
import type { Placement } from '@floating-ui/react'

interface TooltipProps {
  title: React.ReactNode
  children: React.ReactElement
  floatingClassName?: string
  placement?: Placement
  defaultOpen?: boolean
  strategy?: 'fixed' | 'absolute'
  className?: string
  disabledHover?: boolean
  disabledFocus?: boolean
  style?: React.CSSProperties
  delay?:
    | number
    | Partial<{
        open: number
        close: number
      }>
}

export default function Tooltip(props: TooltipProps) {
  const {
    children: childrenProp,
    title,
    delay = 150,
    placement = 'top',
    floatingClassName,
    defaultOpen = false,
    strategy,
    className,
    disabledHover = false,
    disabledFocus = false,
    style,
  } = props

  const children = isValidElement(childrenProp) ? childrenProp : <span>{childrenProp}</span>

  const [isOpen, setIsOpen] = useState(defaultOpen)

  const { refs, floatingStyles, context } = useFloating({
    placement,
    middleware: [
      offset(8),
      shift({
        padding: 16,
      }),
    ],
    open: isOpen,
    onOpenChange: setIsOpen,
    strategy,
  })
  const hover = useHover(context, {
    enabled: !disabledHover,
    delay,
    handleClose: safePolygon({
      blockPointerEvents: true,
    }),
  })
  const click = useClick(context)
  const focus = useFocus(context, {
    enabled: !disabledFocus,
  })
  const role = useRole(context)
  const dismiss = useDismiss(context)
  const { isMounted, styles } = useTransitionStyles(context, {
    initial: {
      transform: `scale(0.75, ${0.75 ** 2})`,
      opacity: 0,
    },
    common: ({ placement: _placement }) => ({
      transformOrigin: {
        top: 'bottom',
        bottom: 'top',
        left: 'right',
        right: 'left',
        'top-start': 'bottom left',
        'top-end': 'bottom right',
        'bottom-start': 'top left',
        'bottom-end': 'top right',
        'left-start': 'top right',
        'left-end': 'bottom right',
        'right-start': 'top left',
        'right-end': 'bottom left',
      }[_placement],
    }),
  })

  const { getReferenceProps, getFloatingProps } = useInteractions([focus, hover, click, role, dismiss])

  const handleRefs = useForkRef((children as any).ref, refs.setReference)

  const floatingProps = getFloatingProps()

  return (
    <>
      {cloneElement(
        children,
        getReferenceProps({
          ...children.props,
          ref: handleRefs,
        }),
      )}
      {isMounted && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            {...floatingProps}
            style={{
              ...style,
              ...floatingStyles,
              ...(isObject(floatingProps.style) ? floatingStyles : {}),
              zIndex: 9999,
            }}
            className={clsx(floatingClassName, floatingProps.className as string)}
          >
            <div style={styles} className={clsx(className, 'max-w-[460px] rounded-md bg-[#242424] px-2 py-4 text-xs')}>
              {title}
            </div>
          </div>
        </FloatingPortal>
      )}
    </>
  )
}
