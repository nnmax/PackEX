import { useCallback } from 'react'
import { toggleWalletModal, toggleBTCWalletModal } from './actions'
import { useSelector, useDispatch } from 'react-redux'
import { AppState } from '../index'
import { useChainId } from 'wagmi'

export function useBlockNumber(): number | undefined {
  const chainId = useChainId()

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
