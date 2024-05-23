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

export type MyPooltListData = {
  myPools: Pool[]
}

export default function getMyPools() {
  return fetcher<MyPooltListData>('/get-my-pools', {
    method: 'GET',
    disabledErrorToast: true,
  })
}
