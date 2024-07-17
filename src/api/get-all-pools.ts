import { useQuery } from '@tanstack/react-query'
import fetcher from '@/utils/fetcher'
import type { UndefinedInitialDataOptions } from '@tanstack/react-query'

export interface PoolAllItem {
  id: number
  poolName: string
  poolContract: string
  tvl: number
  volume24h: number
  volume7d: number
  apr: number
  createTime: string
  token0Name: string
  token0Contract: string
  token0LogoUri: string
  token1Name: string
  token1Contract: string
  token1LogoUri: string
  token0Amount: number | null
  token1Amount: number | null
  poolShare: number | null
  feeEarned: number | null
  lpTokenAmount: number | null
}

export interface AllPoolListData {
  allPools: PoolAllItem[]
}

export default function getAllPools() {
  return fetcher<AllPoolListData>('/get-all-pools', {
    method: 'GET',
  })
}

export function useAllPools(options?: Omit<UndefinedInitialDataOptions<AllPoolListData>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: ['get-all-pools'],
    queryFn: getAllPools,
    ...options,
  })
}
