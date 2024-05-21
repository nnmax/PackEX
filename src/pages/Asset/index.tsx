import { useState, useEffect } from 'react'
import Introduce from './components/Introduce'
import DataTable from './components/DataTable'
// import AssertRes from './mock'
import { getAssetList, AssetListData } from '@/api'

export default function Asset() {
  const [totalVal, setTotalVal] = useState<number>(0)
  const [assetsList, setAssetsList] = useState<any[]>([])

  useEffect(() => {
    getAssetList()
      .then((data: AssetListData) => {
        const { totalValue, assetList = [] } = data
        if (totalValue) {
          setTotalVal(totalValue)
        }
        if (assetList && assetList.length > 0) {
          setAssetsList(assetList)
        }
      })
      .catch(() => {
        console.log('asset list fetch error')
      })
  }, [])

  return (
    <>
      <Introduce totalVal={totalVal} />
      <DataTable assetsList={assetsList} />
    </>
  )
}
