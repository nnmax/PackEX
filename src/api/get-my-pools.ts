import { usePoolMyList } from '@/state/user/hooks'
import fetcher from '@/utils/fetcher'
import { isEqual } from 'lodash-es'
import { useCallback, useEffect, useState } from 'react'

export interface PoolMyItem {
  id: number
  poolName: string | null
  poolContract: string
  tvl: number | null
  volume24h: number | null
  volume7d: number | null
  apy: number | null
  createTime: string | null
  token0Name: string
  token0Contract: string
  token0LogoUri: string
  token1Name: string
  token1Contract: string
  token1LogoUri: string
  token0Amount: number | null
  token1Amount: number | null
  poolShare: number | null
  paxEarnedToday: number | null
  lpTokenAmount: number | null
}

export type MyPoolListData = {
  myPools: PoolMyItem[]
}

export default function getMyPools() {
  return fetcher<MyPoolListData>('/get-my-pools', {
    method: 'GET',
  })
}

export function useMyPools(disabledAutoFetch?: boolean) {
  const [loading, setLoading] = useState(false)
  const [poolMyList, updatePoolMyList] = usePoolMyList()

  const refetch = useCallback(async () => {
    setLoading(true)
    return await getMyPools()
      .then((data: MyPoolListData) => {
        updatePoolMyList((prev) => {
          if (isEqual(prev, data.myPools)) return prev
          return data.myPools
        })
        return data.myPools
      })
      .finally(() => {
        setLoading(false)
      })
  }, [updatePoolMyList])

  useEffect(() => {
    if (disabledAutoFetch) return
    refetch()
  }, [disabledAutoFetch, refetch])

  return {
    loading,
    poolMyList,
    refetch,
  }
}
