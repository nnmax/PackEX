import { useState, useEffect } from 'react'
import Introduce from './components/Introduce'
import DataTable from './components/DataTable'

export default function Asset() {
  const [pnlVal, setPnlVal] = useState<string | number>('23.11')
  const [totalVal, setTotalVal] = useState<string | number>('1233.21')

  useEffect(() => {
    // TODO: fetch data from interface & update the pnlVal
    setPnlVal('23.11')
    setTotalVal('1233.21')
  }, [])

  return (
    <>
      <Introduce pnlVal={pnlVal} totalVal={totalVal} />
      <DataTable />
    </>
  )
}
