import { useContext } from 'react'
import { BTCWalletContext } from '@/providers/BTCWalletProvider'

export default function useBTCWallet() {
  return useContext(BTCWalletContext)
}
