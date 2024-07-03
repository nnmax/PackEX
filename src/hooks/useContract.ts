import { Contract } from 'ethers'
import { ChainId, WETH } from '@nnmax/uniswap-sdk-v2'
import { useEffect, useState } from 'react'
import ENS_ABI from '../constants/abis/ens-registrar.json'
import ENS_PUBLIC_RESOLVER_ABI from '../constants/abis/ens-public-resolver.json'
import { ERC20_BYTES32_ABI } from '../constants/abis/erc20'
import ERC20_ABI from '../constants/abis/erc20.json'
import WETH_ABI from '../constants/abis/weth.json'
import { MULTICALL_ABI, MULTICALL_NETWORKS } from '../constants/multicall'
import { getContract } from '../utils'
import { useAccount, useChainId } from 'wagmi'
import { useEthersProvider } from '@/hooks/useEthersProvider'

// returns null on errors
function useContract(address: string | undefined, ABI: any, withSignerIfPossible = true) {
  const { address: account } = useAccount()
  const provider = useEthersProvider()
  const [contract, setContract] = useState<Contract | null>(null)

  useEffect(() => {
    if (!address || !ABI || !provider) {
      setContract(null)
      return
    }
    try {
      getContract(address, ABI, provider, withSignerIfPossible && account ? account : undefined).then(setContract)
    } catch (error) {
      console.error('Failed to get contract', error)
      setContract(null)
    }
  }, [ABI, account, address, provider, withSignerIfPossible])

  return contract
}

export function useTokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(tokenAddress, ERC20_ABI, withSignerIfPossible)
}

export function useWETHContract(withSignerIfPossible?: boolean): Contract | null {
  const chainId: ChainId = useChainId()
  return useContract(chainId ? WETH[chainId].address : undefined, WETH_ABI, withSignerIfPossible)
}

export function useENSRegistrarContract(withSignerIfPossible?: boolean): Contract | null {
  return useContract('0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e', ENS_ABI, withSignerIfPossible)
}

export function useENSResolverContract(address: string | undefined, withSignerIfPossible?: boolean): Contract | null {
  return useContract(address, ENS_PUBLIC_RESOLVER_ABI, withSignerIfPossible)
}

export function useBytes32TokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(tokenAddress, ERC20_BYTES32_ABI, withSignerIfPossible)
}

export function useMulticallContract(): Contract | null {
  const chainId: ChainId = useChainId()
  return useContract(chainId && MULTICALL_NETWORKS[chainId], MULTICALL_ABI, false)
}
