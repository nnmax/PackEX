import { createContext, useState } from 'react'
import { CURRENT_BTC_WALLET, IS_PROD } from '@/constants'
import useOkxWallet from '@/hooks/useOkxWallet'
import useUnisatWallet from '@/hooks/useUnisatWallet'

export type BTCWallet = 'unisat' | 'okx'

export type BTCNetwork = 'livenet' | 'testnet'

interface BTCWalletContextValue {
  connect: (wallet: BTCWallet) => Promise<{
    address: string
    network: BTCNetwork | undefined
    publicKey: string | undefined
  }>
  verifyNetwork: (wallet: BTCWallet, network: BTCNetwork | undefined) => Promise<void>
  currentWallet?: BTCWallet
  signMessage: (wallet: BTCWallet, message: string) => Promise<string>
  signPsbt: (wallet: BTCWallet, psbt: string) => Promise<string>
  pushPsbt: (wallet: BTCWallet, psbtHex: string) => Promise<string>
  address: string | undefined
  network: BTCNetwork | undefined
  publicKey: string | undefined
  disconnect: (wallet: BTCWallet) => void
  getBasicInfo: (wallet: BTCWallet) => Promise<{
    address: string | undefined
    network: BTCNetwork | undefined
    publicKey: string | undefined
  }>
}

export const BTCWalletContext = createContext<BTCWalletContextValue>({
  address: undefined,
  connect: () => {
    throw new Error('BTCWalletContext provider is not found')
  },
  network: undefined,
  publicKey: undefined,
  signMessage: () => {
    throw new Error('BTCWalletContext provider is not found')
  },
  signPsbt: () => {
    throw new Error('BTCWalletContext provider is not found')
  },
  pushPsbt: () => {
    throw new Error('BTCWalletContext provider is not found')
  },
  verifyNetwork: () => {
    throw new Error('BTCWalletContext provider is not found')
  },
  currentWallet: undefined,
  disconnect: () => {},
  getBasicInfo: () => {
    return Promise.resolve({
      address: undefined,
      network: undefined,
      publicKey: undefined,
    })
  },
})

if (import.meta.env.DEV) {
  BTCWalletContext.displayName = 'BTCWalletContext'
}

export default function BTCWalletProvider({ children }: { children: React.ReactNode }) {
  const unisat = useUnisatWallet()
  const okx = useOkxWallet()
  const [currentWallet, setCurrentWallet] = useState<BTCWallet>()

  const connect = (wallet: BTCWallet) => {
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

  const verifyNetwork = async (wallet: BTCWallet, network: BTCNetwork | undefined) => {
    if (wallet === 'okx') return
    if (!network) {
      throw new Error('Network is not defined')
    }
    const isProdAndNotLivenet = IS_PROD && network !== 'livenet'
    const isDevAndNotTestnet = !IS_PROD && network !== 'testnet'
    if (wallet === 'unisat') {
      if (isProdAndNotLivenet) {
        await unisat.switchNetwork('livenet')
      } else if (isDevAndNotTestnet) {
        await unisat.switchNetwork('testnet')
      }
    }
  }

  const signMessage = (wallet: BTCWallet, message: string) => {
    if (wallet === 'unisat') {
      return unisat.signMessage(message)
    } else {
      return okx.signMessage(message)
    }
  }

  const signPsbt = (wallet: BTCWallet, psbt: string) => {
    if (wallet === 'unisat') {
      return unisat.signPsbt(psbt)
    } else {
      return okx.signPsbt(psbt)
    }
  }

  const pushPsbt = (wallet: BTCWallet, psbt: string) => {
    if (wallet === 'unisat') {
      return unisat.pushPsbt(psbt)
    } else {
      return okx.pushPsbt(psbt)
    }
  }

  const getBasicInfo = (wallet: BTCWallet) => {
    if (wallet === 'unisat') {
      return unisat.getBasicInfo()
    }
    return okx.getBasicInfo()
  }

  // eslint-disable-next-line react/jsx-no-constructed-context-values
  const value: BTCWalletContextValue = {
    connect,
    verifyNetwork,
    currentWallet,
    signMessage,
    signPsbt,
    pushPsbt,
    getBasicInfo,
    address: currentWallet === 'unisat' ? unisat.address : okx.address,
    network: currentWallet === 'unisat' ? unisat.network : okx.network,
    publicKey: currentWallet === 'unisat' ? unisat.publicKey : okx.publicKey,
    disconnect,
  }

  return <BTCWalletContext.Provider value={value}>{children}</BTCWalletContext.Provider>
}
