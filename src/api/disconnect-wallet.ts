import { MESSAGE_KEY, SIGNATURE_KEY, USER_KEY } from '@/constants'
import fetcher from '@/utils/fetcher'

export default function disconnectWallet() {
  window.localStorage.removeItem(USER_KEY)
  window.localStorage.removeItem(MESSAGE_KEY)
  window.localStorage.removeItem(SIGNATURE_KEY)

  return fetcher('/disconnect-wallet', {
    method: 'POST',
  })
}
