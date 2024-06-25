import fetcher from '@/utils/fetcher'
import { useQuery } from '@tanstack/react-query'
import { uniqueId } from 'lodash-es'

export type PaxTableData = {
  id: string
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
  }).then((res) => {
    if (Array.isArray(res.leaderBoard)) {
      return {
        ...res,
        leaderBoard: res.leaderBoard.map((item, index) => ({
          ...item,
          rank: index + 1,
          id: uniqueId('pax-table-'),
        })),
      }
    }
    return res
  })
}

export function usePaxInfo() {
  return useQuery({
    queryKey: ['get-pax-info'],
    queryFn: getPaxInfo,
  })
}
