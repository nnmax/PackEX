import { usePaxInfo } from '@/state/user/hooks'
import fetcher from '@/utils/fetcher'
import { isEqual } from 'lodash-es'
import { useEffect } from 'react'

export type PaxTableData = {
  totalAmount: number
  address: string
  rank: number
}

export type PaxRewardRatio = {
  name: string
  ratio: string
  amount: number
}

export type GetPaxInfoData = {
  dailyRewards: number
  unclaimed: number
  totalMinted: number
  paxContract: string
  leaderBoard: PaxTableData[]
  paxRewardRatio: PaxRewardRatio[]
}

function getPaxInfo() {
  return fetcher<GetPaxInfoData>('/get-pax-info', {
    method: 'GET',
  })
}

export const useFetchPaxInfo = () => {
  const [data, updateData] = usePaxInfo()

  useEffect(() => {
    getPaxInfo().then((data) => {
      updateData((prev) => {
        if (isEqual(data, prev)) return prev
        if (data.leaderBoard) {
          data.leaderBoard = data.leaderBoard.map((item, index) => ({
            ...item,
            rank: index + 1,
          }))
        }
        return data
      })
    })
  }, [updateData])

  return data
}
