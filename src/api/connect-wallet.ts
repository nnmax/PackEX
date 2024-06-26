import fetcher from '@/utils/fetcher'

export type ConnectWalletParams = {
  address: string
  message?: string | null
  signature?: string | null
}

export type ConnectWalletData = {
  /** 邀请人 ID */
  inviterId: number | null
  /** 用户邀请码 */
  invitationCode: string | null
  /** 用户 eth 钱包地址 */
  ethAddress: string
}

export default function connectWallet(params: ConnectWalletParams & { disabledErrorToast?: boolean }) {
  const { disabledErrorToast, ...restParams } = params
  return fetcher<ConnectWalletData | string>('/connect-wallet', {
    method: 'POST',
    body: JSON.stringify(restParams),
    disabledErrorToast,
  })
}
