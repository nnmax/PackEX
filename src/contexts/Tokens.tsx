import React, { createContext, useContext, useReducer, useMemo, useCallback, useEffect } from 'react'
import { ChainId, WETH, Token } from '@uniswap/sdk'
import { useWeb3React } from '../hooks'
import { isAddress, getTokenName, getTokenSymbol, getTokenDecimals, safeAccess } from '../utils'

const UPDATE = 'UPDATE'

export const ALL_TOKENS = [
  WETH[ChainId.RINKEBY],
  new Token(ChainId.RINKEBY, '0xc7AD46e0b8a400Bb3C915120d284AafbA8fc4735', 18, 'DAI', 'Dai Stablecoin')
]

// only meant to be used in exchanges.ts!
export const INITIAL_TOKENS_CONTEXT = ALL_TOKENS.reduce((tokenMap, token) => {
  // ensure tokens are unique
  if (tokenMap?.[token.chainId]?.[token.address] !== undefined) throw Error(`Duplicate token: ${token}`)
  return {
    ...tokenMap,
    [token.chainId]: {
      ...tokenMap?.[token.chainId],
      [token.address]: token
    }
  }
}, {})

const TokensContext = createContext([])

function useTokensContext() {
  return useContext(TokensContext)
}

function reducer(state, { type, payload }) {
  switch (type) {
    case UPDATE: {
      const { chainId, token } = payload
      return {
        ...state,
        [chainId]: {
          ...(state?.[chainId] || {}),
          [token.address]: token
        }
      }
    }
    default: {
      throw Error(`Unexpected action type in TokensContext reducer: '${type}'.`)
    }
  }
}

export default function Provider({ children }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_TOKENS_CONTEXT)

  const update = useCallback((chainId, token) => {
    dispatch({ type: UPDATE, payload: { chainId, token } })
  }, [])

  return (
    <TokensContext.Provider value={useMemo(() => [state, { update }], [state, update])}>
      {children}
    </TokensContext.Provider>
  )
}

export function useToken(tokenAddress: string): Token {
  const { library, chainId } = useWeb3React()

  const [state, { update }] = useTokensContext()
  const allTokensInNetwork = state?.[chainId] || {}

  const token = safeAccess(allTokensInNetwork, [tokenAddress]) || {}

  useEffect(() => {
    if (
      isAddress(tokenAddress) &&
      (token === undefined || token.name === undefined || token.symbol === undefined || token.decimals === undefined) &&
      (chainId || chainId === 0) &&
      library
    ) {
      let stale = false
      const namePromise = getTokenName(tokenAddress, library).catch(() => null)
      const symbolPromise = getTokenSymbol(tokenAddress, library).catch(() => null)
      const decimalsPromise = getTokenDecimals(tokenAddress, library).catch(() => null)

      Promise.all([namePromise, symbolPromise, decimalsPromise]).then(
        ([resolvedName, resolvedSymbol, resolvedDecimals]) => {
          if (!stale && resolvedDecimals) {
            const newToken: Token = new Token(chainId, tokenAddress, resolvedDecimals, resolvedSymbol, resolvedName)
            update(chainId, newToken)
          }
        }
      )
      return () => {
        stale = true
      }
    }
  }, [tokenAddress, token, chainId, library, update])

  return token
}

export function useAllTokens() {
  const { chainId } = useWeb3React()
  const [state] = useTokensContext()

  return useMemo(() => {
    return state?.[chainId] || {}
  }, [state, chainId])
}