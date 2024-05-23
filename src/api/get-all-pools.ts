import fetcher from '@/utils/fetcher'

interface Pool {
  availableAmount: number
  totalAmount: number
  value: number
  changeToday: number
  name: string
  symbol: string
  logoUri: string
  todayStartPrice: number
  swapFlag: 0 | 1
  depositFlag: 0 | 1
  withdrawFlag: 0 | 1
}

export type AllPooltListData = {
  allPools: Pool[]
}

export default function getAllPools() {
  return fetcher<AllPooltListData>('/get-all-pools', {
    method: 'GET',
    disabledErrorToast: true,
  })
}
