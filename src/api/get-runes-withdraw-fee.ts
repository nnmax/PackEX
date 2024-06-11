import fetcher from '@/utils/fetcher'
import { UndefinedInitialDataOptions, useQuery } from '@tanstack/react-query'

export interface WithdrawFeeData {
  networkFeeInDog: number
}

export default function getRunesWithdrawFee() {
  return fetcher<WithdrawFeeData>('/get-runes-withdraw-fee', {
    method: 'POST',
    disabledErrorToast: true,
  }).catch(() => {
    return {
      networkFeeInDog: 0,
    }
  })
}

export function useWithdrawFee(options?: Omit<UndefinedInitialDataOptions<WithdrawFeeData>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: ['get-runes-withdraw-fee'],
    queryFn: getRunesWithdrawFee,
    refetchInterval: 5000,
    ...options,
  })
}
