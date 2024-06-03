import { useCallback } from 'react'
import { useActiveWeb3React } from '../../hooks'
import { addPopup, PopupContent, toggleWalletModal, toggleBTCWalletModal } from './actions'
import { useSelector, useDispatch } from 'react-redux'
import { AppState } from '../index'

export function useBlockNumber(): number | undefined {
  const { chainId } = useActiveWeb3React()

  return useSelector((state: AppState) => state.application.blockNumber[chainId ?? -1])
}

export function useWalletModalOpen(): boolean {
  return useSelector((state: AppState) => state.application.walletModalOpen)
}

export function useWalletModalToggle(): () => void {
  const dispatch = useDispatch()
  return useCallback(() => dispatch(toggleWalletModal()), [dispatch])
}

export function useBTCWalletModalOpen(): boolean {
  return useSelector((state: AppState) => state.application.btcWalletModalOpen)
}

export function useBTCWalletModalToggle(): () => void {
  const dispatch = useDispatch()
  return useCallback(() => dispatch(toggleBTCWalletModal()), [dispatch])
}

// returns a function that allows adding a popup
export function useAddPopup(): (content: PopupContent, key?: string) => void {
  const dispatch = useDispatch()

  return useCallback(
    (content: PopupContent, key?: string) => {
      dispatch(addPopup({ content, key }))
    },
    [dispatch],
  )
}
