import Introduce from './components/Introduce'
import DataTable from './components/DataTable'
import { useAssetList } from '@/api/get-asset-list'
import useDocumentTitle from '@/hooks/useDocumentTitle'

export default function AssetPage() {
  const { data, isLoading } = useAssetList()
  useDocumentTitle('Assets')

  return (
    <>
      <Introduce totalVal={data?.totalValue ?? 0} />
      <DataTable assetsList={data?.assetList ?? []} isLoading={isLoading} />
    </>
  )
}
