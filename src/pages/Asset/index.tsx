import Introduce from './components/Introduce'
import DataTable from './components/DataTable'
import { useAssetList } from '@/api/get-asset-list'

export default function AssetPage() {
  const { data, isLoading, isFetching } = useAssetList()

  return (
    <>
      <Introduce totalVal={data?.totalValue ?? 0} />
      <DataTable assetsList={data?.assetList ?? []} isLoading={isLoading} isFetching={isFetching} />
    </>
  )
}
