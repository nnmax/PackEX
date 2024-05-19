import { useState, useEffect } from 'react'
import Introduce from './components/Introduce'
import DataTable from './components/DataTable'
import AssertRes from './mock'

export default function Asset() {
  const [totalVal, setTotalVal] = useState<number>(0)
  const [assetsList, setAssetsList] = useState<any[]>([])

  useEffect(() => {
    const { data = {} } = AssertRes
    const { totalValue, assetList = [] } = data as any
    if (totalValue) {
      setTotalVal(totalValue)
    }
    if (assetList && assetList.length > 0) {
      setAssetsList(assetList)
    }
  }, [])

  return (
    <>
      <Introduce totalVal={totalVal} />
      <DataTable assetsList={assetsList} />
    </>
  )
}
