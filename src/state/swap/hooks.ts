import { parseUnits } from 'ethers'
import { CurrencyAmount, ETHER, JSBI, Token, TokenAmount } from '@nnmax/uniswap-sdk-v2'
import { useCallback, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useAccount, useChainId } from 'wagmi'
import { useKyberswapRoutes } from '@/api'
import { useCurrency } from '../../hooks/Tokens'
import { usePrefetchAllCommonPairs, useTradeExactIn, useTradeExactOut } from '../../hooks/Trades'
import useParsedQueryString from '../../hooks/useParsedQueryString'
import { isAddress } from '../../utils'
import { useCurrencyBalances } from '../wallet/hooks'
import { useUserSlippageTolerance } from '../user/hooks'
import { computeSlippageAdjustedAmounts } from '../../utils/prices'
import {
  Field,
  cleanSelectedCurrencies,
  replaceSwapState,
  selectCurrency,
  switchCurrencies,
  typeInput,
} from './actions'
import type { Currency, Trade } from '@nnmax/uniswap-sdk-v2'
import type { SwapState } from './reducer'
import type { AppDispatch, AppState } from '../index'
import type { ParsedQs } from 'qs'

export function useSwapState(): AppState['swap'] {
  return useSelector<AppState, AppState['swap']>((state) => state.swap)
}

export function useSwapActionHandlers(): {
  onCurrencySelection: (field: Field, currency: Currency | null) => void
  onSwitchTokens: () => void
  onUserInput: (field: Field, typedValue: string) => void
  onCleanSelectedCurrencies: () => void
} {
  const dispatch = useDispatch<AppDispatch>()
  const onCurrencySelection = useCallback(
    (field: Field, currency: Currency | null) => {
      dispatch(
        selectCurrency({
          field,
          currencyId: currency instanceof Token ? currency.address : currency === ETHER ? 'ETH' : '',
        }),
      )
    },
    [dispatch],
  )

  const onSwitchTokens = useCallback(() => {
    dispatch(switchCurrencies())
  }, [dispatch])

  const onUserInput = useCallback(
    (field: Field, typedValue: string) => {
      dispatch(typeInput({ field, typedValue }))
    },
    [dispatch],
  )

  const onCleanSelectedCurrencies = () => {
    dispatch(cleanSelectedCurrencies())
  }

  return {
    onSwitchTokens,
    onCurrencySelection,
    onUserInput,
    onCleanSelectedCurrencies,
  }
}

// try to parse a user entered amount for a given token
export function tryParseAmount(value?: string, currency?: Currency): CurrencyAmount | undefined {
  if (!value || !currency) {
    return undefined
  }
  try {
    const typedValueParsed = parseUnits(value, currency.decimals).toString()
    if (typedValueParsed !== '0') {
      return currency instanceof Token
        ? new TokenAmount(currency, JSBI.BigInt(typedValueParsed))
        : CurrencyAmount.ether(JSBI.BigInt(typedValueParsed))
    }
  } catch (error) {
    // should fail if the user specifies too many decimal places of precision (or maybe exceed max uint?)
    console.debug(`Failed to parse input amount: "${value}"`, error)
  }
  // necessary for all paths to return a value
  return undefined
}

const BAD_RECIPIENT_ADDRESSES: string[] = [
  '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f', // v2 factory
  '0xf164fC0Ec4E93095b804a4795bBe1e041497b92a', // v2 router 01
  '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', // v2 router 02
]

/**
 * Returns true if any of the pairs or tokens in a trade have the given checksummed address
 * @param trade to check for the given address
 * @param checksummedAddress address to check in the pairs and tokens
 */
function involvesAddress(trade: Trade, checksummedAddress: string): boolean {
  return (
    trade.route.path.some((token) => token.address === checksummedAddress) ||
    trade.route.pairs.some((pair) => pair.liquidityToken.address === checksummedAddress)
  )
}

export enum InputErrorType {
  NotConnected,
  NotInput,
  NotSelectToken,
  NotRecipient,
  InvalidRecipient,
  InsufficientBalance,
}

