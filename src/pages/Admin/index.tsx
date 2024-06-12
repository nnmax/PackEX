import { useUserInfo } from '@/api/get-user'
import { useWithdrawRunesAdmin } from '@/api/withdraw-runes-admin'
import ShortenAddressCopy from '@/components/ShortenAddressCopy'
import isAdmin from '@/utils/isAdmin'
import clsx from 'clsx'
import { Cell, Column, Row, Table, TableBody, TableHeader } from 'react-aria-components'

export default function Admin() {
  const { data: userInfo, isLoading: isLoadingUserInfo } = useUserInfo()
  const {
    data: tableData,
    isLoading: isLoadingTableData,
    isFetching: isFetchingTableData,
  } = useWithdrawRunesAdmin({
    enabled: isAdmin(userInfo?.ethAddress),
  })

  if (isLoadingUserInfo) {
    return (
      <div className={'w-full flex justify-center h-full items-center'}>
        <span className={'loading loading-dots text-[50px] text-slate-400'} />
      </div>
    )
  }

  if (!isAdmin(userInfo?.ethAddress)) {
    return null
  }

  return (
    <div className="mt-8">
      <Table aria-label={'Withdraw Runes Data'} className={'w-full text-center text-xs'}>
        <TableHeader className={clsx('h-12 text-[#9E9E9E]', { 'loading text-2xl': isLoadingTableData })}>
          <Column isRowHeader>{'ETH Address'}</Column>
          <Column>{'BTC Address'}</Column>
          <Column>{'Symbol'}</Column>
          <Column>{'Amount'}</Column>
          <Column>{'Network Fee'}</Column>
          <Column>{'Amount Received'}</Column>
        </TableHeader>
        <TableBody
          items={tableData?.list}
          className={clsx('[&>tr]:h-[76px] [&>tr]:border-b [&>tr]:border-[#333] transition-opacity', {
            'opacity-40': isFetchingTableData,
          })}
        >
          {(item) => (
            <Row id={item.id}>
              <Cell>
                <ShortenAddressCopy address={item.ethAddress} />
              </Cell>
              <Cell>
                <ShortenAddressCopy address={item.btcAddress} isBtcAddress />
              </Cell>
              <Cell>{item.symbol}</Cell>
              <Cell>{item.amount}</Cell>
              <Cell>{item.amountNetworkFee}</Cell>
              <Cell>{item.amountReceived}</Cell>
            </Row>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
