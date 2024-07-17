import { nanoid } from '@reduxjs/toolkit'
import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { fetchTokenList } from '../state/lists/actions'
import getTokenList from '../utils/getTokenList'
import type { AppDispatch } from '../state'
import type { TokenList } from '@uniswap/token-lists'

export function useFetchListCallback(): (listUrl: string) => Promise<TokenList> {
  const dispatch = useDispatch<AppDispatch>()

  return useCallback(
    async (listUrl: string) => {
      const requestId = nanoid()
      dispatch(fetchTokenList.pending({ requestId, url: listUrl }))
      return getTokenList(listUrl)
        .then((tokenList) => {
          dispatch(fetchTokenList.fulfilled({ url: listUrl, tokenList, requestId }))
          return tokenList
        })
        .catch((error) => {
          console.debug(`Failed to get list at url ${listUrl}`, error)
          dispatch(fetchTokenList.rejected({ url: listUrl, requestId, errorMessage: error.message }))
          throw error
        })
    },
    [dispatch],
  )
}
