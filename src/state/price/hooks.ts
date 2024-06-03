import { AppState } from '@/state'
import { useSelector } from 'react-redux'

export function usePriceState(): AppState['price']['price'] {
  return useSelector<AppState, AppState['price']['price']>((state) => state.price.price)
}
