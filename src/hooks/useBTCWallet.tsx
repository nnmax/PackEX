import { CURRENT_BTC_WALLET } from '@/constants'
import useOkxWallet from '@/hooks/useOkxWallet'
import useUnisatWallet from '@/hooks/useUnisatWallet'
import { createContext, useContext, useState } from 'react'

export type BTCWallet = 'unisat' | 'okx'

export type BTCNetwork = 'livenet' | 'testnet'

export type BTCWalletContextValue = {
  connect: (wallet: BTCWallet) => Promise<{
    address: string
    network: BTCNetwork
    publicKey: string | undefined
  }>
  switchNetwork: (wallet: BTCWallet, network: BTCNetwork) => Promise<void>
  currentWallet?: BTCWallet
  signMessage: (wallet: BTCWallet, message: string) => Promise<string>
  address: string | undefined
  network: BTCNetwork | undefined
  publicKey: string | undefined
  disconnect: (wallet: BTCWallet) => void
}

const BTCWalletContext = createContext<BTCWalletContextValue>({
  address: undefined,
  connect: async () => {
    throw new Error('BTCWalletContext provider is not found')
  },
  network: undefined,
  publicKey: undefined,
  signMessage: async () => {
    throw new Error('BTCWalletContext provider is not found')
  },
  switchNetwork: async () => {
    throw new Error('BTCWalletContext provider is not found')
  },
  currentWallet: undefined,
  disconnect: () => {},
})

export function BTCWalletProvider({ children }: { children: React.ReactNode }) {
  const unisat = useUnisatWallet()
  const okx = useOkxWallet()
  const [currentWallet, setCurrentWallet] = useState<BTCWallet>()

  const connect = async (wallet: BTCWallet) => {
    setCurrentWallet(wallet)
    if (wallet === 'unisat') {
      return unisat.connect()
    } else {
      return okx.connect()
    }
  }

  const disconnect = (wallet: BTCWallet) => {
    window.localStorage.removeItem(CURRENT_BTC_WALLET)
    if (wallet === 'unisat') {
      return unisat.disconnect()
    } else {
      return okx.disconnect()
    }
  }

  const switchNetwork = async (wallet: BTCWallet, network: BTCNetwork) => {
    if (wallet === 'unisat') {
      return unisat.switchNetwork(network)
    } else {
      return okx.switchNetwork(network)
    }
  }

  const signMessage = async (wallet: BTCWallet, message: string) => {
    if (wallet === 'unisat') {
      return unisat.signMessage(message)
    } else {
      return okx.signMessage(message)
    }
  }

  const value = {
    connect,
    switchNetwork,
    currentWallet,
    signMessage,
    address: currentWallet === 'unisat' ? unisat.address : okx.address,
    network: currentWallet === 'unisat' ? unisat.network : okx.network,
    publicKey: currentWallet === 'unisat' ? unisat.publicKey : okx.publicKey,
    disconnect,
  }

  return <BTCWalletContext.Provider value={value}>{children}</BTCWalletContext.Provider>
}

export default function useBTCWallet() {
  return useContext(BTCWalletContext)
}
