import { JSBI, Percent, Router, TradeType } from '@nnmax/uniswap-sdk-v2'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAccount, useChainId, useSendTransaction } from 'wagmi'
import { toast } from 'react-toastify'
import { parseEther, type Contract } from 'ethers'
import { useEthersProvider } from '@/hooks/useEthersProvider'
import { useKyberswapRouteApprove, useKyberswapRouteBuild } from '@/api'
import { useSwapState } from '@/state/swap/hooks'
import { BIPS_BASE, DEFAULT_GAS } from '../constants'
import { useTransactionAdder } from '../state/transactions/hooks'
import { calculateGasMargin, getRouterContract } from '../utils'
import isZero from '../utils/isZero'
import type { SwapParameters, Trade } from '@nnmax/uniswap-sdk-v2'

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
 */
function useGetSwapCallArguments(
  trade: Trade | undefined, // trade to execute, required
  allowedSlippage: number, // in bips
  deadline: number, // in seconds from now
): () => Promise<SwapCall[]> {
  const provider = useEthersProvider()
  const { address: account } = useAccount()
  const chainId = useChainId()

  return useCallback(async () => {
    if (!trade || !provider || !account || !chainId) return []

    const contract = await getRouterContract(chainId, provider, account)
    if (!contract) {
      return []
    }

    const swapMethods = []

    swapMethods.push(
      Router.swapCallParameters(trade, {
        feeOnTransfer: false,
        allowedSlippage: new Percent(JSBI.BigInt(allowedSlippage), BIPS_BASE),
        recipient: account,
        ttl: deadline,
      }),
    )

    if (trade.tradeType === TradeType.EXACT_INPUT) {
      swapMethods.push(
        Router.swapCallParameters(trade, {
          feeOnTransfer: true,
          allowedSlippage: new Percent(JSBI.BigInt(allowedSlippage), BIPS_BASE),
          recipient: account,
          ttl: deadline,
        }),
      )
    }

    return swapMethods.map((parameters) => ({ parameters, contract }))
  }, [account, allowedSlippage, chainId, deadline, provider, trade])
}

// returns a function that will execute a swap, if the parameters are all valid
// and the user has approved the slippage adjusted input amount for the trade
export function useSwapCallback(
  trade: Trade | undefined, // trade to execute, required
  allowedSlippage: number, // in bips
  deadline: number, // in seconds from now
): {
  state: SwapCallbackState
  callback: null | (() => Promise<string>)
  error: string | null
  gasLimit: bigint | undefined
} {
  const provider = useEthersProvider()
  const { address: account } = useAccount()
  const chainId = useChainId()

  const getSwapCallArguments = useGetSwapCallArguments(trade, allowedSlippage, deadline)
  const [gasLimit, setGasLimit] = useState<bigint>()
  const addTransaction = useTransactionAdder()
  const { sendTransactionAsync } = useSendTransaction()
  const { mutateAsync: buildRoute } = useKyberswapRouteBuild()
  const { mutateAsync: approveRoute } = useKyberswapRouteApprove()
  const { typedValue } = useSwapState()
  const typedValueRef = useRef(typedValue)
  useEffect(() => {
    typedValueRef.current = typedValue
  }, [typedValue])

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
    if (!provider || !account || !chainId) {
      return { state: SwapCallbackState.INVALID, gasLimit, callback: null, error: 'Missing dependencies' }
    }
    if (!trade) {
      return { state: SwapCallbackState.INVALID, gasLimit, callback: null, error: '' }
    }

    const onSwap = async (): Promise<string> => {
      if (trade.kyberswapRoutesData) {
        const approveResponse = await approveRoute({
          amountIn: trade.kyberswapRoutesData.amountIn,
          tokenIn: trade.kyberswapRoutesData.tokenIn,
        })
        if (approveResponse.approve) {
          await sendTransactionAsync({
            data: approveResponse.callData,
            chainId: approveResponse.chainId,
            to: approveResponse.destination,
            value: BigInt(approveResponse.value),
            account,
            gas: DEFAULT_GAS,
          })
        }
        const buildResponse = await buildRoute({
          routeSummary: trade.kyberswapRoutesData,
          slippageTolerance: allowedSlippage,
          amountIn: parseEther(typedValueRef.current).toString(),
        }).catch((error) => {
          toast.error('Failed to build route: ' + error.message)
          throw error
        })
        return await sendTransactionAsync({
          data: buildResponse.callData,
          account,
          to: buildResponse.destination,
          value: BigInt(buildResponse.value),
          gas: DEFAULT_GAS,
        })
      }

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

          const summary = `Swap ${inputAmount} ${inputSymbol} for ${outputAmount} ${outputSymbol}`

          addTransaction(response, {
            summary,
          })

          return response.hash as string
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
    }

    return {
      state: SwapCallbackState.VALID,
      error: null,
      gasLimit,
      callback: onSwap,
    }
  }, [
    trade,
    provider,
    account,
    chainId,
    gasLimit,
    getSuccessfulEstimation,
    approveRoute,
    buildRoute,
    allowedSlippage,
    sendTransactionAsync,
    addTransaction,
  ])
}
