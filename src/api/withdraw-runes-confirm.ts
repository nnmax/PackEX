import { WithdrawRunesParams } from '@/api/withdraw-runes'
import fetcher from '@/utils/fetcher'
import { useMutation } from '@tanstack/react-query'

export type WithdrawRunesConfirmParams = WithdrawRunesParams & {
  txHash: string
}

export default function withdrawRunesConfirm(params: WithdrawRunesConfirmParams) {
  return fetcher<null>('/withdraw-runes-confirm', {
    method: 'POST',
    body: JSON.stringify(params),
    disabledErrorToast: true,
  })
}

export function useWithdrawRunesConfirm() {
  return useMutation({
    mutationKey: ['withdraw-runes-confirm'],
    mutationFn: withdrawRunesConfirm,
  })
}
