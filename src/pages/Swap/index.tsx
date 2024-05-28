import { Currency, CurrencyAmount, JSBI } from '@nnmax/uniswap-sdk-v2'
import { useCallback, useContext, useMemo, useState } from 'react'
import { ArrowDown } from 'react-feather'
import { ThemeContext } from 'styled-components'
import AddressInputPanel from '../../components/AddressInputPanel'
import Wallet from '@/components/Icons/Wallet'
import { ButtonYellowLight, ButtonYellow } from '../../components/Button'
import ConfirmSwapModal from '../../components/swap/ConfirmSwapModal'
import CurrencyInputPanel from '../../components/CurrencyInputPanel'
import { AutoRow } from '../../components/Row'
import confirmPriceImpactWithoutFee from '../../components/swap/confirmPriceImpactWithoutFee'
import { ArrowWrapper } from '../../components/swap/styleds'
import { ApprovalState, useApproveCallbackFromTrade } from '../../hooks/useApproveCallback'
import { useSwapCallback } from '../../hooks/useSwapCallback'
import useWrapCallback, { WrapType } from '../../hooks/useWrapCallback'
import { useWalletModalToggle } from '../../state/application/hooks'
import { Field } from '../../state/swap/actions'
import {
  InputErrorType,
  useDefaultsFromURLSearch,
  useDerivedSwapInfo,
  useSwapActionHandlers,
  useSwapState,
} from '../../state/swap/hooks'
import { useUserDeadline, useUserInfo, useUserSlippageTolerance } from '../../state/user/hooks'
import { LinkStyledButton } from '../../theme'
import { maxAmountSpend } from '../../utils/maxAmountSpend'
import { computeTradePriceBreakdown, warningSeverity } from '../../utils/prices'
import SlippageSetting from '@/components/SlippageSetting'
import { Button } from 'react-aria-components'
import SwapDetailAccordion from '@/components/swap/SwapDetailAccordion'
import { calculateGasMargin } from '@/utils'
import { toast } from 'react-toastify'

