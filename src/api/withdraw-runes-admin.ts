import { useQuery } from '@tanstack/react-query'
import fetcher from '@/utils/fetcher'
import type { UndefinedInitialDataOptions } from '@tanstack/react-query'

export interface WithdrawRunesAdminData {
  list: {
    id: number
    txHash: string
    ethAddress: string
    btcAddress: string
    tokenId: number
    tokenAddress: string
    amount: number
    amountNetworkFee: number
    amountReceived: number
    confirmBlockNumber: number
    confirmResult: number
    btcTxHash: string | null
    updatetime: string
    createTime: string
    name: string
    symbol: string
    decimals: number
    runesId: string
  }[]
}

export default function withdrawRunes() {
  return fetcher<WithdrawRunesAdminData>('/withdraw-runes-admin', {
    method: 'POST',
  })
}

export function useWithdrawRunesAdmin(
  options?: Omit<UndefinedInitialDataOptions<WithdrawRunesAdminData>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: ['withdraw-runes-admin'],
    queryFn: withdrawRunes,
    ...options,
  })
}
