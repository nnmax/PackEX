import { ETHER, Trade } from '@nnmax/uniswap-sdk-v2'
import { flatMap, get } from 'lodash-es'
import { useMemo } from 'react'
import { useAccount, useChainId } from 'wagmi'
import { useAllTokens } from '@/hooks/Tokens'
import { useETHBalances } from '@/state/wallet/hooks'
import { computeTradePriceBreakdown } from '@/utils/prices'
import { ALLOWED_PRICE_IMPACT, BASES_TO_CHECK_TRADES_AGAINST, CUSTOM_BASES } from '../constants'
import { PairState, usePairs } from '../data/Reserves'
import { wrappedCurrency } from '../utils/wrappedCurrency'
import type { ChainId, Currency, CurrencyAmount, KyberswapRoutesData, Pair, Token } from '@nnmax/uniswap-sdk-v2'

function useAllCommonPairs(currencyA?: Currency, currencyB?: Currency): Pair[] {
  const chainId: ChainId = useChainId()

  const bases: Token[] = useMemo(() => (chainId ? BASES_TO_CHECK_TRADES_AGAINST[chainId] : []), [chainId])

  const [tokenA, tokenB] = chainId
    ? [wrappedCurrency(currencyA, chainId), wrappedCurrency(currencyB, chainId)]
    : [undefined, undefined]

  const basePairs: [Token, Token][] = useMemo(
    () =>
      flatMap(bases, (base): [Token, Token][] => bases.map((otherBase) => [base, otherBase])).filter(
        ([t0, t1]) => t0.address !== t1.address,
      ),
    [bases],
  )

  const allPairCombinations: [Token, Token][] = useMemo(
    () =>
      tokenA && tokenB
        ? [
            // the direct pair
            [tokenA, tokenB],
            // token A against all bases
            ...bases.map((base): [Token, Token] => [tokenA, base]),
            // token B against all bases
            ...bases.map((base): [Token, Token] => [tokenB, base]),
            // each base against all bases
            ...basePairs,
          ]
            .filter((tokens): tokens is [Token, Token] => Boolean(tokens[0] && tokens[1]))
            .filter(([t0, t1]) => t0.address !== t1.address)
            .filter(([_tokenA, _tokenB]) => {
              if (!chainId) return true
              const customBases = CUSTOM_BASES[chainId]
              if (!customBases) return true

              const customBasesA: Token[] | undefined = customBases[_tokenA.address]
              const customBasesB: Token[] | undefined = customBases[_tokenB.address]

              if (!customBasesA && !customBasesB) return true

              if (customBasesA && !customBasesA.find((base) => _tokenB.equals(base))) return false
              if (customBasesB && !customBasesB.find((base) => _tokenA.equals(base))) return false

              return true
            })
        : [],
    [tokenA, tokenB, bases, basePairs, chainId],
  )

  const allPairs = usePairs(allPairCombinations)

  // only pass along valid pairs, non-duplicated pairs
  return useMemo(
    () =>
      Object.values(
        allPairs
          // filter out invalid pairs
          .filter((result): result is [PairState.EXISTS, Pair] => Boolean(result[0] === PairState.EXISTS && result[1]))
          // filter out duplicated pairs
          .reduce<Record<string, Pair>>((memo, [, curr]) => {
            memo[curr.liquidityToken.address] = memo[curr.liquidityToken.address] ?? curr
            return memo
          }, {}),
      ),
    [allPairs],
  )
}

function useAllTokenAmountPairs() {
  const tokensMap = useAllTokens()

  const allTokenPairs = useMemo(() => {
    const tokens = Object.values(tokensMap).sort((a, b) => a.address.localeCompare(b.address))
    return flatMap(tokens, (tokenA): [Token, Token][] => {
      return tokens.map((tokenB) => {
        return [tokenA, tokenB]
      })
    }).filter(([a, b]) => a.address !== b.address)
  }, [tokensMap])

  return allTokenPairs
}

