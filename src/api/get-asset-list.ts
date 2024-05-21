import fetcher from '@/utils/fetcher'

interface Asset {
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

export type AssetListData = {
  totalValue: number
  assetList: Asset[]
}

export default function getAssertList() {
  return fetcher<AssetListData>('/api/get-asset-list', {
    method: 'GET',
    disabledErrorToast: true,
  })
}
