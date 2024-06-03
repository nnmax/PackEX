import { Button as AriaButton, ButtonProps as AriaButtonProps } from 'react-aria-components'
import clsx from 'clsx'
import { forwardRef } from 'react'

interface AriaButtonPropsWithError extends AriaButtonProps {
  isError?: boolean
}

const BaseButtonYellow = forwardRef<HTMLButtonElement, AriaButtonProps>(function BaseButtonYellow(props, ref) {
  const { className, ...restProps } = props

  return (
    <AriaButton
      {...restProps}
      ref={ref}
      className={clsx(className, 'flex h-9 px-2 items-center justify-center self-center rounded-md text-xs')}
    />
  )
})

export const ButtonYellowLight = forwardRef<HTMLButtonElement, AriaButtonPropsWithError>(
  function ButtonYellow(props, ref) {
    const { className, isError, ...restProps } = props

    return (
      <BaseButtonYellow
        {...restProps}
        ref={ref}
        className={clsx(
          className,
          isError ? 'text-[#FF2323] border-[#FF2323]' : 'text-lemonYellow border-lemonYellow',
          'border',
        )}
      />
    )
  },
)

export const ButtonYellow = forwardRef<HTMLButtonElement, AriaButtonPropsWithError>(function ButtonYellow(props, ref) {
  const { className, isDisabled, isError, ...restProps } = props

  if (isDisabled || isError) {
    return <ButtonYellowLight isDisabled isError={isError} className={className} {...restProps} ref={ref} />
  }

  return <BaseButtonYellow {...restProps} ref={ref} className={clsx(className, 'bg-lemonYellow text-[#020202]')} />
})
