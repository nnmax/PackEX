import { Currency, CurrencyAmount, JSBI } from '@nnmax/uniswap-sdk-v2'
import { useMemo, useState } from 'react'
import { formatUnits } from '@ethersproject/units'
import { ButtonPrimary, ConnectWalletButton, SwitchChainButton } from '../../components/Button'
import ConfirmSwapModal from '../../components/swap/ConfirmSwapModal'
import CurrencyInputPanel from '../../components/CurrencyInputPanel'
import { ApprovalState, useApproveCallbackFromTrade } from '../../hooks/useApproveCallback'
import { useSwapCallback } from '../../hooks/useSwapCallback'
import useWrapCallback, { WrapType } from '../../hooks/useWrapCallback'
import { Field } from '../../state/swap/actions'
import {
  InputErrorType,
  useDefaultsFromURLSearch,
  useDerivedSwapInfo,
  useSwapActionHandlers,
  useSwapState,
} from '../../state/swap/hooks'
import { useUserDeadline, useUserInfo, useUserSlippageTolerance } from '../../state/user/hooks'
import { maxAmountSpend } from '../../utils/maxAmountSpend'
import { computeTradePriceBreakdown, warningSeverity } from '../../utils/prices'
import SlippageSetting from '@/components/SlippageSetting'
import { Button } from 'react-aria-components'
import SwapDetailAccordion from '@/components/swap/SwapDetailAccordion'
import { calculateGasMargin } from '@/utils'
import SuccessModal from '@/components/Pool/SuccessModal'
import { usePriceState } from '@/state/price/hooks'
import { BigNumber } from '@ethersproject/bignumber'
import { useGasPrice } from 'wagmi'
import useIsSupportedChainId from '@/hooks/useIsSupportedChainId'
import PriceImpactWarningModal from '@/components/swap/PriceImpactWarningModal'
import { PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN } from '@/constants'

export default function Swap() {
  useDefaultsFromURLSearch()
  const [userInfo] = useUserInfo()

  // get custom setting values for user
  const [deadline] = useUserDeadline()
  const [allowedSlippage] = useUserSlippageTolerance()
  const { data: gasPrice } = useGasPrice()
  const price = usePriceState()
  const isSupportedChainId = useIsSupportedChainId()

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
  const [successModalOpen, setSuccessModalOpen] = useState(false)
  const [priceImpactWarningModalOpen, setPriceImpactWarningModalOpen] = useState(false)
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

  const { onSwitchTokens, onCurrencySelection, onCleanSelectedCurrencies, onUserInput } = useSwapActionHandlers()

  const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT

  const handleTypeInput = (value: string) => {
    onUserInput(Field.INPUT, value)
  }
  const handleTypeOutput = (value: string) => {
    onUserInput(Field.OUTPUT, value)
  }

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
    gasLimit: swapGasLimit,
  } = useSwapCallback(trade, allowedSlippage, deadline, recipient)

  const { priceImpactWithoutFee } = computeTradePriceBreakdown(trade)

  const transactionFeeInUSD = useMemo(() => {
    if (!swapGasLimit || !gasPrice || !price) return '-'
    let value: BigNumber
    if (approveGas) {
      value = calculateGasMargin(approveGas.add(swapGasLimit)).mul(gasPrice)
    } else {
      value = calculateGasMargin(swapGasLimit).mul(gasPrice)
    }
    const result = Math.round(Number(formatUnits(value, 18)) * Number(price) * Math.pow(10, 8)) / Math.pow(10, 8)
    return result === 0 ? '< 0.00000001' : result.toString()
  }, [swapGasLimit, gasPrice, price, approveGas])

  // warnings on slippage
  const priceImpactSeverity = warningSeverity(priceImpactWithoutFee)

  const handleSwap = async () => {
    if (!swapCallback) {
      return
    }

    setSwapState((prev) => ({ ...prev, activeStep: approval === ApprovalState.APPROVED ? 1 : 0, showConfirm: true }))
    if (approval !== ApprovalState.APPROVED) {
      await approveCallback()
    }
    swapCallback()
      .then(() => {
        setSuccessModalOpen(true)
      })
      .finally(() => {
        setSwapState((prev) => ({ ...prev, activeStep: 0, showConfirm: false }))
        setPriceImpactWarningModalOpen(false)
      })
  }

  const handleConfirm = () => {
    if (!swapCallback || !isSupportedChainId || !priceImpactWithoutFee) {
      return
    }

    if (!priceImpactWithoutFee.lessThan(PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN)) {
      setPriceImpactWarningModalOpen(true)
      return
    }

    handleSwap()
  }

  const handleConfirmDismiss = () => {
    setSwapState((prev) => ({ ...prev, showCompleted: false, showConfirm: false, activeStep: 0 }))
    onUserInput(Field.INPUT, '')
  }

  const handleInputSelect = (inputCurrency: Currency) => {
    onCurrencySelection(Field.INPUT, inputCurrency)
  }

  const handleMaxInput = () => {
    maxAmountInput && onUserInput(Field.INPUT, maxAmountInput.toExact())
  }

  const handleOutputSelect = (outputCurrency: Currency) => onCurrencySelection(Field.OUTPUT, outputCurrency)

  const handleCloseSuccess = () => {
    setSuccessModalOpen(false)
    onUserInput(Field.INPUT, '')
    onUserInput(Field.OUTPUT, '')
    onCleanSelectedCurrencies()
  }

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

      <SuccessModal isOpen={successModalOpen} onClose={handleCloseSuccess} content={'SWAP COMPLETED'} />
      <PriceImpactWarningModal
        isOpen={priceImpactWarningModalOpen}
        onClose={() => setPriceImpactWarningModalOpen(false)}
        onContinue={handleSwap}
      />
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
          error={inputErrorType === InputErrorType.InsufficientBalance ? swapInputError : undefined}
          disableCurrencySelect={!isSupportedChainId}
        />

        <Button
          aria-label={'Switch'}
          onPress={onSwitchTokens}
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
          disableCurrencySelect={!isSupportedChainId}
        />

        <SwapDetailAccordion
          priceImpactSeverity={priceImpactSeverity}
          trade={trade}
          price={trade?.executionPrice}
          transactionFee={transactionFeeInUSD}
        />

        <div className={'flex justify-center mt-8'}>
          {!userInfo ? (
            <ConnectWalletButton />
          ) : !isSupportedChainId ? (
            <SwitchChainButton />
          ) : showWrap ? (
            <ButtonPrimary
              isDisabled={!!wrapInputError}
              isError={!!wrapInputError}
              onPress={onWrap}
              className={'w-full max-w-[240px]'}
            >
              {wrapInputError ?? (wrapType === WrapType.WRAP ? 'Wrap' : wrapType === WrapType.UNWRAP ? 'Unwrap' : null)}
            </ButtonPrimary>
          ) : noRoute && userHasSpecifiedInputOutput ? (
            <p className={'text-[#FF2323] p-2 border border-[#FF2323] rounded-sm text-center'}>
              Insufficient liquidity
            </p>
          ) : (
            <ButtonPrimary
              isError={!!swapInputError || priceImpactSeverity > 3 || !!swapCallbackError}
              isDisabled={!!swapInputError || priceImpactSeverity > 3 || !!swapCallbackError}
              className={'w-full max-w-[240px]'}
              onPress={handleConfirm}
            >
              {swapInputError
                ? swapInputError
                : swapCallbackError
                  ? swapCallbackError
                  : priceImpactSeverity > 3
                    ? `Price Impact Too High`
                    : `Confirm`}
            </ButtonPrimary>
          )}
        </div>
      </div>
    </div>
  )
}
