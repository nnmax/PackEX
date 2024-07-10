import { useAccount } from 'wagmi'

export default function useIsSupportedChainId() {
  const { chainId } = useAccount()

  if (!chainId || !import.meta.env.VITE_CHAIN_ID) return false

  return chainId === Number(import.meta.env.VITE_CHAIN_ID)
}
