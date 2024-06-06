import { useAccount } from 'wagmi'

export default function useIsSupportedChainId() {
  const { chainId } = useAccount()

  if (!chainId || !process.env.REACT_APP_CHAIN_ID) return false

  return chainId === Number(process.env.REACT_APP_CHAIN_ID)
}
