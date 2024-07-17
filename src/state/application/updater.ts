import { useCallback, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useChainId, useWatchBlockNumber } from 'wagmi'
import useDebounce from '../../hooks/useDebounce'
import useIsWindowVisible from '../../hooks/useIsWindowVisible'
import { updateBlockNumber } from './actions'

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
      setState((_state) => {
        if (chainId === _state.chainId) {
          if (typeof _state.blockNumber !== 'number') return { chainId, blockNumber: Number(blockNumber) }
          return { chainId, blockNumber: Math.max(Number(blockNumber), _state.blockNumber) ?? null }
        }
        return _state
      })
    },
    [chainId, setState],
  )

  useWatchBlockNumber({
    chainId,
    onBlockNumber: blockNumberCallback,
    onError: (error) => console.error('Failed to fetch block number', error),
  })

  const debouncedState = useDebounce(state, 100)

  useEffect(() => {
    if (!debouncedState.chainId || !debouncedState.blockNumber || !windowVisible) return
    dispatch(updateBlockNumber({ chainId: debouncedState.chainId, blockNumber: debouncedState.blockNumber }))
  }, [windowVisible, dispatch, debouncedState.blockNumber, debouncedState.chainId])

  return null
}
