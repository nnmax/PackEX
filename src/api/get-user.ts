import { ConnectWalletData } from '@/api/connect-wallet'
import fetcher from '@/utils/fetcher'

export type GetUserData = ConnectWalletData

export default function getUser() {
  return fetcher<ConnectWalletData>('/api/get-current-login-user', {
    method: 'GET',
    disabledErrorToast: true,
    disabled401: true,
  })
}