// from the current swap inputs, compute the best trade and return it.
export function useDerivedSwapInfo(): {
  currencies: { [field in Field]?: Token }
  currencyBalances: { [field in Field]?: CurrencyAmount }
  parsedAmount: CurrencyAmount | undefined
  v2Trade: Trade | undefined
  inputError?: string
  inputErrorType?: InputErrorType
} {
  const { address: account } = useAccount()

  usePrefetchAllCommonPairs()

  const swapState = useSwapState()
  const {
    independentField,
    typedValue,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
  } = swapState
  const { data: kyberswapRoutesData } = useKyberswapRoutes(swapState)

  const inputCurrency = useCurrency(inputCurrencyId)
  const outputCurrency = useCurrency(outputCurrencyId)
  const to = account || null

  const relevantTokenBalances = useCurrencyBalances(account ?? undefined, [
    inputCurrency ?? undefined,
    outputCurrency ?? undefined,
  ])

  const isExactIn = independentField === Field.INPUT
  const parsedAmount = useMemo(
    () => tryParseAmount(typedValue, (isExactIn ? inputCurrency : outputCurrency) ?? undefined),
    [inputCurrency, isExactIn, outputCurrency, typedValue],
  )

  const bestTradeExactIn = useTradeExactIn({
    currencyOut: outputCurrency ?? undefined,
    currencyAmountIn: isExactIn ? parsedAmount : undefined,
    kyberswapRoutesData: kyberswapRoutesData?.routeSummary,
  })
  const bestTradeExactOut = useTradeExactOut({
    currencyIn: inputCurrency ?? undefined,
    currencyAmountOut: isExactIn ? undefined : parsedAmount,
    kyberswapRoutesData: kyberswapRoutesData?.routeSummary,
  })

  const v2Trade = isExactIn ? bestTradeExactIn : bestTradeExactOut

  const currencyBalances = {
    [Field.INPUT]: relevantTokenBalances.balances[0],
    [Field.OUTPUT]: relevantTokenBalances.balances[1],
  }

  const currencies: { [field in Field]?: Token } = {
    [Field.INPUT]: inputCurrency ?? undefined,
    [Field.OUTPUT]: outputCurrency ?? undefined,
  }

  let inputError: string | undefined
  let inputErrorType: InputErrorType | undefined
  if (!account) {
    inputError = 'Connect Wallet'
    inputErrorType = InputErrorType.NotConnected
  }

  if (!parsedAmount) {
    inputError = inputError ?? 'Enter an amount'
    inputErrorType = inputErrorType ?? InputErrorType.NotInput
  }

  if (!currencies[Field.INPUT] || !currencies[Field.OUTPUT]) {
    inputError = inputError ?? 'Select a token'
    inputErrorType = inputErrorType ?? InputErrorType.NotSelectToken
  }

  const formattedTo = isAddress(to)
  if (!to || !formattedTo) {
    inputError = inputError ?? 'Enter a recipient'
    inputErrorType = inputErrorType ?? InputErrorType.NotRecipient
  } else if (
    BAD_RECIPIENT_ADDRESSES.indexOf(formattedTo) !== -1 ||
    (bestTradeExactIn && involvesAddress(bestTradeExactIn, formattedTo)) ||
    (bestTradeExactOut && involvesAddress(bestTradeExactOut, formattedTo))
  ) {
    inputError = inputError ?? 'Invalid recipient'
    inputErrorType = inputErrorType ?? InputErrorType.InvalidRecipient
  }

  const [allowedSlippage] = useUserSlippageTolerance()

  const slippageAdjustedAmounts = v2Trade && allowedSlippage && computeSlippageAdjustedAmounts(v2Trade, allowedSlippage)

  // compare input balance to max input based on version
  const [balanceIn, amountIn] = [
    currencyBalances[Field.INPUT],
    slippageAdjustedAmounts ? slippageAdjustedAmounts[Field.INPUT] : null,
  ]

  if (balanceIn && amountIn && balanceIn.lessThan(amountIn)) {
    inputError = 'Insufficient ' + amountIn.currency.symbol + ' balance'
    inputErrorType = InputErrorType.InsufficientBalance
  }

  return {
    currencies,
    currencyBalances,
    parsedAmount,
    v2Trade: v2Trade ?? undefined,
    inputError,
    inputErrorType,
  }
}

function parseCurrencyFromURLParameter(urlParam: any): string {
  if (typeof urlParam === 'string') {
    const valid = isAddress(urlParam)
    if (valid) return valid
    if (urlParam.toUpperCase() === 'ETH') return 'ETH'
    if (valid === false) return ''
  }
  return ''
}

function parseTokenAmountURLParameter(urlParam: any): string {
  return typeof urlParam === 'string' && !isNaN(parseFloat(urlParam)) ? urlParam : ''
}

function parseIndependentFieldURLParameter(urlParam: any): Field {
  return typeof urlParam === 'string' && urlParam.toLowerCase() === 'output' ? Field.OUTPUT : Field.INPUT
}

export function queryParametersToSwapState(parsedQs: ParsedQs): SwapState {
  let inputCurrency = parseCurrencyFromURLParameter(parsedQs.inputCurrency)
  let outputCurrency = parseCurrencyFromURLParameter(parsedQs.outputCurrency)
  if (inputCurrency === outputCurrency) {
    if (typeof parsedQs.outputCurrency === 'string') {
      inputCurrency = ''
    } else {
      outputCurrency = ''
    }
  }

  return {
    [Field.INPUT]: {
      currencyId: inputCurrency,
    },
    [Field.OUTPUT]: {
      currencyId: outputCurrency,
    },
    typedValue: parseTokenAmountURLParameter(parsedQs.exactAmount),
    independentField: parseIndependentFieldURLParameter(parsedQs.exactField),
  }
}

// updates the swap state to use the defaults for a given network
export function useDefaultsFromURLSearch() {
  const chainId = useChainId()
  const dispatch = useDispatch<AppDispatch>()
  const parsedQs = useParsedQueryString()

  useEffect(() => {
    if (!chainId) return
    const parsed = queryParametersToSwapState(parsedQs)

    dispatch(
      replaceSwapState({
        typedValue: parsed.typedValue,
        field: parsed.independentField,
        inputCurrencyId: parsed[Field.INPUT].currencyId,
        outputCurrencyId: parsed[Field.OUTPUT].currencyId,
      }),
    )
  }, [dispatch, chainId, parsedQs])
}
