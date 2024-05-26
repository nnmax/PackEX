import fetcher from '@/utils/fetcher'

interface PoolAll {
  id: number
  poolName: string
  poolContract: string
  tvl: number
  volume24h: number
  volume7d: number
  apy: number
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

export type PoolAllItem = PoolAll

export type AllPoolListData = {
  allPools: PoolAll[]
}

export default function getAllPools() {
  return fetcher<AllPoolListData>('/get-all-pools', {
    method: 'GET',
    disabledErrorToast: true,
  })
}
