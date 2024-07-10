import wagmiConfig from '@/constants/wagmiConfig'
import fetcher from '@/utils/fetcher'
import { disconnect } from 'wagmi/actions'

export default function disconnectWallet() {
  disconnect(wagmiConfig).catch((err) => {
    console.error('Failed to disconnect', err)
  })
  return fetcher('/disconnect-wallet', {
    method: 'POST',
    disabledErrorToast: true,
  })
    .catch(() => {})
    .finally(() => {
      if (['/', '/pax'].indexOf(window.location.pathname) === -1) {
        window.location.replace('/')
      }
    })
}
