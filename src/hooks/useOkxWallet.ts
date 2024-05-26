import { CURRENT_BTC_WALLET } from '@/constants'
import { BTCNetwork, BTCWallet } from '@/hooks/useBTCWallet'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify'

export default function useOkxWallet() {
  const [address, setAddress] = useState<string>()
  const [network, setNetwork] = useState<BTCNetwork>('livenet')
  const [publicKey, setPublicKey] = useState<string>()

  const getBasicInfo = useCallback(async () => {
    const okxwallet = (window as any).okxwallet

    const _publicKey = (await okxwallet.bitcoin.getPublicKey().catch((e: unknown) => {
      console.error(e)
      return undefined
    })) as string | undefined
    setPublicKey(_publicKey)

    const _network = (await okxwallet.bitcoin.getNetwork().catch((e: unknown) => {
      console.error(e)
      return 'livenet'
    })) as BTCNetwork
    setNetwork(_network)

    return {
      publicKey: _publicKey,
      network: _network,
    }
  }, [])

  const handleAccountsChanged = useCallback(
    (accounts: string[]) => {
      if (accounts.length) {
        if (accounts[0] !== address) {
          setAddress(accounts[0])
          getBasicInfo()
        }
      } else {
        setAddress(undefined)
      }
    },
    [address, getBasicInfo],
  )

  const connect = async () => {
    const okxwallet = (window as any).okxwallet
    if (!okxwallet) {
      toast.error('Okx wallet is not installed')
      throw new Error('Okx wallet is not installed')
    }

    try {
      const [_address] = (await okxwallet.bitcoin.requestAccounts()) as string[]
      setAddress(_address)
      const { network: _network, publicKey: _publicKey } = await getBasicInfo()
      return {
        address: _address,
        network: _network,
        publicKey: _publicKey,
      }
    } catch (error) {
      console.error(error)
      toast.error('Okx wallet is not connected')
      throw new Error('Okx wallet is not connected')
    }
  }

  const switchNetwork = async (network: BTCNetwork) => {
    const okxwallet = (window as any).okxwallet
    if (!okxwallet) {
      toast.error('Okx wallet is not installed')
      throw new Error('Okx wallet is not installed')
    }

    try {
      await okxwallet.bitcoin.switchNetwork(network)
    } catch (error) {
      console.error(error)
      toast.error('Failed to switch network')
      throw new Error('Failed to switch network')
    }
  }

  const signMessage = async (message: string) => {
    const okxwallet = (window as any).okxwallet
    if (!okxwallet) {
      toast.error('Okx wallet is not installed')
      throw new Error('Okx wallet is not installed')
    }

    try {
      const signature = (await okxwallet.bitcoin.signMessage(message)) as string
      return signature
    } catch (error) {
      console.error(error)
      toast.error('Failed to sign message')
      throw new Error('Failed to sign message')
    }
  }

  const disconnect = useCallback(async () => {
    const okxwallet = (window as any).okxwallet
    if (okxwallet) {
      await okxwallet.bitcoin.disconnect()
      okxwallet.bitcoin.off('accountsChanged', handleAccountsChanged)
    }
    setAddress(undefined)
  }, [handleAccountsChanged])

  const listenAccountsChanged = useCallback(() => {
    const okxwallet = (window as any).okxwallet
    if (!okxwallet) return () => {}

    okxwallet.bitcoin.getAccounts().then(handleAccountsChanged)
    okxwallet.bitcoin.on('accountsChanged', handleAccountsChanged)

    return () => {
      okxwallet.bitcoin.off('accountsChanged', handleAccountsChanged)
    }
  }, [handleAccountsChanged])

  useEffect(() => {
    const wallet = window.localStorage.getItem(CURRENT_BTC_WALLET) as BTCWallet | null
    if (wallet === 'okx') {
      // const offAccounts = listenAccountsChanged()

      return () => {
        // offAccounts()
      }
    }
    return
  }, [listenAccountsChanged])

  return {
    publicKey,
    address,
    network,
    connect,
    switchNetwork,
    signMessage,
    disconnect,
  }
}
