import fetcher from '@/utils/fetcher'

interface PoolMy {
  id: number
  poolName: string | null
  poolContract: string
  tvl: number | null
  volume24h: number | null
  volume7d: number | null
  apy: number | null
  createTime: string | null
  token0Name: string | null
  token0Contract: string
  token0LogoUri: string
  token1Name: string | null
  token1Contract: string
  token1LogoUri: string
  token0Amount: number | null
  token1Amount: number | null
  poolShare: number | null
  feeEarned: number | null
  lpTokenAmount: number | null
}

export type PoolMyItem = PoolMy

export type MyPooltListData = {
  myPools: PoolMy[]
}

export default function getMyPools() {
  return fetcher<MyPooltListData>('/get-my-pools', {
    method: 'GET',
    disabledErrorToast: true,
  })
}
