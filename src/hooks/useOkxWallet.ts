import { IS_PROD } from '@/constants'
import { BTCNetwork } from '@/hooks/useBTCWallet'
import { useCallback, useState } from 'react'
import { toast } from 'react-toastify'

export default function useOkxWallet() {
  const [address, setAddress] = useState<string>()
  const [network] = useState<BTCNetwork>('livenet')
  const [publicKey, setPublicKey] = useState<string>()

  const getWallet = () => {
    const okxwallet = (window as any).okxwallet
    if (!okxwallet) {
      toast.error('Okx wallet is not installed')
      throw new Error('Okx wallet is not installed')
    }
    return okxwallet[IS_PROD ? 'bitcoin' : 'bitcoinTestnet']
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

    if (IS_PROD) {
      const [_address] = (await okxwallet.bitcoin.getAccounts()) as [string]
      const _publicKey = (await okxwallet.bitcoin.getPublicKey()) as string
      setAddress(_address)
      setPublicKey(_publicKey)
      return {
        publicKey: _publicKey,
        network,
        address: _address,
      }
    }

    try {
      const { address: _address, publicKey: _publicKey } = (await okxwallet.bitcoinTestnet
        .getSelectedAccount()
        .catch(() => {
          return {
            address: undefined,
            publicKey: undefined,
          }
        })) as {
        publicKey: string | undefined
        address: string | undefined
      }

      setAddress(_address)
      setPublicKey(_publicKey)

      return {
        publicKey: _publicKey,
        network,
        address: _address,
      }
    } catch (error) {
      setAddress(undefined)
      setPublicKey(undefined)

      return {
        publicKey: undefined,
        network,
        address: undefined,
      }
    }
  }, [network])

  const connect = async () => {
    const okxwallet = getWallet()

    try {
      const { address: _address, publicKey: _publicKey } = (await okxwallet.connect()) as {
        address: string
        publicKey: string
      }
      setAddress(_address)
      setPublicKey(_publicKey)
      return {
        address: _address,
        network,
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
      const signature = (await okxwallet.signMessage(message)) as string
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
      const signature = (await okxwallet.signPsbt(psbtHex)) as string
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
      const txHash = (await okxwallet.pushPsbt(psbtHex)) as string
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
    setPublicKey(undefined)
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
