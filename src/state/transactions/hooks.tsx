import { useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useAccount, useChainId } from 'wagmi'
import { addTransaction, updateFailedModalOpen, updateInProgressModalOpen } from './actions'
import type { AppDispatch, AppState } from '../index'
import type { TransactionDetails } from './reducer'
import type { TransactionResponse } from 'ethers'

// helper that can take a ethers library transaction response and add it to the list of transactions
export function useTransactionAdder(): (
  response: TransactionResponse,
  customData?: { summary?: string; approval?: { tokenAddress: string; spender: string } },
) => void {
  const { address: account } = useAccount()
  const chainId = useChainId()
  const dispatch = useDispatch<AppDispatch>()

  return useCallback(
    (
      response: TransactionResponse,
      { summary, approval }: { summary?: string; approval?: { tokenAddress: string; spender: string } } = {},
    ) => {
      if (!account) return
      if (!chainId) return

      const { hash } = response
      if (!hash) {
        throw Error('No transaction hash found.')
      }
      dispatch(addTransaction({ hash, from: account, chainId, approval, summary }))
    },
    [dispatch, chainId, account],
  )
}

// returns all the transactions for the current chain
export function useAllTransactions(): Record<string, TransactionDetails> {
  const chainId = useChainId()

  const state = useSelector<AppState, AppState['transactions']>((state) => state.transactions)

  return chainId ? (state[chainId] ?? {}) : {}
}

export function useIsTransactionPending(transactionHash?: string): boolean {
  const transactions = useAllTransactions()

  if (!transactionHash || !transactions[transactionHash]) return false

  return !transactions[transactionHash].receipt
}

/**
 * Returns whether a transaction happened in the last day (86400 seconds * 1000 milliseconds / second)
 * @param tx to check for recency
 */
export function isTransactionRecent(tx: TransactionDetails): boolean {
  return new Date().getTime() - tx.addedTime < 86_400_000
}

// returns whether a token has a pending approval transaction
export function useHasPendingApproval(tokenAddress: string | undefined, spender: string | undefined): boolean {
  const allTransactions = useAllTransactions()
  return useMemo(
    () =>
      typeof tokenAddress === 'string' &&
      typeof spender === 'string' &&
      Object.keys(allTransactions).some((hash) => {
        const tx = allTransactions[hash]
        if (!tx) return false
        if (tx.receipt) {
          return false
        } else {
          const approval = tx.approval
          if (!approval) return false
          return approval.spender === spender && approval.tokenAddress === tokenAddress && isTransactionRecent(tx)
        }
      }),
    [allTransactions, spender, tokenAddress],
  )
}

export function useTransactionInProgressModalOpen() {
  const dispatch = useDispatch<AppDispatch>()
  const state = useSelector<AppState, AppState['transactions']>((state) => state.transactions)
  const update = (isOpen: boolean) => {
    dispatch(updateInProgressModalOpen(isOpen))
  }
  return [state.inProgressModalOpen, update] as const
}

export function useTransactionFailedModalOpen() {
  const dispatch = useDispatch<AppDispatch>()
  const state = useSelector<AppState, AppState['transactions']>((state) => state.transactions)
  const update = (isOpen: boolean) => {
    dispatch(updateFailedModalOpen(isOpen))
  }

  return [state.failedModalOpen, update] as const
}
