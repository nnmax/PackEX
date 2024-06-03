import { Button as AriaButton, ButtonProps as AriaButtonProps } from 'react-aria-components'
import clsx from 'clsx'
import { forwardRef } from 'react'

interface AriaButtonPropsWithError extends AriaButtonProps {
  isError?: boolean
}

const ButtonBase = forwardRef<HTMLButtonElement, AriaButtonProps>(function BaseButtonYellow(props, ref) {
  const { className, ...restProps } = props

  return (
    <AriaButton
      {...restProps}
      ref={ref}
      className={clsx(className, 'flex h-9 px-2 items-center justify-center self-center rounded-md text-xs')}
    />
  )
})

export const ButtonPrimary = forwardRef<HTMLButtonElement, AriaButtonPropsWithError>(function ButtonYellow(props, ref) {
  const { className, isDisabled, isError, ...restProps } = props

  return (
    <ButtonBase
      {...restProps}
      isDisabled={isDisabled}
      ref={ref}
      className={clsx(
        className,
        isError
          ? 'text-[#FF2323] border-[#FF2323] border'
          : isDisabled
            ? 'text-[#888] border-[#888] border'
            : 'bg-lemonYellow text-[#020202]',
      )}
    />
  )
})
