import { Currency, Trade } from '@nnmax/uniswap-sdk-v2'
import { useCallback, useEffect, useMemo, useState } from 'react'
import ReactGA from 'react-ga'
import { getTradeVersion } from '../../data/V1'
import { useActiveWeb3React } from '../../hooks'
import { ApprovalState, useApproveCallbackFromTrade } from '../../hooks/useApproveCallback'
import useENSAddress from '../../hooks/useENSAddress'
import { useSwapCallback } from '../../hooks/useSwapCallback'
import useToggledVersion, { Version } from '../../hooks/useToggledVersion'
import useWrapCallback, { WrapType } from '../../hooks/useWrapCallback'
import { useWalletModalToggle } from '../../state/application/hooks'
import { Field } from '../../state/swap/actions'
import { useDerivedSwapInfo, useSwapActionHandlers, useSwapState } from '../../state/swap/hooks'
import { useUserDeadline, useUserSlippageTolerance } from '../../state/user/hooks'
import { maxAmountSpend } from '../../utils/maxAmountSpend'
import Settings from './_components/Settings'
import BottomDetail from './_components/BottomDetail'
import { CurrencyInputPanel } from './_components/ChoosePanel'
import ConfirmButton from './_components/ConfirmButton'
import { Button } from 'react-aria-components'
import Wallet from '@/components/Icons/Wallet'

