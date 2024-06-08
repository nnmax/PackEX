import fetcher from '@/utils/fetcher'

export interface DepositParams {
  /**
   * 用户 BTC 钱包地址
   */
  address: string
  /**
   * runes id，/get-asset-list 接口已经返回
   */
  runesId: number
  /**
   * runes 数量
   */
  amount: string
  /**
   * /get-asset-list 接口已经返回 decimals
   */
  decimals: number
}

export interface DepositData {
  messageToBeSigned: string
}

export default function depositRunes(params: DepositParams) {
  return fetcher<DepositData>('/deposit-runes', {
    method: 'POST',
    body: JSON.stringify(params),
  })
}
