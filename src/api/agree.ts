import fetcher from '@/utils/fetcher'
import { useMutation } from '@tanstack/react-query'

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