export default function Swap() {
  useDefaultsFromURLSearch()
  const [userInfo] = useUserInfo()

  const theme = useContext(ThemeContext)

  // toggle wallet when disconnected
  const toggleWalletModal = useWalletModalToggle()

  // get custom setting values for user
  const [deadline] = useUserDeadline()
  const [allowedSlippage] = useUserSlippageTolerance()

  // swap state
  const { independentField, typedValue, recipient } = useSwapState()
  const {
    v2Trade,
    currencyBalances,
    parsedAmount,
    currencies,
    inputError: swapInputError,
    inputErrorType,
  } = useDerivedSwapInfo()
  const {
    wrapType,
    execute: onWrap,
    inputError: wrapInputError,
  } = useWrapCallback(currencies[Field.INPUT], currencies[Field.OUTPUT], typedValue)
  const showWrap = wrapType !== WrapType.NOT_APPLICABLE
  const trade = showWrap ? undefined : v2Trade

  const parsedAmounts = showWrap
    ? {
        [Field.INPUT]: parsedAmount,
        [Field.OUTPUT]: parsedAmount,
      }
    : {
        [Field.INPUT]: independentField === Field.INPUT ? parsedAmount : trade?.inputAmount,
        [Field.OUTPUT]: independentField === Field.OUTPUT ? parsedAmount : trade?.outputAmount,
      }

  const { onSwitchTokens, onCurrencySelection, onUserInput, onChangeRecipient } = useSwapActionHandlers()

  const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT

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
  const [{ showConfirm, activeStep }, setSwapState] = useState<{
    showConfirm: boolean
    activeStep: number
    showCompleted: boolean
  }>({
    showConfirm: false,
    activeStep: 0,
    showCompleted: false,
  })

  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: showWrap
      ? parsedAmounts[independentField]?.toExact() ?? ''
      : parsedAmounts[dependentField]?.toSignificant(6) ?? '',
  }

  const route = trade?.route
  const userHasSpecifiedInputOutput = Boolean(
    currencies[Field.INPUT] && currencies[Field.OUTPUT] && parsedAmounts[independentField]?.greaterThan(JSBI.BigInt(0)),
  )
  const noRoute = !route

  // check whether the user has approved the router on the input token
  const [approval, approveCallback, approveGas] = useApproveCallbackFromTrade(trade, allowedSlippage)

  const maxAmountInput: CurrencyAmount | undefined = maxAmountSpend(currencyBalances[Field.INPUT])
  const atMaxAmountInput = Boolean(maxAmountInput && parsedAmounts[Field.INPUT]?.equalTo(maxAmountInput))

  // the callback to execute the swap
  const {
    callback: swapCallback,
    error: swapCallbackError,
    gas: swapGas,
  } = useSwapCallback(trade, allowedSlippage, deadline, recipient)

  const { priceImpactWithoutFee } = computeTradePriceBreakdown(trade)

  const totalGas = useMemo(() => {
    if (approveGas && swapGas) {
      return calculateGasMargin(approveGas.add(swapGas))
    }
    if (swapGas) {
      return calculateGasMargin(swapGas)
    }
    return undefined
  }, [approveGas, swapGas])

  // warnings on slippage
  const priceImpactSeverity = warningSeverity(priceImpactWithoutFee)

  const handleSwap = useCallback(async () => {
    if (priceImpactWithoutFee && !confirmPriceImpactWithoutFee(priceImpactWithoutFee)) {
      return
    }
    if (!swapCallback) {
      return
    }
    setSwapState((prev) => ({ ...prev, activeStep: approval === ApprovalState.APPROVED ? 1 : 0, showConfirm: true }))
    if (approval !== ApprovalState.APPROVED) {
      await approveCallback()
    }
    swapCallback()
      .then(() => {
        toast('SWAP COMPLETED!')
      })
      .catch((error) => {
        toast.error(error.message)
      })
      .finally(() => {
        setSwapState((prev) => ({ ...prev, activeStep: 0, showConfirm: false }))
      })
  }, [approval, approveCallback, priceImpactWithoutFee, swapCallback])

  const handleConfirmDismiss = useCallback(() => {
    setSwapState((prev) => ({ ...prev, showCompleted: false, showConfirm: false, activeStep: 0 }))
    onUserInput(Field.INPUT, '')
  }, [onUserInput])

  const handleInputSelect = useCallback(
    (inputCurrency: Currency) => {
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
    <div className={'flex flex-col items-center'}>
      {trade && (
        <ConfirmSwapModal
          activeStep={activeStep}
          isOpen={showConfirm}
          trade={trade}
          onOpenChange={handleConfirmDismiss}
        />
      )}
      <div
        className={'flex w-full relative max-w-[400px] flex-col text-[#9E9E9E] mt-9'}
        style={{
          '--rhombus-bg-color': 'var(--body-bg)',
        }}
      >
        <SlippageSetting className={'self-end mb-6'} />

        <CurrencyInputPanel
          label={independentField === Field.OUTPUT && !showWrap && trade ? 'From (estimated)' : 'From'}
          value={formattedAmounts[Field.INPUT]}
          showMaxButton={!atMaxAmountInput}
          currency={currencies[Field.INPUT]}
          onUserInput={handleTypeInput}
          onMax={handleMaxInput}
          onCurrencySelect={handleInputSelect}
          otherCurrency={currencies[Field.OUTPUT]}
          rhombus="top"
          insufficientBalance={inputErrorType === InputErrorType.InsufficientBalance}
        />

        <Button
          aria-label={'Switch'}
          onPress={() => {
            onSwitchTokens()
          }}
          className={
            'absolute top-[148px] left-1/2 z-[1] flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-md border-4 border-[#0f0f0f] bg-[#242424]'
          }
        >
          <span className="icon-[pixelarticons--arrow-down] text-2xl text-white" aria-hidden />
        </Button>

        <CurrencyInputPanel
          value={formattedAmounts[Field.OUTPUT]}
          onUserInput={handleTypeOutput}
          label={independentField === Field.INPUT && !showWrap && trade ? 'To (estimated)' : 'To'}
          showMaxButton={false}
          currency={currencies[Field.OUTPUT]}
          onCurrencySelect={handleOutputSelect}
          otherCurrency={currencies[Field.INPUT]}
          rhombus="bottom"
          className={'mt-1'}
        />

        <SwapDetailAccordion trade={trade} price={trade?.executionPrice} totalGas={totalGas} />

        {recipient !== null && !showWrap ? (
          <>
            <AutoRow justify="space-between" style={{ padding: '0 1rem' }}>
              <ArrowWrapper clickable={false}>
                <ArrowDown size="16" color={theme.text2} />
              </ArrowWrapper>
              <LinkStyledButton id="remove-recipient-button" onClick={() => onChangeRecipient(null)}>
                - Remove send
              </LinkStyledButton>
            </AutoRow>
            <AddressInputPanel id="recipient" value={recipient} onChange={onChangeRecipient} />
          </>
        ) : null}

        <div className={'flex justify-center mt-8'}>
          {!userInfo ? (
            <ButtonYellowLight onPress={toggleWalletModal} className={'text-xs w-full max-w-[240px]'}>
              <Wallet className={'text-xl mr-6'} />
              <span>Connect Wallet</span>
            </ButtonYellowLight>
          ) : showWrap ? (
            <ButtonYellowLight isDisabled={Boolean(wrapInputError)} onPress={onWrap} className={'w-full max-w-[240px]'}>
              {wrapInputError ?? (wrapType === WrapType.WRAP ? 'Wrap' : wrapType === WrapType.UNWRAP ? 'Unwrap' : null)}
            </ButtonYellowLight>
          ) : noRoute && userHasSpecifiedInputOutput ? (
            <p className={'text-[#FF2323] p-2 border border-[#FF2323] rounded-sm text-center'}>
              Insufficient liquidity for this trade.
            </p>
          ) : (
            <ButtonYellow
              isError={!!swapInputError || priceImpactSeverity > 3 || !!swapCallbackError}
              className={'w-full max-w-[240px]'}
              onPress={handleSwap}
              isDisabled={!!swapInputError || priceImpactSeverity > 3 || !!swapCallbackError}
            >
              {swapInputError
                ? swapInputError
                : swapCallbackError
                  ? swapCallbackError
                  : priceImpactSeverity > 3
                    ? `Price Impact Too High`
                    : `Confirm`}
            </ButtonYellow>
          )}
        </div>
      </div>
    </div>
  )
}
