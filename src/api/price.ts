import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useAccount } from 'wagmi'
import type { UndefinedInitialDataOptions } from '@tanstack/react-query'

interface UsePriceOptions
  extends Omit<UndefinedInitialDataOptions<string | null, Error, string | null, string[]>, 'queryKey' | 'queryFn'> {}

export function usePrice(options: UsePriceOptions) {
  const { enabled = true, ...rest } = options
  const [rateLimited, setRateLimited] = useState(false)
  const { isConnected } = useAccount()

  return useQuery({
    enabled: !rateLimited && isConnected && enabled,
    ...rest,
    queryKey: ['price'],
    queryFn: async () => {
      return fetch('https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT')
        .then((response) => {
          if (response.status === 429) {
            setRateLimited(true)
            return null
          }
          if (response.ok) return response.json() as Promise<{ price?: string }>
          return null
        })
        .then((data) => {
          if (data && data.price) return data.price
          return null
        })
        .catch((error) => {
          console.debug('price fetching error', error)
          return null
        })
    },
  })
}
