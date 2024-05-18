// import { ConnectWalletData } from '@/api/connect-wallet'
import fetcher from '@/utils/fetcher'

// export type GetUserData = ConnectWalletData

export default function getAssertList() {
  return fetcher<any>('/api/get-asset-list', {
    method: 'GET',
    disabledErrorToast: true,
  })
}