export default function Swap() {
  const { account } = useActiveWeb3React()

  // toggle wallet when disconnected
  const toggleWalletModal = useWalletModalToggle()

  // get custom setting values for user
  const [deadline] = useUserDeadline()
  const [allowedSlippage] = useUserSlippageTolerance()

  // swap state
  const { independentField, typedValue, recipient } = useSwapState()
  const {
    v1Trade,
    v2Trade,
    currencyBalances,
    parsedAmount,
    currencies,
    inputError: swapInputError,
  } = useDerivedSwapInfo()
  const { wrapType } = useWrapCallback(currencies[Field.INPUT], currencies[Field.OUTPUT], typedValue)
  const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE
  const { address: recipientAddress } = useENSAddress(recipient)
  const toggledVersion = useToggledVersion()
  const trade = showWrap
    ? undefined
    : {
        [Version.v1]: v1Trade,
        [Version.v2]: v2Trade,
      }[toggledVersion]

  const parsedAmounts = useMemo(
    () =>
      showWrap
        ? {
            [Field.INPUT]: parsedAmount,
            [Field.OUTPUT]: parsedAmount,
          }
        : {
            [Field.INPUT]: independentField === Field.INPUT ? parsedAmount : trade?.inputAmount,
            [Field.OUTPUT]: independentField === Field.OUTPUT ? parsedAmount : trade?.outputAmount,
          },
    [independentField, parsedAmount, showWrap, trade?.inputAmount, trade?.outputAmount],
  )

  const { onSwitchTokens, onCurrencySelection, onUserInput } = useSwapActionHandlers()
  const isValid = !swapInputError
  const dependentField = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT

  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(Field.INPUT, value)
    },
    [onUserInput],
  )
  const handleTypeOutput = useCallback(
    (value: string) => {
      onUserInput(Field.OUTPUT, value)
    },
    [onUserInput],
  )

  // modal and loading
  const [{ showConfirm, tradeToConfirm }, setSwapState] = useState<{
    showConfirm: boolean
    tradeToConfirm: Trade | undefined
    attemptingTxn: boolean
    swapErrorMessage: string | undefined
    txHash: string | undefined
  }>({
    showConfirm: false,
    tradeToConfirm: undefined,
    attemptingTxn: false,
    swapErrorMessage: undefined,
    txHash: undefined,
  })

  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: showWrap
      ? parsedAmounts[independentField]?.toExact() ?? ''
      : parsedAmounts[dependentField]?.toSignificant(6) ?? '',
  }

  const insufficientFunds = useMemo(() => {
    if (parsedAmounts[Field.INPUT] && currencyBalances[Field.INPUT]) {
      return currencyBalances[Field.INPUT].lessThan(parsedAmounts[Field.INPUT])
    }
    return false
  }, [currencyBalances, parsedAmounts])

  // check whether the user has approved the router on the input token
  const [approval] = useApproveCallbackFromTrade(trade, allowedSlippage)

  // check if user has gone through approval process, used to show two step buttons, reset on token change
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)

  // mark when a user has submitted an approval, reset onTokenSelection for input field
  useEffect(() => {
    if (approval === ApprovalState.PENDING) {
      setApprovalSubmitted(true)
    }
  }, [approval, approvalSubmitted])

  const maxAmountInput = maxAmountSpend(currencyBalances[Field.INPUT])
  const atMaxAmountInput = Boolean(maxAmountInput && parsedAmounts[Field.INPUT]?.equalTo(maxAmountInput))

  // the callback to execute the swap
  const { callback: swapCallback } = useSwapCallback(trade, allowedSlippage, deadline, recipient)

  const handleSwap = useCallback(() => {
    // if (priceImpactWithoutFee && !confirmPriceImpactWithoutFee(priceImpactWithoutFee)) {
    //   return
    // }
    if (!swapCallback) {
      return
    }
    setSwapState({ attemptingTxn: true, tradeToConfirm, showConfirm, swapErrorMessage: undefined, txHash: undefined })
    swapCallback()
      .then((hash) => {
        setSwapState({ attemptingTxn: false, tradeToConfirm, showConfirm, swapErrorMessage: undefined, txHash: hash })

        ReactGA.event({
          category: 'Swap',
          action:
            recipient === null
              ? 'Swap w/o Send'
              : (recipientAddress ?? recipient) === account
                ? 'Swap w/o Send + recipient'
                : 'Swap w/ Send',
          label: [
            trade?.inputAmount?.currency?.symbol,
            trade?.outputAmount?.currency?.symbol,
            getTradeVersion(trade),
          ].join('/'),
        })
      })
      .catch((error) => {
        setSwapState({
          attemptingTxn: false,
          tradeToConfirm,
          showConfirm,
          swapErrorMessage: error.message,
          txHash: undefined,
        })
      })
  }, [tradeToConfirm, account, recipient, recipientAddress, showConfirm, swapCallback, trade])

  // errors
  const [showInverted] = useState<boolean>(false)

  const handleInputSelect = useCallback(
    (inputCurrency: Currency) => {
      setApprovalSubmitted(false) // reset 2 step UI for approvals
      onCurrencySelection(Field.INPUT, inputCurrency)
    },
    [onCurrencySelection],
  )

  const handleMaxInput = useCallback(() => {
    maxAmountInput && onUserInput(Field.INPUT, maxAmountInput.toExact())
  }, [maxAmountInput, onUserInput])

  const handleOutputSelect = useCallback(
    (outputCurrency: Currency) => onCurrencySelection(Field.OUTPUT, outputCurrency),
    [onCurrencySelection],
  )

  return (
    <div className={'px-16 py-8'}>
      <div className={'flex flex-col items-center'}>
        <div
          className={'relative flex w-full max-w-[400px] flex-col text-[#9E9E9E]'}
          style={{
            '--rhombus-bg-color': 'var(--body-bg)',
          }}
        >
          <Settings />

          <CurrencyInputPanel
            label={'YOU PAY'}
            value={formattedAmounts[Field.INPUT]}
            onUserInput={handleTypeInput}
            showMaxButton={!atMaxAmountInput}
            currency={currencies[Field.INPUT]}
            onMax={handleMaxInput}
            onCurrencySelect={handleInputSelect}
            otherCurrency={currencies[Field.OUTPUT]}
            rhombus={'top'}
            className={'mt-6'}
            insufficientFunds={insufficientFunds}
          />
          <Button
            type={'button'}
            aria-label={'Switch'}
            onPress={() => {
              setApprovalSubmitted(false) // reset 2 step UI for approvals
              onSwitchTokens()
            }}
            className={
              'absolute top-[148px] left-1/2 z-[1] flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-md border-4 border-[#0f0f0f] bg-[#242424]'
            }
          >
            <span className="icon-[pixelarticons--arrow-down] text-2xl text-white" aria-hidden />
          </Button>
          <CurrencyInputPanel
            label={'YOU RECEIVE'}
            value={formattedAmounts[Field.OUTPUT]}
            onUserInput={handleTypeOutput}
            showMaxButton={false}
            currency={currencies[Field.OUTPUT]}
            onCurrencySelect={handleOutputSelect}
            otherCurrency={currencies[Field.INPUT]}
            rhombus={'bottom'}
            className={'mt-1'}
          />

          <BottomDetail trade={trade} price={trade?.executionPrice} showInverted={showInverted} />

          <div className={'flex justify-center mt-8'}>
            {account ? (
              <ConfirmButton
                trade={trade}
                disabled={insufficientFunds || !isValid}
                onClick={() => {
                  handleSwap()
                }}
              />
            ) : (
              <Button
                onPress={toggleWalletModal}
                className={
                  'max-w-[240px] h-9 w-full border text-xs text-lemonYellow border-lemonYellow rounded-md flex items-center justify-center gap-6'
                }
              >
                <Wallet className={'text-xl'} />
                <span>Connect Wallet</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
