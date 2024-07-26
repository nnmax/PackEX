import { useMutation } from '@tanstack/react-query'
import fetcher from '@/utils/fetcher'

interface DepositConfirmParams {
  txHash: string
  btcAddress: string
  runesId: string
  amount: string
}

export default function useDepositConfirm() {
  return useMutation({
    mutationKey: ['deposit-confirm'],
    mutationFn: (params: DepositConfirmParams) => {
      return fetcher('/deposit-runes-after-broadcast', {
        method: 'POST',
        body: JSON.stringify(params),
      })
    },
  })
}
