import fetcher from '@/utils/fetcher'

export type ConnectWalletParams = {
  address: string
  message?: string | null
  signature?: string | null
  invitation_code?: string | null
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
  const { invitation_code, ...restParams } = params
  return fetcher<ConnectWalletData | string>(
    `/api/connect-wallet${invitation_code ? '?invitation_code=' + invitation_code : ''}`,
    {
      method: 'POST',
      body: JSON.stringify(restParams),
    },
  )
}
