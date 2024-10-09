import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { useChainId, useTransactionReceipt } from 'wagmi'
import { useTransactionFailedModalOpen, useTransactionInProgressModalOpen } from '@/state/transactions/hooks'

export default function useIntervalTxAndHandle(
  txHash: undefined | string | null,
  handle?: {
    onFailed?: () => void
    onSuccess?: () => Promise<void>
  },
) {
  const chainId = useChainId()
  const { data: transactionReceipt } = useTransactionReceipt({
    hash: txHash as `0x${string}`,
    chainId,
    query: {
      refetchInterval: 3000,
      enabled: !!txHash,
    },
  })
  const handleRef = useRef(handle)
  // eslint-disable-next-line react-compiler/react-compiler
  handleRef.current = handle
  const queryClient = useQueryClient()

  const [, updateFailedModalOpen] = useTransactionFailedModalOpen()
  const [, updateInProgressModalOpen] = useTransactionInProgressModalOpen()

  useEffect(() => {
    if (!transactionReceipt) return
    if (transactionReceipt.status !== 'success') {
      if (handleRef.current && handleRef.current.onFailed) {
        handleRef.current.onFailed()
      }
      updateInProgressModalOpen(false)
      updateFailedModalOpen(true)
      return
    }
    const timer = setTimeout(() => {
      if (handleRef.current && handleRef.current.onSuccess) {
        handleRef.current.onSuccess().finally(() => {
          updateInProgressModalOpen(false)
        })
      }
    }, 10000)
    return () => {
      clearTimeout(timer)
    }
  }, [queryClient, transactionReceipt, updateInProgressModalOpen, updateFailedModalOpen])
}