/**
 * 预取交易对和 ETH 余额
 */
export function usePrefetchAllCommonPairs() {
  const { address: account } = useAccount()
  const tokenPairs = useAllTokenAmountPairs()
  useETHBalances([account])
  useAllCommonPairs(get(tokenPairs, [0, 0]), get(tokenPairs, [0, 1]))
}

function shouldUseKyber(trade: Trade) {
  const inputIsDog = trade.inputAmount.currency.symbol?.toUpperCase() === 'DOG'
  const outputIsDog = trade.outputAmount.currency.symbol?.toUpperCase() === 'DOG'
  return (
    !inputIsDog &&
    !outputIsDog &&
    !(trade.inputAmount.currency === ETHER && trade.outputAmount.currency.symbol?.toUpperCase() === 'WETH') &&
    !(trade.outputAmount.currency === ETHER && trade.inputAmount.currency.symbol?.toUpperCase() === 'WETH')
  )
}

/**
 * Returns the best trade for the exact amount of tokens in to the given token out
 */
export function useTradeExactIn(options: {
  currencyOut?: Currency
  currencyAmountIn?: CurrencyAmount
  kyberswapRoutesData?: KyberswapRoutesData
}): Trade | null {
  const { currencyAmountIn, currencyOut, kyberswapRoutesData } = options
  const allowedPairs = useAllCommonPairs(currencyAmountIn?.currency, currencyOut)
  return useMemo(() => {
    if (currencyAmountIn && currencyOut && allowedPairs.length > 0) {
      const trade =
        Trade.bestTradeExactIn(allowedPairs, currencyAmountIn, currencyOut, { maxHops: 3, maxNumResults: 1 })[0] ?? null
      const { priceImpactWithoutFee } = computeTradePriceBreakdown(trade)
      if (priceImpactWithoutFee?.greaterThan(ALLOWED_PRICE_IMPACT)) {
        if (shouldUseKyber(trade) && !kyberswapRoutesData) return null
        console.log('%c Kyberswap is being used...', 'font-size:13px; background:pink; color:#bf2c9f;')
        return (
          Trade.bestTradeExactIn(allowedPairs, currencyAmountIn, currencyOut, {
            maxHops: 3,
            maxNumResults: 1,
            kyberswapRoutesData,
          })[0] ?? null
        )
      }
      return trade
    }
    return null
  }, [allowedPairs, currencyAmountIn, currencyOut, kyberswapRoutesData])
}

/**
 * Returns the best trade for the token in to the exact amount of token out
 */
export function useTradeExactOut(options: {
  currencyIn?: Currency
  currencyAmountOut?: CurrencyAmount
  kyberswapRoutesData?: KyberswapRoutesData
}): Trade | null {
  const { currencyAmountOut, currencyIn, kyberswapRoutesData } = options
  const allowedPairs = useAllCommonPairs(currencyIn, currencyAmountOut?.currency)

  return useMemo(() => {
    if (currencyIn && currencyAmountOut && allowedPairs.length > 0) {
      const trade =
        Trade.bestTradeExactOut(allowedPairs, currencyIn, currencyAmountOut, { maxHops: 3, maxNumResults: 1 })[0] ??
        null
      const { priceImpactWithoutFee } = computeTradePriceBreakdown(trade)
      if (priceImpactWithoutFee?.greaterThan(ALLOWED_PRICE_IMPACT)) {
        if (shouldUseKyber(trade) && !kyberswapRoutesData) return null
        console.log('%c Kyberswap is being used...', 'font-size:13px; background:pink; color:#bf2c9f;')
        return (
          Trade.bestTradeExactOut(allowedPairs, currencyIn, currencyAmountOut, {
            maxHops: 3,
            maxNumResults: 1,
            kyberswapRoutesData,
          })[0] ?? null
        )
      }
      return trade
    }
    return null
  }, [allowedPairs, currencyIn, currencyAmountOut, kyberswapRoutesData])
}
