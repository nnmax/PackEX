import { createReducer } from '@reduxjs/toolkit'
import {
  checkedTransaction,
  clearAllTransactions,
  finalizeTransaction,
  updateFailedModalOpen,
  updateInProgressModalOpen,
} from './actions'
import type { SerializableTransactionReceipt } from './actions'

const now = () => new Date().getTime()

export interface TransactionDetails {
  hash: string
  approval?: { tokenAddress: string; spender: string }
  summary?: string
  receipt?: SerializableTransactionReceipt
  lastCheckedBlockNumber?: number
  addedTime: number
  confirmedTime?: number
  from: string
}

export interface TransactionState {
  inProgressModalOpen: boolean
  failedModalOpen: boolean
  [chainId: number]: Record<string, TransactionDetails>
}

export const initialState: TransactionState = {
  inProgressModalOpen: false,
  failedModalOpen: false,
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(clearAllTransactions, (transactions, { payload: { chainId } }) => {
      if (!transactions[chainId]) return
      transactions[chainId] = {}
    })
    .addCase(checkedTransaction, (transactions, { payload: { chainId, hash, blockNumber } }) => {
      const tx = transactions[chainId]?.[hash]
      if (!tx) {
        return
      }
      if (tx.lastCheckedBlockNumber) {
        tx.lastCheckedBlockNumber = Math.max(blockNumber, tx.lastCheckedBlockNumber)
      } else {
        tx.lastCheckedBlockNumber = blockNumber
      }
    })
    .addCase(finalizeTransaction, (transactions, { payload: { hash, chainId, receipt } }) => {
      const tx = transactions[chainId]?.[hash]
      if (!tx) {
        return
      }
      tx.receipt = receipt
      tx.confirmedTime = now()
    })
    .addCase(updateInProgressModalOpen, (transactions, { payload }) => {
      transactions.inProgressModalOpen = payload
    })
    .addCase(updateFailedModalOpen, (transactions, { payload }) => {
      transactions.failedModalOpen = payload
    }),
)
