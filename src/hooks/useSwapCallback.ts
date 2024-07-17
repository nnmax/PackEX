import { JSBI, Percent, Router, TradeType } from '@nnmax/uniswap-sdk-v2'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAccount, useChainId } from 'wagmi'
import { useEthersProvider } from '@/hooks/useEthersProvider'
import { BIPS_BASE } from '../constants'
import { useTransactionAdder } from '../state/transactions/hooks'
import { calculateGasMargin, getRouterContract, isAddress, shortenAddress } from '../utils'
import isZero from '../utils/isZero'
import useENS from './useENS'
import type { SwapParameters, Trade } from '@nnmax/uniswap-sdk-v2'
import type { Contract } from 'ethers'

export enum SwapCallbackState {
  INVALID,
  LOADING,
  VALID,
}

interface SwapCall {
  contract: Contract
  parameters: SwapParameters
}

interface SuccessfulCall {
  call: SwapCall
  gasEstimate: bigint
}

interface FailedCall {
  call: SwapCall
  error: Error
}

type EstimatedSwapCall = SuccessfulCall | FailedCall

/**
 * Returns the swap calls that can be used to make the trade
 * @param trade trade to execute
 * @param allowedSlippage user allowed slippage
 * @param deadline the deadline for the trade
 * @param recipientAddressOrName
 */
function useGetSwapCallArguments(
  trade: Trade | undefined, // trade to execute, required
  allowedSlippage: number, // in bips
  deadline: number, // in seconds from now
  recipientAddressOrName: string | null, // the ENS name or address of the recipient of the trade, or null if swap should be returned to sender
): () => Promise<SwapCall[]> {
  const provider = useEthersProvider()
  const { address: account } = useAccount()
  const chainId = useChainId()

  const { address: recipientAddress } = useENS(recipientAddressOrName)
  const recipient = recipientAddressOrName === null ? account : recipientAddress

  return useCallback(async () => {
    if (!trade || !recipient || !provider || !account || !chainId) return []

    const contract = await getRouterContract(chainId, provider, account)
    if (!contract) {
      return []
    }

    const swapMethods = []

    swapMethods.push(
      Router.swapCallParameters(trade, {
        feeOnTransfer: false,
        allowedSlippage: new Percent(JSBI.BigInt(allowedSlippage), BIPS_BASE),
        recipient,
        ttl: deadline,
      }),
    )

    if (trade.tradeType === TradeType.EXACT_INPUT) {
      swapMethods.push(
        Router.swapCallParameters(trade, {
          feeOnTransfer: true,
          allowedSlippage: new Percent(JSBI.BigInt(allowedSlippage), BIPS_BASE),
          recipient,
          ttl: deadline,
        }),
      )
    }

    return swapMethods.map((parameters) => ({ parameters, contract }))
  }, [account, allowedSlippage, chainId, deadline, provider, recipient, trade])
}

