import fetcher from '@/utils/fetcher'

export type ConnectWalletParams = {
  address: string
  message?: string | null
  signature?: string | null
}

export type ConnectWalletData = {
  /** 邀请人 ID */
  inviterId?: number
  /** 用户邀请码 */
  invitationCode: number
  /** 用户 eth 钱包地址 */
  ethAddress: string
}

export default function connectWallet(params: ConnectWalletParams) {
  return fetcher<ConnectWalletData | string>('/api/connect-wallet', {
    method: 'POST',
    body: JSON.stringify(params),
  })
}
