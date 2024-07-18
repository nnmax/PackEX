import { useMutation } from '@tanstack/react-query'
import fetcher from '@/utils/fetcher'

export default function useUpdateRunesBatch() {
  return useMutation({
    mutationKey: ['update-runes-batch'],
    mutationFn: async (params: { withdrawRecordIdList: number[]; broadcastTxHash: string }) => {
      return fetcher<void>('/update-runes-batch-transfer-status', {
        method: 'POST',
        body: JSON.stringify(params),
      })
    },
  })
}
