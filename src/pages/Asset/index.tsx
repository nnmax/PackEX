import { useState, useEffect } from 'react'
import Introduce from './components/Introduce'
import DataTable from './components/DataTable'
import { getAssetList } from '@/api'
import { useAssetList, useTotalValue } from '@/state/user/hooks'
import { isEqual } from 'lodash-es'

export default function AssetPage() {
  const [assetsList, updateAssetsList] = useAssetList()
  const [totalValue, updateTotalValue] = useTotalValue()
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    setLoading(true)
    getAssetList()
      .then((data) => {
        updateTotalValue(data.totalValue)
        updateAssetsList((prev) => {
          if (isEqual(prev, data.assetList)) return prev
          return data.assetList
        })
      })
      .finally(() => {
        setLoading(false)
      })
  }, [updateAssetsList, updateTotalValue])

  return (
    <>
      <Introduce totalVal={totalValue} />
      <DataTable assetsList={assetsList} loading={assetsList.length <= 0 && loading} />
    </>
  )
}
