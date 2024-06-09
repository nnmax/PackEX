import { useCallback, useEffect, useState } from 'react'
import useDebounce from '../../hooks/useDebounce'
import useIsWindowVisible from '../../hooks/useIsWindowVisible'
import { updateBlockNumber } from './actions'
import { useDispatch } from 'react-redux'
import { useChainId, useWatchBlockNumber } from 'wagmi'

export default function Updater(): null {
  const chainId = useChainId()
  const dispatch = useDispatch()

  const windowVisible = useIsWindowVisible()

  const [state, setState] = useState<{ chainId: number | undefined; blockNumber: number | null }>({
    chainId,
    blockNumber: null,
  })

  const blockNumberCallback = useCallback(
    (blockNumber: bigint) => {
      setState((state) => {
        if (chainId === state.chainId) {
          if (typeof state.blockNumber !== 'number') return { chainId, blockNumber: Number(blockNumber) }
          return { chainId, blockNumber: Math.max(Number(blockNumber), state.blockNumber) }
        }
        return state
      })
    },
    [chainId, setState],
  )

  useWatchBlockNumber({
    chainId,
    onBlockNumber: blockNumberCallback,
    onError: (error) => console.error('Failed to fetch block number', error),
    pollingInterval: 1000,
  })

  const debouncedState = useDebounce(state, 100)

  useEffect(() => {
    if (!debouncedState.chainId || !debouncedState.blockNumber || !windowVisible) return
    dispatch(updateBlockNumber({ chainId: debouncedState.chainId, blockNumber: debouncedState.blockNumber }))
  }, [windowVisible, dispatch, debouncedState.blockNumber, debouncedState.chainId])

  return null
}
