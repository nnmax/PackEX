import { useActiveWeb3React } from '@/hooks'
import { BigNumber } from '@ethersproject/bignumber'
import { useEffect, useState } from 'react'

export default function useGasPrice() {
  const { library } = useActiveWeb3React()
  const [gasPrice, setGasPrice] = useState<BigNumber>()

  useEffect(() => {
    if (!library) return
    library
      .getGasPrice()
      .then(setGasPrice)
      .catch(() => {
        setGasPrice(undefined)
      })
  }, [library])

  return gasPrice
}
