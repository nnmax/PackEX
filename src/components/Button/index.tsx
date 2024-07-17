import { Button as AriaButton } from 'react-aria-components'
import clsx from 'clsx'
import { forwardRef } from 'react'
import { useAccount, useChains, useSwitchChain } from 'wagmi'
import Wallet from '@/components/Icons/Wallet'
import { useWalletModalToggle } from '@/state/application/hooks'
import type { ButtonProps as AriaButtonProps, PressEvent } from 'react-aria-components'

interface ButtonPrimaryProps extends Omit<AriaButtonProps, 'children'> {
  isError?: boolean
  isLoading?: boolean
  children?: React.ReactNode
  loadingClassName?: string
}

interface ButtonBaseProps extends Omit<ButtonPrimaryProps, 'isError'> {}

export const ButtonBase = forwardRef<HTMLButtonElement, ButtonBaseProps>(function BaseButtonYellow(props, ref) {
  const { className, children, isLoading, isDisabled, loadingClassName, ...restProps } = props

  return (
    <AriaButton
      {...restProps}
      isDisabled={isDisabled || isLoading}
      ref={ref}
      className={clsx(
        className,
        isLoading && 'text-transparent',
        'flex h-9 px-2 relative items-center justify-center self-center rounded-md text-xs',
      )}
    >
      {isLoading && (
        <span
          className={clsx(
            loadingClassName,
            'loading text-white text-xl loading-dots absolute left-1/2 -translate-x-1/2 flex',
          )}
          aria-label={'Loading'}
        />
      )}
      {children}
    </AriaButton>
  )
})

export const ButtonPrimary = forwardRef<HTMLButtonElement, ButtonPrimaryProps>(function ButtonPrimary(props, ref) {
  const { className, isDisabled, isError, children, loadingClassName, ...restProps } = props

  return (
    <ButtonBase
      {...restProps}
      isDisabled={isDisabled}
      ref={ref}
      loadingClassName={clsx(isDisabled ? '!text-[#888]' : '!text-[#020202]', loadingClassName)}
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
  const { className, isDisabled, isError, children, loadingClassName, ...restProps } = props

  return (
    <ButtonBase
      {...restProps}
      isDisabled={isDisabled}
      ref={ref}
      loadingClassName={clsx('!text-lemonYellow', loadingClassName)}
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
        {'Switch to '}
        {chain.name}
      </ButtonPrimary>
    )
  },
)

export const ConnectWalletButton = forwardRef<HTMLButtonElement, Omit<ButtonPrimaryProps, 'children'>>(
  function ConnectWalletButton(props, ref) {
    const { className, onPress, isLoading, ...restProps } = props

    const toggleWalletModal = useWalletModalToggle()
    const { isConnecting } = useAccount()

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
        isLoading={isLoading || isConnecting}
        {...restProps}
        ref={ref}
      >
        <Wallet className={'text-xl mr-6'} />
        <span>{'Connect Wallet'}</span>
      </ButtonPrimary>
    )
  },
)
