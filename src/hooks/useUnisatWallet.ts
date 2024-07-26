import { useCallback, useState } from 'react'
import { toast } from 'react-toastify'
import type { BTCNetwork } from '@/providers/BTCWalletProvider'

export default function useUnisatWallet() {
  const [address, setAddress] = useState<string>()
  const [network, setNetwork] = useState<BTCNetwork>('livenet')
  const [publicKey, setPublicKey] = useState<string>()

  const getBasicInfo = useCallback(async (): Promise<{
    publicKey: string | undefined
    network: BTCNetwork | undefined
    address: string | undefined
  }> => {
    const unisat = (window as any).unisat

    if (!unisat) {
      return {
        publicKey: undefined,
        network: undefined,
        address: undefined,
      }
    }

    const _publicKey = (await unisat.getPublicKey()) as string
    setPublicKey(_publicKey)

    const _network = (await unisat.getNetwork()) as BTCNetwork
    setNetwork(_network)

    const [_address] = (await unisat.getAccounts()) as [string]
    setAddress(_address)

    return {
      publicKey: _publicKey,
      network: _network,
      address: _address,
    }
  }, [])

  const getWallet = () => {
    const unisat = (window as any).unisat
    if (!unisat) {
      toast.error('UniSat wallet is not installed')
      throw new Error('UniSat wallet is not installed')
    }
    return unisat
  }

  const connect = async () => {
    const unisat = getWallet()

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

  const switchNetwork = async (_network: BTCNetwork) => {
    const unisat = getWallet()

    try {
      await unisat.switchNetwork(_network)
    } catch (error) {
      console.error(error)
      toast.error('Failed to switch network')
      throw new Error('Failed to switch network')
    }
  }

  const signMessage = async (message: string) => {
    const unisat = getWallet()

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
    const unisat = getWallet()

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
    const unisat = getWallet()

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
    setAddress(undefined)
    setPublicKey(undefined)
  }, [])

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
    getBasicInfo,
  }
}
