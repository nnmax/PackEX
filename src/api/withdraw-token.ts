import fetcher from '@/utils/fetcher'

export type WithdrawTokenParams = {
  originNetworkName: string
  chainId: number
  tokenContract: string
  address: string
  amount: number
}

export type WithdrawTokenData = {
  contractMethod: {
    /**
     * 合约所在区块链的 id
     */
    chainId: number
    /**
     * 合约地址
     */
    destination: string
    /**
     * 调用合约时候的 ETH 值
     */
    value: number
    /**
     * 合约调用参数
     */
    callData: string
  }
}

export default function withdrawToken(params: WithdrawTokenParams) {
  return fetcher<WithdrawTokenData>('/api/withdraw-token', {
    method: 'POST',
    body: JSON.stringify(params),
  })
}