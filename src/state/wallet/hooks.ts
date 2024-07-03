import { Currency, CurrencyAmount, ETHER, JSBI, Token, TokenAmount } from '@nnmax/uniswap-sdk-v2'
import { useMemo } from 'react'
import ERC20_INTERFACE from '../../constants/abis/erc20'
import { useAllTokens } from '../../hooks/Tokens'
import { useMulticallContract } from '../../hooks/useContract'
import { isAddress } from '../../utils'
import { useSingleContractMultipleData, useMultipleContractSingleData } from '../multicall/hooks'
import { useAccount } from 'wagmi'

/**
 * Returns a map of the given addresses to their eventually consistent ETH balances.
 */
export function useETHBalances(uncheckedAddresses?: (string | undefined)[]): [
  {
    [address: string]: CurrencyAmount | undefined
  },
  boolean,
] {
  const multicallContract = useMulticallContract()

  const addresses: string[] = useMemo(
    () =>
      uncheckedAddresses
        ? uncheckedAddresses
            .map(isAddress)
            .filter((a): a is string => a !== false)
            .sort()
        : [],
    [uncheckedAddresses],
  )

  const results = useSingleContractMultipleData(
    multicallContract,
    'getEthBalance',
    addresses.map((address) => [address]),
  )
  const anyLoading = results.some((callState) => callState.loading)

  return useMemo(
    () => [
      addresses.reduce<{ [address: string]: CurrencyAmount }>((memo, address, i) => {
        const value = results?.[i]?.result?.[0]
        if (value) memo[address] = CurrencyAmount.ether(JSBI.BigInt(value.toString()))
        return memo
      }, {}),
      anyLoading,
    ],
    [addresses, results, anyLoading],
  )
}

/**
 * Returns a map of token addresses to their eventually consistent token balances for a single account.
 */
export function useTokenBalancesWithLoadingIndicator(
  address?: string,
  tokens?: (Token | undefined)[],
): [{ [tokenAddress: string]: TokenAmount | undefined }, boolean] {
  const validatedTokens: Token[] = useMemo(
    () => tokens?.filter((t?: Token): t is Token => isAddress(t?.address) !== false) ?? [],
    [tokens],
  )

  const validatedTokenAddresses = useMemo(() => validatedTokens.map((vt) => vt.address), [validatedTokens])

  const balances = useMultipleContractSingleData(validatedTokenAddresses, ERC20_INTERFACE, 'balanceOf', [address])

  const anyLoading: boolean = useMemo(() => balances.some((callState) => callState.loading), [balances])

  return [
    useMemo(
      () =>
        address && validatedTokens.length > 0
          ? validatedTokens.reduce<{ [tokenAddress: string]: TokenAmount | undefined }>((memo, token, i) => {
              const value = balances?.[i]?.result?.[0] as bigint | undefined
              const amount = value === null || value === undefined ? undefined : JSBI.BigInt(value.toString())
              if (amount !== undefined) {
                memo[token.address] = new TokenAmount(token, amount)
              }
              return memo
            }, {})
          : {},
      [address, validatedTokens, balances],
    ),
    anyLoading,
  ]
}

export function useTokenBalances(
  address?: string,
  tokens?: (Token | undefined)[],
): { [tokenAddress: string]: TokenAmount | undefined } {
  return useTokenBalancesWithLoadingIndicator(address, tokens)[0]
}

// get the balance for a single token/account combo
export function useTokenBalance(account?: string, token?: Token): TokenAmount | undefined {
  const tokenBalances = useTokenBalances(account, [token])
  if (!token) return undefined
  return tokenBalances[token.address]
}

export function useCurrencyBalances(
  account?: string,
  currencies?: (Currency | undefined)[],
): { balances: (CurrencyAmount | undefined)[]; anyLoading: boolean } {
  const tokens = useMemo(
    () => currencies?.filter((currency): currency is Token => currency instanceof Token) ?? [],
    [currencies],
  )

  const [tokenBalances, anyLoading] = useTokenBalancesWithLoadingIndicator(account, tokens)
  const containsETH: boolean = useMemo(() => currencies?.some((currency) => currency === ETHER) ?? false, [currencies])
  const [ethBalance, ethAnyLoading] = useETHBalances(containsETH ? [account] : [])

  return useMemo(
    () => ({
      balances:
        currencies?.map((currency) => {
          if (!account || !currency) return undefined
          if (currency instanceof Token) return tokenBalances[currency.address]
          if (currency === ETHER) return ethBalance[account]
          return undefined
        }) ?? [],
      anyLoading: anyLoading || ethAnyLoading,
    }),
    [account, anyLoading, currencies, ethAnyLoading, ethBalance, tokenBalances],
  )
}

export function useCurrencyBalance(account?: string, currency?: Currency): [CurrencyAmount | undefined, boolean] {
  const result = useCurrencyBalances(account, [currency])
  return [result.balances[0], result.anyLoading]
}

// mimics useAllBalances
export function useAllTokenBalances(): { [tokenAddress: string]: TokenAmount | undefined } {
  const { address: account } = useAccount()
  const allTokens = useAllTokens()
  const allTokensArray = useMemo(() => Object.values(allTokens ?? {}), [allTokens])
  const balances = useTokenBalances(account ?? undefined, allTokensArray)
  return balances ?? {}
}
