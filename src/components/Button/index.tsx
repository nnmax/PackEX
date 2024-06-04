import { Button as AriaButton, ButtonProps as AriaButtonProps, PressEvent } from 'react-aria-components'
import clsx from 'clsx'
import { forwardRef } from 'react'
import { useChains, useSwitchChain } from 'wagmi'
import Wallet from '@/components/Icons/Wallet'
import { useWalletModalToggle } from '@/state/application/hooks'

interface ButtonPrimaryProps extends Omit<AriaButtonProps, 'children'> {
  isError?: boolean
  isLoading?: boolean
  children?: React.ReactNode
}

interface ButtonBaseProps extends Omit<ButtonPrimaryProps, 'isError'> {}

const ButtonBase = forwardRef<HTMLButtonElement, ButtonBaseProps>(function BaseButtonYellow(props, ref) {
  const { className, children, isLoading, isDisabled, ...restProps } = props

  return (
    <AriaButton
      {...restProps}
      isDisabled={isDisabled || isLoading}
      ref={ref}
      className={clsx(className, 'flex h-9 px-2 items-center justify-center self-center rounded-md text-xs')}
    >
      {isLoading && (
        <span className={'loading loading-dots absolute left-1/2 -translate-x-1/2 flex'} aria-label="Loading" />
      )}
      <span className={clsx('flex items-center', isLoading && 'text-transparent')}>{children}</span>
    </AriaButton>
  )
})

export const ButtonPrimary = forwardRef<HTMLButtonElement, ButtonPrimaryProps>(function ButtonPrimary(props, ref) {
  const { className, isDisabled, isError, children, ...restProps } = props

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
    >
      {children}
    </ButtonBase>
  )
})

export const ButtonSecondary = forwardRef<HTMLButtonElement, ButtonPrimaryProps>(function ButtonSecondary(props, ref) {
  const { className, isDisabled, isError, children, ...restProps } = props

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
            : 'text-lemonYellow border border-lemonYellow',
      )}
    >
      {children}
    </ButtonBase>
  )
})

export const SwitchChainButton = forwardRef<HTMLButtonElement, Omit<ButtonPrimaryProps, 'children'>>(
  function SwitchChainButton(props, ref) {
    const { className, onPress, ...restProps } = props

    const { switchChain, isPending: switchingChain } = useSwitchChain()
    const [chain] = useChains()

    const handleSwitchChain = (e: PressEvent) => {
      if (onPress) {
        onPress(e)
      } else {
        switchChain({
          chainId: chain.id,
        })
      }
    }

    return (
      <ButtonPrimary
        ref={ref}
        isLoading={switchingChain}
        className={clsx('px-4', className)}
        onPress={handleSwitchChain}
        {...restProps}
      >
        Switch to {chain.name}
      </ButtonPrimary>
    )
  },
)

export const ConnectWalletButton = forwardRef<HTMLButtonElement, Omit<ButtonPrimaryProps, 'children'>>(
  function ConnectWalletButton(props, ref) {
    const { className, onPress, ...restProps } = props

    const toggleWalletModal = useWalletModalToggle()

    const handleConnectWallet = (e: PressEvent) => {
      if (onPress) {
        onPress(e)
      } else {
        toggleWalletModal()
      }
    }

    return (
      <ButtonPrimary
        onPress={handleConnectWallet}
        className={clsx('w-full max-w-60', className)}
        {...restProps}
        ref={ref}
      >
        <Wallet className={'text-xl mr-6'} />
        <span>Connect Wallet</span>
      </ButtonPrimary>
    )
  },
)
