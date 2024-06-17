import { CURRENT_BTC_WALLET } from '@/constants'
import { BTCNetwork, BTCWallet } from '@/hooks/useBTCWallet'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify'

export default function useUnisatWallet() {
  const [address, setAddress] = useState<string>()
  const [network, setNetwork] = useState<BTCNetwork>('livenet')
  const [publicKey, setPublicKey] = useState<string>()
  // const [balance, setBalance] = useState({
  //   confirmed: 0,
  //   unconfirmed: 0,
  //   total: 0,
  // })

  const getBasicInfo = useCallback(async () => {
    const unisat = (window as any).unisat

    const _publicKey = (await unisat.getPublicKey().catch((e: unknown) => {
      console.error(e)
      return undefined
    })) as string | undefined
    setPublicKey(_publicKey)

    const _network = (await unisat.getNetwork().catch((e: unknown) => {
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
    const unisat = (window as any).unisat
    if (!unisat) {
      toast.error('UniSat wallet is not installed')
      throw new Error('UniSat wallet is not installed')
    }

    try {
      const [_address] = (await unisat.requestAccounts()) as string[]
      setAddress(_address)
      const { network: _network, publicKey: _publicKey } = await getBasicInfo()
      return {
        address: _address,
        network: _network,
        publicKey: _publicKey,
      }
    } catch (error) {
      console.error(error)
      toast.error('UniSat wallet is not connected')
      throw new Error('UniSat wallet is not connected')
    }
  }

  const switchNetwork = async (network: BTCNetwork) => {
    const unisat = (window as any).unisat
    if (!unisat) {
      toast.error('UniSat wallet is not installed')
      throw new Error('UniSat wallet is not installed')
    }

    try {
      await unisat.switchNetwork(network)
    } catch (error) {
      console.error(error)
      toast.error('Failed to switch network')
      throw new Error('Failed to switch network')
    }
  }

  const signMessage = async (message: string) => {
    const unisat = (window as any).unisat
    if (!unisat) {
      toast.error('UniSat wallet is not installed')
      throw new Error('UniSat wallet is not installed')
    }

    try {
      const signature = (await unisat.signMessage(message)) as string
      return signature
    } catch (error) {
      console.error(error)
      toast.error('Failed to sign message')
      throw new Error('Failed to sign message')
    }
  }

  const signPsbt = async (psbtHex: string) => {
    const unisat = (window as any).unisat
    if (!unisat) {
      toast.error('UniSat wallet is not installed')
      throw new Error('UniSat wallet is not installed')
    }

    try {
      const signature = (await unisat.signPsbt(psbtHex)) as string
      return signature
    } catch (error) {
      console.error(error)
      toast.error('Failed to sign psbt')
      throw new Error('Failed to sign psbt')
    }
  }

  const pushPsbt = async (psbtHex: string) => {
    const unisat = (window as any).unisat
    if (!unisat) {
      toast.error('UniSat wallet is not installed')
      throw new Error('UniSat wallet is not installed')
    }

    try {
      const txHash = (await unisat.pushPsbt(psbtHex)) as string
      return txHash
    } catch (error) {
      console.error(error)
      toast.error('Failed to push psbt')
      throw new Error('Failed to push psbt')
    }
  }

  const disconnect = useCallback(() => {
    const unisat = (window as any).unisat
    setAddress(undefined)
    if (unisat) {
      unisat.removeListener('accountsChanged', handleAccountsChanged)
      unisat.removeListener('networkChanged', getBasicInfo)
    }
  }, [getBasicInfo, handleAccountsChanged])

  const listenAccountsChanged = useCallback(() => {
    const unisat = (window as any).unisat
    if (!unisat) return () => {}
    unisat.getAccounts().then(handleAccountsChanged)
    unisat.on('accountsChanged', handleAccountsChanged)

    return () => {
      unisat.removeListener('accountsChanged', handleAccountsChanged)
    }
  }, [handleAccountsChanged])

  const listenNetworkChanged = useCallback(() => {
    const unisat = (window as any).unisat
    if (!unisat) return () => {}
    unisat.on('networkChanged', getBasicInfo)
    return () => {
      unisat.removeListener('networkChanged', getBasicInfo)
    }
  }, [getBasicInfo])

  useEffect(() => {
    const wallet = window.localStorage.getItem(CURRENT_BTC_WALLET) as BTCWallet | null
    if (wallet === 'unisat') {
      // const offAccounts = listenAccountsChanged()
      // const offNetwork = listenNetworkChanged()

      return () => {
        // offAccounts()
        // offNetwork()
      }
    }
    return
  }, [listenAccountsChanged, listenNetworkChanged])

  return {
    address,
    network,
    connect,
    publicKey,
    switchNetwork,
    signMessage,
    signPsbt,
    pushPsbt,
    disconnect,
  }
}