// returns a function that will execute a swap, if the parameters are all valid
// and the user has approved the slippage adjusted input amount for the trade
export function useSwapCallback(
  trade: Trade | undefined, // trade to execute, required
  allowedSlippage: number, // in bips
  deadline: number, // in seconds from now
  recipientAddressOrName: string | null, // the ENS name or address of the recipient of the trade, or null if swap should be returned to sender
): {
  state: SwapCallbackState
  callback: null | (() => Promise<string>)
  error: string | null
  gasLimit: bigint | undefined
} {
  const provider = useEthersProvider()
  const { address: account } = useAccount()
  const chainId = useChainId()

  const getSwapCallArguments = useGetSwapCallArguments(trade, allowedSlippage, deadline, recipientAddressOrName)
  const [gasLimit, setGasLimit] = useState<bigint>()
  const addTransaction = useTransactionAdder()

  const { address: recipientAddress } = useENS(recipientAddressOrName)
  const recipient = recipientAddressOrName === null ? account : recipientAddress

  const getSuccessfulEstimation = useCallback(async () => {
    const swapCallArguments = await getSwapCallArguments()
    const estimatedCalls: EstimatedSwapCall[] = await Promise.all(
      swapCallArguments.map((call) => {
        const {
          parameters: { methodName, args, value },
          contract,
        } = call
        const options = !value || isZero(value) ? {} : { value }
        return contract[methodName]
          .estimateGas(...args, options)
          .then((gasEstimate) => {
            return {
              call,
              gasEstimate,
            }
          })
          .catch((gasError) => {
            console.debug('Gas estimate failed, trying eth_call to extract error', call)
            return contract[methodName]
              .staticCallResult(...args, options)
              .then((result) => {
                console.debug('Unexpected successful call after failed estimate gas', call, gasError, result)
                return { call, error: new Error('Unexpected issue with estimating the gas. Please try again.') }
              })
              .catch((callError) => {
                console.debug('Call threw error', call, callError)
                let errorMessage: string
                switch (callError.reason) {
                  case 'UniswapV2Router: INSUFFICIENT_OUTPUT_AMOUNT':
                  case 'UniswapV2Router: EXCESSIVE_INPUT_AMOUNT':
                    errorMessage =
                      'This transaction will not succeed either due to price movement or fee on transfer. Try increasing your slippage tolerance.'
                    break
                  default:
                    errorMessage = `The transaction cannot succeed due to error: ${callError.reason}. This is probably an issue with one of the tokens you are swapping.`
                }
                return { call, error: new Error(errorMessage) }
              })
          })
      }),
    )

    // a successful estimation is a bignumber gas estimate and the next call is also a bignumber gas estimate
    const _successfulEstimation = estimatedCalls.find(
      (el, ix, list): el is SuccessfulCall =>
        'gasEstimate' in el && (ix === list.length - 1 || 'gasEstimate' in list[ix + 1]),
    )

    if (!_successfulEstimation) {
      setGasLimit(undefined)
      const errorCalls = estimatedCalls.filter((call): call is FailedCall => 'error' in call)
      if (errorCalls.length > 0) throw errorCalls[errorCalls.length - 1].error
      throw new Error('Unexpected error. Please contact support: none of the calls threw an error')
    }
    setGasLimit(_successfulEstimation.gasEstimate)
    return _successfulEstimation
  }, [getSwapCallArguments])

  useEffect(() => {
    getSuccessfulEstimation().catch(() => {})
  }, [getSuccessfulEstimation])

  return useMemo(() => {
    if (!trade || !provider || !account || !chainId) {
      return { state: SwapCallbackState.INVALID, gasLimit, callback: null, error: 'Missing dependencies' }
    }
    if (!recipient) {
      if (recipientAddressOrName === null) {
        return { state: SwapCallbackState.LOADING, gasLimit, callback: null, error: null }
      } else {
        return { state: SwapCallbackState.INVALID, gasLimit, callback: null, error: 'Invalid recipient' }
      }
    }

    return {
      state: SwapCallbackState.VALID,
      error: null,
      gasLimit,
      callback: async function onSwap(): Promise<string> {
        const _successfulEstimation = await getSuccessfulEstimation()

        const {
          call: {
            contract,
            parameters: { methodName, args, value },
          },
          gasEstimate,
        } = _successfulEstimation

        return contract[methodName](...args, {
          gasLimit: calculateGasMargin(gasEstimate),
          ...(value && !isZero(value) ? { value, from: account } : { from: account }),
        })
          .then((response: any) => {
            const inputSymbol = trade.inputAmount.currency.symbol
            const outputSymbol = trade.outputAmount.currency.symbol
            const inputAmount = trade.inputAmount.toSignificant(3)
            const outputAmount = trade.outputAmount.toSignificant(3)

            const base = `Swap ${inputAmount} ${inputSymbol} for ${outputAmount} ${outputSymbol}`
            const withRecipient =
              recipient === account
                ? base
                : `${base} to ${
                    recipientAddressOrName && isAddress(recipientAddressOrName)
                      ? shortenAddress(recipientAddressOrName)
                      : recipientAddressOrName
                  }`

            addTransaction(response, {
              summary: withRecipient,
            })

            return response.hash
          })
          .catch((error: any) => {
            // if the user rejected the tx, pass this along
            if (error?.code === 4001) {
              throw new Error('Transaction rejected.')
            } else {
              // otherwise, the error was unexpected and we need to convey that
              console.error(`Swap failed`, error, methodName, args, value)
              throw new Error(`Swap failed: ${error.message}`)
            }
          })
      },
    }
  }, [
    account,
    addTransaction,
    chainId,
    getSuccessfulEstimation,
    provider,
    recipient,
    recipientAddressOrName,
    trade,
    gasLimit,
  ])
}
