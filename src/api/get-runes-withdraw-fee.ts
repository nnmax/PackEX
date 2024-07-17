import { useQuery } from '@tanstack/react-query'
import fetcher from '@/utils/fetcher'
import type { UndefinedInitialDataOptions} from '@tanstack/react-query';

export interface WithdrawFeeData {
  networkFeeInDog: number
}

export default function getRunesWithdrawFee() {
  return fetcher<WithdrawFeeData>('/get-runes-withdraw-fee', {
    method: 'POST',
    disabledErrorToast: true,
  })
}

export function useWithdrawFee(options?: Omit<UndefinedInitialDataOptions<WithdrawFeeData>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: ['get-runes-withdraw-fee'],
    queryFn: getRunesWithdrawFee,
    ...options,
  })
}
