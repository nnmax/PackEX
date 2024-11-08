import { BrowserProvider } from 'ethers'
import { useMemo } from 'react'
import { useClient, useConnectorClient } from 'wagmi'
import type { Client, Transport } from 'viem'

const providers = new WeakMap<Client, BrowserProvider>()

function clientToProvider(client?: Client<Transport, any>, chainId?: number) {
  if (!client) return undefined
  const { chain, transport } = client
  const network = chain
    ? {
        chainId: chain.id,
        name: chain.name,
        ensAddress: 'ensRegistry' in chain.contracts ? chain.contracts.ensRegistry.address : undefined,
      }
    : chainId
      ? { chainId, name: 'Unsupported' }
      : undefined
  if (!network) return undefined

  if (providers.has(client)) return providers.get(client)
  const provider = new BrowserProvider(transport, network)
  providers.set(client, provider)
  return provider
}

/** Hook to convert a viem Client to an ethers.js Provider with a default disconnected Network fallback. */
export function useEthersProvider({ chainId }: { chainId?: number } = {}) {
  const { data: client } = useConnectorClient({ chainId })
  const disconnectedClient = useClient({ chainId })
  return useMemo(() => clientToProvider(client ?? disconnectedClient, chainId), [chainId, client, disconnectedClient])
}

/** Hook to convert a connected viem Client to an ethers.js Provider. */
export function useEthersWeb3Provider({ chainId }: { chainId?: number } = {}) {
  const { data: client } = useConnectorClient({ chainId })
  return useMemo(() => clientToProvider(client, chainId), [chainId, client])
}
