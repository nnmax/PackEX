import fetcher from '@/utils/fetcher'
import { useQuery } from '@tanstack/react-query'

export type PaxTableData = {
  totalAmount: number
  address: string
  rank: number
}

export type PaxRewardRatio = {
  name: string
  ratio: string
}

export type GetPaxInfoData = {
  dailyRewards: number
  paxContract: string
  leaderBoard: PaxTableData[]
  paxRewardRatio: PaxRewardRatio[]
}

function getPaxInfo() {
  return fetcher<GetPaxInfoData>('/get-pax-info', {
    method: 'GET',
  })
}

export function usePaxInfo() {
  return useQuery({
    queryKey: ['get-pax-info'],
    queryFn: getPaxInfo,
  })
}
