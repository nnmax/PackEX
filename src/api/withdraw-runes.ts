import { useMutation } from '@tanstack/react-query'
import fetcher from '@/utils/fetcher'

export interface WithdrawRunesParams {
  originNetworkName: string
  chainId: number
  tokenContract: string
  btcAddress: string
  amount: number
  amountNetworkFee: number
  amountReceived: number
}

export interface WithdrawRunesData {
  contractMethod: {
    /**
     * 合约所在区块链的 id
     */
    chainId: number
    /**
     * 合约地址
     */
    destination: `0x${string}`
    /**
     * 调用合约时候的 ETH 值
     */
    value: number
    /**
     * 合约调用参数
     */
    callData: `0x${string}`
  }
  requestData: {
    originNetworkName: string
    chainId: number
    tokenContract: string
    btcAddress: string
    amount: number
    amountNetworkFee: number
    amountReceived: number
  }
}

export default function withdrawRunes(params: WithdrawRunesParams) {
  return fetcher<WithdrawRunesData>('/withdraw-runes', {
    method: 'POST',
    body: JSON.stringify(params),
  })
}

export function useWithdrawRunes() {
  return useMutation({
    mutationKey: ['withdraw-runes'],
    mutationFn: withdrawRunes,
  })
}
