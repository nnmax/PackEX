import { BTCNetwork } from '@/hooks/useBTCWallet'
import { useCallback, useState } from 'react'
import { toast } from 'react-toastify'

export default function useOkxWallet() {
  const [address, setAddress] = useState<string>()
  const [network, setNetwork] = useState<BTCNetwork>('livenet')
  const [publicKey, setPublicKey] = useState<string>()

  const getWallet = () => {
    const okxwallet = (window as any).okxwallet
    if (!okxwallet) {
      toast.error('Okx wallet is not installed')
      throw new Error('Okx wallet is not installed')
    }
    return okxwallet
  }

  const getBasicInfo = useCallback(async (): Promise<{
    publicKey: string | undefined
    network: BTCNetwork | undefined
    address: string | undefined
  }> => {
    const okxwallet = (window as any).okxwallet

    if (!okxwallet) {
      return {
        publicKey: undefined,
        network: undefined,
        address: undefined,
      }
    }

    const _publicKey = (await okxwallet.bitcoin.getPublicKey()) as string
    setPublicKey(_publicKey)

    const _network = (await okxwallet.bitcoin.getNetwork()) as 'livenet'
    setNetwork(_network)

    const [_address] = (await okxwallet.bitcoin.getAccounts()) as [string]
    setAddress(_address)

    return {
      publicKey: _publicKey,
      network: _network,
      address: _address,
    }
  }, [])

  const connect = async () => {
    const okxwallet = getWallet()

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

  const signMessage = async (message: string) => {
    const okxwallet = getWallet()

    try {
      const signature = (await okxwallet.bitcoin.signMessage(message)) as string
      return signature
    } catch (error) {
      console.error(error)
      toast.error('Failed to sign message')
      throw new Error('Failed to sign message')
    }
  }

  const signPsbt = async (psbtHex: string) => {
    const okxwallet = getWallet()

    try {
      const signature = (await okxwallet.bitcoin.signPsbt(psbtHex)) as string
      return signature
    } catch (error) {
      console.error(error)
      toast.error('Failed to sign psbt')
      throw new Error('Failed to sign psbt')
    }
  }

  const pushPsbt = async (psbtHex: string) => {
    const okxwallet = getWallet()

    try {
      const txHash = (await okxwallet.bitcoin.pushPsbt(psbtHex)) as string
      return txHash
    } catch (error) {
      console.error(error)
      toast.error('Failed to sign psbt')
      throw new Error('Failed to sign psbt')
    }
  }

  const disconnect = useCallback(async () => {
    const okxwallet = (window as any).okxwallet
    if (okxwallet) {
      await okxwallet.bitcoin.disconnect()
    }
    setAddress(undefined)
  }, [])

  return {
    publicKey,
    address,
    network,
    connect,
    signMessage,
    signPsbt,
    pushPsbt,
    disconnect,
    getBasicInfo,
  }
}
