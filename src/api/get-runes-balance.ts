import fetcher from '@/utils/fetcher'
import { useQuery } from '@tanstack/react-query'
import { omit } from 'lodash-es'

export interface GetRunesBalanceParams {
  btcAddress: string
  runesId: string
}

export interface GetRunesBalanceResult {
  rune: string
  runeid: string
  spacedRune: string
  amount: string
  symbol: string
  divisibility: number
}

function getRunesBalance(params: GetRunesBalanceParams) {
  return fetcher<GetRunesBalanceResult>('/get-address-runes-balance', {
    method: 'POST',
    disabledErrorToast: true,
    body: JSON.stringify(params),
  }).catch((error) => {
    if (error && error.code === 808900001) {
      const data: GetRunesBalanceResult = {
        amount: '0',
        divisibility: 18,
        rune: 'rune',
        runeid: 'rune',
        spacedRune: 'rune',
        symbol: '-',
      }
      return data
    }
    throw error
  })
}

export function useRunesBalance(params: GetRunesBalanceParams & { enabled?: boolean }) {
  return useQuery({
    queryKey: ['get-runes-balance'],
    enabled: params.enabled ?? true,
    queryFn: () => {
      return getRunesBalance(omit(params, 'enabled'))
    },
  })
}
