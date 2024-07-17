import { disconnect } from 'wagmi/actions'
import wagmiConfig from '@/constants/wagmiConfig'
import { API_BASE } from '@/constants'

export default function disconnectWallet() {
  disconnect(wagmiConfig).catch((err) => {
    console.error('Failed to disconnect', err)
  })
  return fetch(`${API_BASE}/disconnect-wallet`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .catch(() => {})
    .finally(() => {
      if (['/', '/pax'].indexOf(window.location.pathname) === -1) {
        window.location.replace('/')
      }
    })
}
