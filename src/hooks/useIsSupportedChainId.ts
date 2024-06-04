import { useAccount } from 'wagmi'

export default function useIsSupportedChainId() {
  const { chainId } = useAccount()
  console.log('%c [ useAccount chainId ]-5', 'font-size:13px; background:pink; color:#bf2c9f;', chainId)

  if (!chainId || !process.env.REACT_APP_CHAIN_ID) return false

  return chainId === Number(process.env.REACT_APP_CHAIN_ID)
}
