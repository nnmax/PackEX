import { useMutation } from '@tanstack/react-query'
import fetcher from '@/utils/fetcher'

export default function useAgree() {
  return useMutation({
    mutationKey: ['agree'],
    mutationFn: () => {
      return fetcher<null>('/agree-protocol', {
        method: 'POST',
        body: JSON.stringify({ agreed: 1 }),
      })
    },
  })
}
