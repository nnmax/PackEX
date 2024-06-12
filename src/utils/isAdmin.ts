import { ADMIN_WHITELIST_ADDRESS } from '@/constants'

export default function isAdmin(address: string | undefined | null) {
  if (!address) return false
  return ADMIN_WHITELIST_ADDRESS.findIndex((whiteItem) => whiteItem.toLowerCase() === address.toLowerCase()) !== -1
}
