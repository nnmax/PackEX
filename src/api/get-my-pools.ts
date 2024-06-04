import fetcher from '@/utils/fetcher'

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
  feeEarned: number | null
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
