import fetcher from '@/utils/fetcher'

export type ConnectBTCWalletParams = {
  address: string
  message?: string | null
  signature?: string | null
  publicKey?: string | null
}

export type ConnectBTCWalletData = {
  result?: 'success'
  message?: string
}

export default function connectBTCWallet(params: ConnectBTCWalletParams) {
  return fetcher<ConnectBTCWalletData>('/btc-connect-wallet', {
    method: 'POST',
    body: JSON.stringify(params),
  })
}
