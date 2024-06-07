import { ChainId, Currency, currencyEquals, ETHER, WETH } from '@nnmax/uniswap-sdk-v2'
import { useMemo, useState } from 'react'
import { tryParseAmount } from '../state/swap/hooks'
import { useCurrencyBalance } from '../state/wallet/hooks'
import { useWETHContract } from './useContract'
import { useAccount, useChainId } from 'wagmi'
import { toast } from 'react-toastify'
import { isObject } from 'lodash-es'

export enum WrapType {
  NOT_APPLICABLE,
  WRAP,
  UNWRAP,
}

const NOT_APPLICABLE = { wrapType: WrapType.NOT_APPLICABLE }
/**
 * Given the selected input and output currency, return a wrap callback
 * @param inputCurrency the selected input currency
 * @param outputCurrency the selected output currency
 * @param typedValue the user input value
 */
export default function useWrapCallback(
  inputCurrency: Currency | undefined,
  outputCurrency: Currency | undefined,
  typedValue: string | undefined,
): { wrapType: WrapType; execute?: undefined | (() => Promise<void>); inputError?: string; wraping?: boolean } {
  const { address: account } = useAccount()
  const chainId: ChainId = useChainId()
  const wethContract = useWETHContract()
  const balance = useCurrencyBalance(account ?? undefined, inputCurrency)
  // we can always parse the amount typed as the input currency, since wrapping is 1:1
  const inputAmount = useMemo(() => tryParseAmount(typedValue, inputCurrency), [inputCurrency, typedValue])
  const [wraping, setWraping] = useState(false)

  return useMemo(() => {
    if (!wethContract || !chainId || !inputCurrency || !outputCurrency) return NOT_APPLICABLE

    const sufficientBalance = inputAmount && balance && !balance.lessThan(inputAmount)

    if (inputCurrency === ETHER && currencyEquals(WETH[chainId], outputCurrency)) {
      return {
        wraping,
        wrapType: WrapType.WRAP,
        execute:
          sufficientBalance && inputAmount
            ? async () => {
                try {
                  setWraping(true)
                  await wethContract.deposit({ value: `0x${inputAmount.raw.toString(16)}` })
                } catch (error) {
                  console.error('Could not deposit', error)
                  if (isObject(error) && 'code' in error && error.code === 'ACTION_REJECTED') return
                  toast.error('Could not deposit')
                } finally {
                  setWraping(false)
                }
              }
            : undefined,
        inputError: inputAmount ? (sufficientBalance ? undefined : 'Insufficient ETH balance') : 'Enter an amount',
      }
    } else if (currencyEquals(WETH[chainId], inputCurrency) && outputCurrency === ETHER) {
      return {
        wraping,
        wrapType: WrapType.UNWRAP,
        execute:
          sufficientBalance && inputAmount
            ? async () => {
                try {
                  setWraping(true)
                  await wethContract.withdraw(`0x${inputAmount.raw.toString(16)}`)
                } catch (error) {
                  console.error('Could not withdraw', error)
                  if (isObject(error) && 'code' in error && error.code === 'ACTION_REJECTED') return
                  toast.error('Could not withdraw')
                } finally {
                  setWraping(false)
                }
              }
            : undefined,
        inputError: inputAmount ? (sufficientBalance ? undefined : 'Insufficient WETH balance') : 'Enter an amount',
      }
    } else {
      return NOT_APPLICABLE
    }
  }, [wethContract, chainId, inputCurrency, outputCurrency, inputAmount, balance, wraping])
}
