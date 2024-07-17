import { useQuery } from '@tanstack/react-query'
import fetcher from '@/utils/fetcher'

export interface Asset {
  id: number
  availableAmount: number
  totalAmount: number
  value: number
  changeToday: number
  originNetworkName: string
  originNetworkLogo: string
  chainId: number
  tokenContract: string
  name: string
  symbol: string
  decimals: number
  logoUri: string
  todayStartPrice: number
  swapFlag: 0 | 1
  depositFlag: 0 | 1
  withdrawFlag: 0 | 1
  runesId: string
}

export interface AssetListData {
  totalValue: number
  assetList: Asset[]
}

export default function getAssertList() {
  return fetcher<AssetListData>('/get-asset-list', {
    method: 'GET',
    disabledErrorToast: true,
  })
}

export function useAssetList() {
  return useQuery({
    queryKey: ['get-asset-list'],
    queryFn: getAssertList,
  })
}
