import { useActiveWeb3React } from '@/hooks'
import useInterval from '@/hooks/useInterval'
import useIsWindowVisible from '@/hooks/useIsWindowVisible'
import { AppDispatch } from '@/state'
import { updatePrice } from '@/state/price/actions'
import { useState } from 'react'
import { useDispatch } from 'react-redux'

export default function PriceUpdater(): null {
  const isWindowVisible = useIsWindowVisible()
  const [rateLimited, setRateLimited] = useState(false)
  const dispatch = useDispatch<AppDispatch>()
  const { library } = useActiveWeb3React()

  const fetchPrice = () => {
    if (!isWindowVisible || rateLimited) return
    fetch('https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT')
      .then((response) => {
        if (response.status === 429) {
          setRateLimited(true)
          return null
        }

        if (response.ok) {
          return response.json() as Promise<{ price?: string }>
        }

        return null
      })
      .then((data) => {
        if (data && data.price) {
          dispatch(updatePrice({ price: data.price }))
        }
      })
      .catch((error) => {
        console.debug('price fetching error', error)
      })
  }

  useInterval(fetchPrice, library ? 1000 * 30 : null)

  return null
}
