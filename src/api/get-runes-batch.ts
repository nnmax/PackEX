import { useMutation } from '@tanstack/react-query'
import fetcher from '@/utils/fetcher'

export default function useRunesBatch() {
  return useMutation({
    mutationKey: ['runes-batch'],
    mutationFn: async (params: { withdrawRecordIdList: number[] }) => {
      return fetcher<{
        messageToBeSigned: string
      }>('/get-runes-batch-transfer-unsigned-message', {
        method: 'POST',
        body: JSON.stringify(params),
      })
    },
  })
}
