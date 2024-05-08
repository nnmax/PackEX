import { useEffect } from 'react'
import Introduce from './components/Introduce'
import DataTable from './components/DataTable'

export default function Asset() {
  useEffect(() => {
    // TODO: fetch data from interface
  }, [])
  return (
    <>
      <Introduce />
      <DataTable />
    </>
  )
}
