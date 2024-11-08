import { useQuery } from '@tanstack/react-query'
import { useAccount } from 'wagmi'
import fetcher from '@/utils/fetcher'
import type { ConnectWalletData } from '@/api/connect-wallet'

export type GetUserData = ConnectWalletData

export default function getUser() {
  return fetcher<ConnectWalletData>('/get-current-login-user', {
    method: 'GET',
    disabledErrorToast: true,
  })
}

export function useUserInfo() {
  const { isConnected } = useAccount()

  return useQuery({
    queryKey: ['get-current-login-user'],
    queryFn: getUser,
    select: (data) => (isConnected ? data : undefined),
  })
}
