import { useState, useEffect } from 'react'
import Introduce from './components/Introduce'
import DataTable from './components/DataTable'
import { getAssetList, type Asset } from '@/api'

export default function AssetPage() {
  const [totalVal, setTotalVal] = useState<number>(0)
  const [assetsList, setAssetsList] = useState<Asset[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    getAssetList()
      .then((data) => {
        const { totalValue, assetList = [] } = data
        if (totalValue) {
          setTotalVal(totalValue)
        }
        if (assetList && assetList.length > 0) {
          setAssetsList(assetList)
        }
        setLoading(false)
      })
      .catch(() => {
        console.log('asset list fetch error')
        setLoading(false)
      })
  }, [])

  return (
    <>
      <Introduce totalVal={totalVal} loading={loading} />
      <DataTable assetsList={assetsList} loading={loading} />
    </>
  )
}
