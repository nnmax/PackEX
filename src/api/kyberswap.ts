import { useMutation, useQuery } from '@tanstack/react-query'
import { ETHER, WETH } from '@nnmax/uniswap-sdk-v2'
import invariant from 'tiny-invariant'
import { parseEther } from 'ethers'
import { useChainId } from 'wagmi'
import { Field } from '@/state/swap/actions'
import { isAddress } from '@/utils'
import { useCurrency } from '@/hooks/Tokens'
import fetcher from '@/utils/fetcher'
import type { AppState } from '@/state'
import type { ChainId, KyberswapRoutesData, Token } from '@nnmax/uniswap-sdk-v2'

function isETH(address: string) {
  return !isAddress(address)
}

function isDOG(currency: Token) {
  return currency.symbol?.toUpperCase() === 'DOG'
}

function wrapperToken(address: string) {
  return isETH(address) ? '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' : address
}

function equalsWrapToken(inputCurrencyId: string | undefined, outputCurrencyId: string | undefined, chainId: ChainId) {
  return (
    (inputCurrencyId === ETHER.symbol && outputCurrencyId === WETH[chainId].address) ||
    (outputCurrencyId === ETHER.symbol && inputCurrencyId === WETH[chainId].address)
  )
}

function shouldBeEnabled(
  inputCurrency: Token | null | undefined,
  outputCurrency: Token | null | undefined,
  typedValue: string,
  isWrapToken: boolean,
) {
  return (
    !!inputCurrency &&
    !!outputCurrency &&
    !!typedValue &&
    typedValue !== '0' &&
    !isDOG(inputCurrency) &&
    !isDOG(outputCurrency) &&
    !isWrapToken
  )
}

export function useKyberswapRoutes(swapState: AppState['swap']) {
  const {
    independentField,
    typedValue,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
  } = swapState
  const chainId: ChainId = useChainId()
  const isWrapToken = equalsWrapToken(inputCurrencyId, outputCurrencyId, chainId)
  const inputCurrency = useCurrency(inputCurrencyId)
  const outputCurrency = useCurrency(outputCurrencyId)

  return useQuery({
    enabled: shouldBeEnabled(inputCurrency, outputCurrency, typedValue, isWrapToken),
    queryKey: ['get-route-summary-and-price-impact', inputCurrencyId, outputCurrencyId, typedValue, independentField],
    refetchInterval: ({ state: { status } }) => (status === 'error' ? false : 10 * 1000),
    gcTime: 0,
    queryFn: () => {
      invariant(!!inputCurrencyId, 'inputCurrencyId is required')
      invariant(!!outputCurrencyId, 'outputCurrencyId is required')
      invariant(!!typedValue, 'typedValue is required')
      const tokenIn = wrapperToken(inputCurrencyId)
      const tokenOut = wrapperToken(outputCurrencyId)
      return fetcher<{
        routeSummary: KyberswapRoutesData
        priceImpact: number
      }>('/get-route-summary-and-price-impact', {
        method: 'POST',
        body: JSON.stringify({
          tokenIn: independentField === Field.INPUT ? tokenIn : tokenOut,
          tokenOut: independentField === Field.OUTPUT ? tokenIn : tokenOut,
          amountIn: parseEther(typedValue).toString(),
        }),
      })
    },
  })
}

export function useKyberswapRouteApprove() {
  return useMutation({
    mutationKey: ['get-approve-info'],
    mutationFn: (params: { tokenIn: string; amountIn: string }) => {
      return fetcher<{
        chainId: number
        // 标识是否需要 approve 操作，false 表示不需要，可以直接 swap；true 表示需要先 approve
        approve: boolean
        callData: `0x${string}`
        // approve 操作目标合约地址
        destination: `0x${string}`
        value: number
      }>('/get-approve-info', {
        method: 'POST',
        body: JSON.stringify(params),
      })
    },
  })
}

export function useKyberswapRouteBuild() {
  return useMutation({
    mutationKey: ['get-swap-info'],
    mutationFn: (params: { routeSummary: KyberswapRoutesData; slippageTolerance: number; amountIn: string }) => {
      return fetcher<{
        callData: `0x${string}`
        destination: `0x${string}`
        value: number
      }>(`/get-swap-info`, {
        method: 'POST',
        body: JSON.stringify(params),
      })
    },
  })
}
